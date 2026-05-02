'use server';

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { syncKeapTags } from "./keap";
import { notifyAdminEmailSynced, notifyAdminAccountLinked } from "./admin-notifications";
import { notifyUserEmailChanged } from "./user-notifications";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 📧 Sincroniza el cambio de email de Clerk hacia Supabase y Keap
 */
export async function updateUserEmail(clerkId: string, newEmail: string, fromWebhook = false) {
  try {
    if (!fromWebhook) {
      const { userId } = await auth();
      if (!userId || userId !== clerkId) throw new Error("No autorizado");
    }

    const emailFormatted = newEmail.toLowerCase().trim();

    // 1. Obtener datos actuales para propagar el cambio
    const { data: existing } = await supabaseAdmin
      .from('registrations')
      .select('id, email, event_data, selected_events, event_statuses, first_name, last_name, phone, phone_code')
      .eq('clerk_id', clerkId)
      .single();

    if (!existing) throw new Error("Registro no encontrado");
    const oldEmail = existing.email;

    // 🛑 Válvula de seguridad: Si el correo es el mismo, no procesar nada
    if (oldEmail.toLowerCase().trim() === emailFormatted) {
      return { success: true, message: "El correo ya está actualizado" };
    }

    let updatedEventData = existing.event_data || {};
    if (existing.event_data) {
      Object.keys(updatedEventData).forEach(eventId => {
        if (updatedEventData[eventId]) updatedEventData[eventId].email = emailFormatted;
      });
    }

    // 2. Actualizar Supabase
    await supabaseAdmin.from('registrations').update({
      email: emailFormatted,
      event_data: updatedEventData,
      updated_at: new Date().toISOString()
    }).eq('clerk_id', clerkId);

    // 3. Sincronizar Keap (Tags confirmados y pendientes)
    if (existing.selected_events?.length > 0) {
      const { data: events } = await supabaseAdmin.from('events').select('id, keap_tag_id, keap_pending_tag_id').in('id', existing.selected_events);
      
      const confirmedTags: string[] = [];
      const pendingTags: string[] = [];

      events?.forEach(e => {
        const status = existing.event_statuses?.[e.id];
        if (status === 'confirmed' && e.keap_tag_id) confirmedTags.push(e.keap_tag_id);
        if (status === 'pending' && e.keap_pending_tag_id) pendingTags.push(e.keap_pending_tag_id);
      });

      const allTags = [...confirmedTags, ...pendingTags];

      if (allTags.length > 0) {
        // A. Eliminar tags del correo viejo (si es diferente al nuevo)
        if (oldEmail && oldEmail.toLowerCase() !== emailFormatted) {
          await syncKeapTags({
            email: oldEmail,
            firstName: existing.first_name,
            lastName: existing.last_name,
            phone: existing.phone,
            phoneCode: existing.phone_code
          }, allTags, []); // Pasamos todos los tags actuales como "old" y nada como "new" para que los borre
        }

        // B. Asegurar que el correo nuevo tenga todos los tags (crea contacto si no existe)
        await syncKeapTags({
          email: emailFormatted,
          firstName: existing.first_name,
          lastName: existing.last_name,
          phone: existing.phone,
          phoneCode: existing.phone_code
        }, [], allTags);
      }
    }

    // 4. Notificaciones
    await notifyAdminEmailSynced(oldEmail, emailFormatted);
    await notifyUserEmailChanged({ registrationId: existing.id, clerkId }, oldEmail, emailFormatted);
    
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 👤 Asegura que un usuario de Clerk tenga su espejo en Supabase (con o sin eventos)
 */
export async function upsertClerkUser(data: { 
  email: string, 
  clerkId: string, 
  firstName?: string | null, 
  lastName?: string | null 
}) {
  try {
    const emailFormatted = data.email.toLowerCase().trim();

    // 1. Intentar vincular si existe (usando UPSERT para ser atómicos)
    const { data: existing } = await supabaseAdmin
      .from('registrations')
      .select('id, clerk_id')
      .eq('email', emailFormatted)
      .single();

    if (existing) {
      // Si ya existe y no tiene clerkId, se lo ponemos
      if (!existing.clerk_id) {
        await supabaseAdmin.from('registrations').update({
          clerk_id: data.clerkId,
          updated_at: new Date().toISOString()
        }).eq('id', existing.id);
      }
      return { success: true, linked: true };
    }

    // 2. Si no existe, creamos el registro base "limpio"
    const { error } = await supabaseAdmin.from('registrations').insert([{
      email: emailFormatted,
      clerk_id: data.clerkId,
      first_name: data.firstName || '',
      last_name: data.lastName || '',
      selected_events: [],
      event_statuses: {},
      event_data: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }]);

    if (error) throw error;

    await notifyAdminAccountLinked(emailFormatted);
    return { success: true, created: true };
  } catch (err: any) {
    console.error("❌ Error en upsertClerkUser:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * 🆔 Obtiene el ID de registro de Supabase a partir del Clerk ID
 */
export async function getRegistrationId(clerkId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
    
    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}


import "server-only";

import { createClerkClient } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { syncKeapTags } from "@/lib/keap";
import { notifyAdminRegistrationDeleted } from "@/lib/notifications/admin-notifications";
import { broadcastToUser } from "@/app/actions/utils-realtime";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });

/**
 * 🗑️ Elimina un registro permanentemente (Purga Selectiva) — lógica interna sin verificación de permisos.
 * Llamadores: `deleteRegistration` (panel, verifica admin) y el webhook firmado de Clerk (`user.deleted`).
 * @param actorEmail Quién ejecuta la purga (para auditoría).
 * @param deleteClerkUser false cuando el usuario ya fue borrado en Clerk (webhook).
 */
export async function purgeRegistration(id: string, actorEmail: string, deleteClerkUser = true) {
  try {
    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('email, clerk_id, selected_events, first_name, last_name')
      .eq('id', id)
      .single();

    if (!reg) throw new Error("Registro no encontrado");

    // 1. Quitar TODOS los tags relacionados en Keap (Confirmados y Pendientes)
    if (reg.selected_events?.length > 0) {
      const { data: events } = await supabaseAdmin
        .from('events')
        .select('keap_tag_id, keap_pending_tag_id')
        .in('id', reg.selected_events);

      if (events) {
        const tagsToRemove = [
          ...events.map(e => e.keap_tag_id),
          ...events.map(e => e.keap_pending_tag_id)
        ].filter(Boolean) as string[];

        if (tagsToRemove.length > 0) {
          await syncKeapTags(
            { email: reg.email, firstName: reg.first_name, lastName: reg.last_name },
            tagsToRemove, // oldTagIds (quitar)
            [] // newTagIds (poner)
          );
        }
      }
    }

    // 2. Eliminar de Clerk (si tiene cuenta vinculada)
    if (deleteClerkUser && reg.clerk_id) {
      try {
        await clerk.users.deleteUser(reg.clerk_id);
      } catch (clerkError: any) {
        console.error("⚠️ Error al borrar usuario de Clerk (posiblemente ya no existe):", clerkError.message);
      }
    }

    // 3. Eliminar Notificaciones en Supabase (la tabla usa user_id = Clerk ID y registration_id)
    const notifFilter = [`registration_id.eq.${id}`, reg.clerk_id ? `user_id.eq.${reg.clerk_id}` : null].filter(Boolean).join(',');
    await supabaseAdmin.from('notifications').delete().or(notifFilter);

    // 4. Eliminar Registro en Supabase
    await supabaseAdmin.from('registrations').delete().eq('id', id);

    // 5. Obtener detalles de eventos para la notificación
    const { data: eventsData } = await supabaseAdmin
      .from('events')
      .select('title, city, country, start_date, categories(name)')
      .in('id', reg.selected_events || []);

    // 6. Notificar a los administradores
    await notifyAdminRegistrationDeleted(actorEmail, reg.email, eventsData || []);

    // 7. 📢 Notificar al Usuario en TIEMPO REAL (Reset completo)
    await broadcastToUser([id, reg.clerk_id, reg.email].filter(Boolean) as string[], {
      type: 'notification',
      title: "Registro Removido",
      message: "Tu registro ha sido eliminado por un administrador.",
      selected_events: [] // 🚀 Esto activará el reset en el cliente
    });

    return { success: true };
  } catch (err: any) {
    console.error("❌ Error en Purga de Usuario:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 🗑️ Elimina un registro basado en el clerk_id (webhook `user.deleted` de Clerk)
 */
export async function deleteRegistrationByClerkId(clerkId: string) {
  try {
    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();

    if (!reg) return { success: true }; // Ya no existe
    return await purgeRegistration(reg.id, "el sistema (cuenta eliminada en Clerk)", false);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

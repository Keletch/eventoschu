'use server';

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { syncKeapTags } from "./keap";
import { notifyAdminEmailSynced, notifyAdminAccountLinked } from "./notifications";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 📧 Sincroniza el cambio de email de Clerk hacia Supabase y Keap
 */
export async function updateUserEmail(clerkId: string, newEmail: string) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== clerkId) throw new Error("No autorizado");

    const emailFormatted = newEmail.toLowerCase().trim();

    // 1. Obtener datos actuales para propagar el cambio
    const { data: existing } = await supabaseAdmin
      .from('registrations')
      .select('event_data, selected_events, event_statuses, first_name, last_name, phone, phone_code')
      .eq('clerk_id', clerkId)
      .single();

    let updatedEventData = existing?.event_data || {};
    if (existing?.event_data) {
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

    // 3. Sincronizar Keap (solo tags confirmados)
    if (existing) {
      const confirmedIds = (existing.selected_events || []).filter((id: string) => existing.event_statuses?.[id] === 'confirmed');
      if (confirmedIds.length > 0) {
        const { data: events } = await supabaseAdmin.from('events').select('keap_tag_id').in('id', confirmedIds);
        const confirmedTags = events?.map(e => e.keap_tag_id).filter(Boolean) || [];
        if (confirmedTags.length > 0) {
          await syncKeapTags({
            email: emailFormatted,
            firstName: existing.first_name,
            lastName: existing.last_name,
            phone: existing.phone,
            phoneCode: existing.phone_code
          }, [], confirmedTags);
        }
      }
    }

    await notifyAdminEmailSynced(emailFormatted);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 🔗 Vincula una cuenta de Clerk con un registro de Supabase existente por email
 */
export async function linkClerkAccount(email: string, clerkId: string) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== clerkId) throw new Error("No autorizado");

    await supabaseAdmin.from('registrations').update({
      clerk_id: clerkId,
      updated_at: new Date().toISOString()
    }).eq('email', email.toLowerCase().trim()).is('clerk_id', null);

    await notifyAdminAccountLinked(email);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

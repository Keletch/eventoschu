'use server';

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";

import { processKeapStatusTransitions } from "./keap";
import { notifyAdminRegistrationModified } from "./admin-notifications";
import { notifyUserConfirmed } from "./user-notifications";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 📋 Obtiene todos los registros para el dashboard
 */
export async function getRegistrations() {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 📊 Estadísticas de confirmación por evento
 */
export async function getRegistrationsCount() {
  try {
    const { data, error } = await supabaseAdmin.from('registrations').select('selected_events, event_statuses');
    if (error) throw error;

    const counts: Record<string, number> = {};
    data.forEach(reg => {
      if (reg.selected_events && reg.event_statuses) {
        reg.selected_events.forEach((id: string) => {
          if (reg.event_statuses[id] === 'confirmed') {
            counts[id] = (counts[id] || 0) + 1;
          }
        });
      }
    });

    return { success: true, data: counts };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 🛠️ Actualiza un registro desde el Panel de Administración (Gestión de Estados)
 */
export async function updateRegistration(id: string, data: any) {
  try {
    const { data: currentReg } = await supabaseAdmin.from('registrations').select('*').eq('id', id).single();
    if (!currentReg) throw new Error("Registro no encontrado");

    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || "un administrador";

    // 1. Limpieza de estados y snapshots para eventos deseleccionados
    const updatedStatuses = { ...(data.event_statuses || {}) };
    const updatedEventData = { ...(data.event_data || {}) };
    const removedEventIds = (currentReg.selected_events || []).filter((eventId: string) => !data.selected_events.includes(eventId));

    removedEventIds.forEach((eventId: string) => {
      delete updatedStatuses[eventId];
      delete updatedEventData[eventId];
    });

    // 2. Actualizar Supabase
    const { error: updateError } = await supabaseAdmin.from('registrations').update({
      ...data,
      event_statuses: updatedStatuses,
      event_data: updatedEventData,
      updated_at: new Date().toISOString()
    }).eq('id', id);

    if (updateError) throw updateError;

    // 3. Orquestar Sincronización con Keap
    const allRelevantEventIds = Array.from(new Set([...currentReg.selected_events, ...data.selected_events]));
    const { data: eventDetails } = await supabaseAdmin.from('events').select('id, keap_tag_id, keap_pending_tag_id').in('id', allRelevantEventIds);

    if (eventDetails) {
      await processKeapStatusTransitions(
        {
          email: data.email || currentReg.email,
          firstName: data.first_name || currentReg.first_name,
          lastName: data.last_name || currentReg.last_name,
          phone: data.phone || currentReg.phone,
          phoneCode: data.phone_code || currentReg.phone_code
        },
        currentReg,
        updatedStatuses,
        allRelevantEventIds,
        eventDetails
      );
    }

    // 4. Notificaciones
    const confirmedIds = allRelevantEventIds.filter(id => updatedStatuses[id] === 'confirmed' && currentReg.event_statuses?.[id] !== 'confirmed');
    if (confirmedIds.length > 0) {
      const { data: eventsInfo } = await supabaseAdmin.from('events').select('title, city, country, start_date, categories(name)').in('id', confirmedIds);
      await notifyUserConfirmed({ registrationId: currentReg.id, clerkId: currentReg.clerk_id }, eventsInfo || []);
    }

    const changedEventIds = allRelevantEventIds.filter(id => currentReg.event_statuses?.[id] !== updatedStatuses[id]);
    const personalDataChanged = currentReg.first_name !== data.first_name || currentReg.last_name !== data.last_name;

    if (personalDataChanged || changedEventIds.length > 0) {
      const { data: changedEventsInfo } = await supabaseAdmin.from('events').select('id, title, city, country, start_date, categories(name)').in('id', changedEventIds);
      const statusChanges = (changedEventsInfo || []).map(e => ({ event: e, status: updatedStatuses[e.id] }));
      await notifyAdminRegistrationModified(adminEmail, data.email || currentReg.email, personalDataChanged, statusChanges);
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}





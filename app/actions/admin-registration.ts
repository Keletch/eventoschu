'use server';

import { createClient } from "@supabase/supabase-js";
import { createSupabaseServer } from "@/lib/supabase-server";

import { processKeapStatusTransitions } from "./keap";
import { 
  notifyAdminRegistrationModified, 
  notifyAdminWaitlistActivated 
} from "./admin-notifications";
import { 
  notifyUserConfirmed,
  notifyUserRemovedFromEvent
} from "./user-notifications";
import { broadcastToUser } from "./utils-realtime";

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
    const { data: { user: adminUser } } = await supabase.auth.getUser();
    const adminEmail = adminUser?.email || "un administrador";

    // 1. Limpieza de estados y snapshots para eventos deseleccionados
    const updatedStatuses = { ...(data.event_statuses || {}) };
    const updatedEventData = { ...(data.event_data || {}) };
    const removedEventIds = (currentReg.selected_events || []).filter((eventId: string) => !data.selected_events.includes(eventId));

    removedEventIds.forEach((eventId: string) => {
      delete updatedStatuses[eventId];
      delete updatedEventData[eventId];
    });

    // Detectar si se liberó algún cupo (de confirmed a otra cosa)
    const releasedEventIds = (currentReg.selected_events || []).filter((eventId: string) => 
      currentReg.event_statuses?.[eventId] === 'confirmed' && updatedStatuses[eventId] !== 'confirmed'
    );

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
    const { data: eventDetails } = await supabaseAdmin.from('events').select('id, title, city, country, start_date, keap_tag_id, keap_pending_tag_id, initial_status, categories(name)').in('id', allRelevantEventIds);

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

    // 4. Lógica de Tómbola Aleatoria para Modo Abierto
    if (releasedEventIds.length > 0 && eventDetails) {
      for (const eventId of releasedEventIds) {
        const evInfo = eventDetails.find(e => e.id === eventId);
        // Si el evento es Modo Abierto (initial_status === confirmed)
        if (evInfo && evInfo.initial_status === 'confirmed') {
          // Notificar al usuario removido
          await notifyUserRemovedFromEvent({ registrationId: id, clerkId: currentReg.clerk_id }, evInfo);

          // Buscar usuarios en espera para este evento
          const { data: waitlist } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .contains('selected_events', [eventId]);
          
          const pendingUsers = (waitlist || []).filter(r => r.id !== id && r.event_statuses?.[eventId] === 'pending');

          if (pendingUsers.length > 0) {
            // Selección aleatoria
            const luckyUser = pendingUsers[Math.floor(Math.random() * pendingUsers.length)];
            
            const luckyStatuses = { ...luckyUser.event_statuses, [eventId]: 'confirmed' };
            
            // Actualizar usuario afortunado
            await supabaseAdmin.from('registrations').update({
              event_statuses: luckyStatuses,
              updated_at: new Date().toISOString()
            }).eq('id', luckyUser.id);

            // Sincronizar Keap para el afortunado
            if (evInfo.keap_tag_id) {
              const { syncKeapTags } = await import("./keap");
              await syncKeapTags({
                email: luckyUser.email,
                firstName: luckyUser.first_name,
                lastName: luckyUser.last_name,
                phone: luckyUser.phone,
                phoneCode: luckyUser.phone_code
              }, [evInfo.keap_pending_tag_id].filter(Boolean), [evInfo.keap_tag_id]);
            }

            // Notificaciones con estados actualizados para tiempo real
            await notifyUserConfirmed({ registrationId: luckyUser.id, clerkId: luckyUser.clerk_id }, [evInfo], luckyStatuses);
            await notifyAdminWaitlistActivated(adminEmail, evInfo, data.email || currentReg.email, luckyUser.email);
          }
        }
      }
    }

    // 5. Notificaciones de la acción original
    const confirmedIds = allRelevantEventIds.filter(id => updatedStatuses[id] === 'confirmed' && currentReg.event_statuses?.[id] !== 'confirmed');
    if (confirmedIds.length > 0) {
      const { data: eventsInfo } = await supabaseAdmin.from('events').select('title, city, country, start_date, categories(name)').in('id', confirmedIds);
      await notifyUserConfirmed({ registrationId: currentReg.id, clerkId: currentReg.clerk_id }, eventsInfo || [], updatedStatuses);
    }

    // 6. Sincronización Realtime (Indicadores y Estados)
    const changedEventIds = allRelevantEventIds.filter(id => currentReg.event_statuses?.[id] !== updatedStatuses[id]);
    const personalDataChanged = currentReg.first_name !== data.first_name || currentReg.last_name !== data.last_name;

    if (personalDataChanged || changedEventIds.length > 0) {
      const { data: changedEventsInfo } = await supabaseAdmin.from('events').select('id, title, city, country, start_date, categories(name)').in('id', changedEventIds);
      const statusChanges = (changedEventsInfo || []).map(e => ({ event: e, status: updatedStatuses[e.id] }));
      
      // Notificar al administrador del cambio
      await notifyAdminRegistrationModified(adminEmail, data.email || currentReg.email, personalDataChanged, statusChanges);
      
      // 📢 Notificar al usuario (Sincronización de Indicadores en tiempo real)
      // Enviamos a ambos IDs (UUID y Clerk ID) para asegurar que llegue a todos los hooks del cliente
      const targets = [currentReg.id, currentReg.clerk_id].filter(Boolean) as string[];
      if (targets.length > 0) {
        await broadcastToUser(targets, {
          id: currentReg.id,
          event_statuses: updatedStatuses,
          event_data: currentReg.event_data // Mantener datos extra
        });
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}





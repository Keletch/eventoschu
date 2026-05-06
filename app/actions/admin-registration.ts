'use server';

import { createSupabaseServer } from "@/lib/supabase-server";
import { processKeapStatusTransitions, syncKeapTags } from "./keap";
import { 
  notifyAdminRegistrationModified, 
  notifyAdminWaitlistActivated 
} from "./admin-notifications";
import { formatEventForNotification } from "./utils";
import { broadcastToUser, broadcastToPublic } from "./utils-realtime";
import { dispatchSignal } from "@/lib/services/signal-dispatcher";
import { verifyAdminPermission } from "./admin-check";

import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * 📋 Obtiene todos los registros para el dashboard
 */
export async function getRegistrations() {
  const { isAdmin } = await verifyAdminPermission();
  if (!isAdmin) return { success: false, error: "No tienes permisos" };

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
  const { isAdmin } = await verifyAdminPermission();
  if (!isAdmin) return { success: false, error: "No tienes permisos" };

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
          // 🚀 SEÑAL CONSOLIDADA: Ya no notificamos aquí individualmente al usuario editado.
          // El bloque "5. Notificación Consolidada" al final se encarga de enviarle UN solo mensaje.

          // Buscar usuarios en espera para este evento
          const { data: waitlist } = await supabaseAdmin
            .from('registrations')
            .select('*')
            .contains('selected_events', [eventId]);
          
          const pendingUsers = (waitlist || []).filter(r => r.id !== (id as string) && r.event_statuses?.[eventId] === 'pending');

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
              await syncKeapTags({
                email: luckyUser.email,
                firstName: luckyUser.first_name,
                lastName: luckyUser.last_name,
                phone: luckyUser.phone,
                phoneCode: luckyUser.phone_code
              }, [evInfo.keap_pending_tag_id].filter(Boolean), [evInfo.keap_tag_id]);
            }

            // 📢 Notificación con el nuevo Dispatcher
            await dispatchSignal('EVENT_CONFIRMED', {
              targetIds: [luckyUser.id, luckyUser.clerk_id],
              metadata: { eventNames: formatEventForNotification(evInfo) },
              realtimePayload: {
                event_statuses: luckyStatuses,
                selected_events: luckyUser.selected_events
              }
            });
            await notifyAdminWaitlistActivated(adminEmail, evInfo, data.email || currentReg.email, luckyUser.email);
          }
        }
      }
    }

    // 5. Notificación Consolidada al Usuario (Single Atomic Signal)
    const confirmedIds = allRelevantEventIds.filter((id: string) => updatedStatuses[id] === 'confirmed' && currentReg.event_statuses?.[id] !== 'confirmed');
    const removedIds = allRelevantEventIds.filter((id: string) => currentReg.event_statuses?.[id] === 'confirmed' && updatedStatuses[id] !== 'confirmed');
    
    // 📢 Caso especial: Si el administrador ELIMINÓ eventos físicamente (purga)
    const purgedIds = (currentReg.selected_events || []).filter((id: string) => !allRelevantEventIds.includes(id));
    const allRemovals = Array.from(new Set([...removedIds, ...purgedIds]));

    const changedEventIds = allRelevantEventIds.filter((id: string) => currentReg.event_statuses?.[id] !== updatedStatuses[id]);
    const personalDataChanged = currentReg.first_name !== data.first_name || currentReg.last_name !== data.last_name;

    if (confirmedIds.length > 0 || allRemovals.length > 0 || personalDataChanged) {
      // 🎯 Obtenemos info de eventos para el mensaje (incluyendo los purgados si es posible)
      const { data: eventsInfo } = await supabaseAdmin.from('events').select('*, categories(name)').in('id', Array.from(new Set([...allRelevantEventIds, ...purgedIds])));
      const targets = [currentReg.id, currentReg.clerk_id].filter(Boolean) as string[];

      if (confirmedIds.length > 0 || allRemovals.length > 0) {
        const removalDetails = eventsInfo?.filter(e => allRemovals.includes(e.id)).map(e => formatEventForNotification(e)).join(', ');
        const confirmationDetails = eventsInfo?.filter(e => confirmedIds.includes(e.id)).map(e => formatEventForNotification(e)).join(', ');

        // 🚀 Despacho de Señal Atómica (Templates centralizados)
        await dispatchSignal(allRemovals.length > 0 ? 'EVENT_REMOVED' : 'EVENT_CONFIRMED', {
          targetIds: targets,
          metadata: {
            eventNames: allRemovals.length > 0 ? removalDetails : confirmationDetails,
            context: allRemovals.length > 0 ? "del registro" : ""
          },
          realtimePayload: {
            event_statuses: updatedStatuses,
            selected_events: allRelevantEventIds,
            event_data: updatedEventData
          }
        });
      } else {
        // B. Actualización Silenciosa (Solo Datos/UI)
        await broadcastToUser(targets, {
          msg_id: globalThis.crypto.randomUUID(),
          event_statuses: updatedStatuses,
          selected_events: allRelevantEventIds,
          event_data: updatedEventData
        });
      }

      // C. Notificar al Admin (Auditoría)
      const statusChanges = (eventsInfo || []).filter(e => changedEventIds.includes(e.id)).map(e => ({ event: e, status: updatedStatuses[e.id] }));
      await notifyAdminRegistrationModified(adminEmail, data.email || currentReg.email, personalDataChanged, statusChanges);
    }
    await broadcastToPublic();

    return { success: true };
  } catch (err: any) {
    console.error("❌ Error en updateRegistration:", err);
    return { success: false, error: err.message };
  }
}





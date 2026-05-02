"use server";

import { createClient } from "@supabase/supabase-js";
import { createClerkClient } from "@clerk/nextjs/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { getOrCreateContact, syncKeapTags, keapFetch } from "./keap";
import { 
  notifyAdminEventPurged, 
  notifyAdminMassStatusUpdate, 
  notifyAdminRegistrationDeleted,
  notifyAdminEventAddedToUser,
  notifyAdminEventRemovedFromUser
} from "./admin-notifications";
import { clearEventsCache } from "./events";

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });



const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);



/**
 * 🏷️ Sincronización Masiva de Tags (Activar/Desactivar Evento)
 * @param eventId ID del evento en Supabase
 * @param action 'activate' | 'deactivate'
 */
export async function syncMassTagsByEvent(eventId: string, action: 'activate' | 'deactivate') {
  try {
    // 1. Obtener detalles del evento (especialmente los IDs de Tags)
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('keap_tag_id, keap_pending_tag_id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) throw new Error("Evento no encontrado");
    
    const tagIds = [event.keap_tag_id, event.keap_pending_tag_id].filter(Boolean) as string[];
    if (tagIds.length === 0) return { success: true, message: "El evento no tiene tags configurados." };

    // 2. Obtener todos los usuarios registrados para este evento
    // Buscamos en la tabla registrations aquellos que tengan el eventId en su arreglo de selected_events
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .contains('selected_events', [eventId]);

    if (regError) throw regError;
    if (!registrations || registrations.length === 0) return { success: true, message: "No hay usuarios registrados para este evento." };



    // 3. Procesar cada usuario
    const results = { success: 0, failed: 0 };

    for (const reg of registrations) {
      try {
        const { success, contactId } = await getOrCreateContact({
          email: reg.email,
          firstName: reg.first_name,
          lastName: reg.last_name,
          phone: reg.phone,
          phoneCode: reg.phone_code
        });

        if (!success || !contactId) {
          results.failed++;
          continue;
        }

        const status = reg.event_statuses?.[eventId] || 'pending';
        const activeTag = status === 'confirmed' ? event.keap_tag_id : event.keap_pending_tag_id;

        if (!activeTag) continue;

        if (action === 'activate') {
          // Agregar Tag
          await keapFetch(`contacts/${contactId}/tags`, {
            method: "POST",
            body: JSON.stringify({ tagIds: [parseInt(activeTag)] }),
          });
        } else {
          // Eliminar todos los tags relacionados con este evento
          for (const tagId of tagIds) {
            await keapFetch(`contacts/${contactId}/tags/${tagId}`, { method: "DELETE" });
          }
        }
        results.success++;
      } catch (err) {
        console.error(`❌ Error procesando usuario ${reg.email}:`, err);
        results.failed++;
      }
    }

    return { 
      success: true, 
      message: `${action === 'activate' ? 'Activación' : 'Desactivación'} completada.`,
      stats: results 
    };

  } catch (error: any) {
    console.error("❌ Mass Ops Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 Migración Masiva de Tags (Cuando se cambia la configuración de tags de un evento)
 */
export async function migrateEventTags(data: {
  eventId: string,
  oldTags: { pending?: string, confirmed?: string },
  newTags: { pending?: string, confirmed?: string },
  adminEmail: string,
  eventTitle: string
}) {
  try {
    const { eventId, oldTags, newTags } = data;

    // 1. Obtener usuarios del evento
    const { data: registrations, error: regError } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .contains('selected_events', [eventId]);

    if (regError) throw regError;
    if (!registrations || registrations.length === 0) return { success: true, count: 0 };



    const affectedContacts: string[] = [];

    for (const reg of registrations) {
      try {
        const { success, contactId } = await getOrCreateContact({
          email: reg.email,
          firstName: reg.first_name,
          lastName: reg.last_name,
        });

        if (!success || !contactId) continue;

        const status = reg.event_statuses?.[eventId] || 'pending';
        
        // Determinar qué tags quitar y poner
        const tagsToRemove = [];
        if (oldTags.pending && oldTags.pending !== newTags.pending) tagsToRemove.push(oldTags.pending);
        if (oldTags.confirmed && oldTags.confirmed !== newTags.confirmed) tagsToRemove.push(oldTags.confirmed);

        const tagToAdd = status === 'confirmed' ? newTags.confirmed : newTags.pending;

        // A. Eliminar tags viejos
        for (const tid of tagsToRemove) {
          await keapFetch(`contacts/${contactId}/tags/${tid}`, { method: "DELETE" });
        }

        // B. Agregar tag nuevo
        if (tagToAdd) {
          await keapFetch(`contacts/${contactId}/tags`, {
            method: "POST",
            body: JSON.stringify({ tagIds: [parseInt(tagToAdd)] }),
          });
        }

        affectedContacts.push(reg.email);
      } catch (err) {
        console.error(`❌ Error migrando tags para ${reg.email}:`, err);
      }
    }

    return { success: true, count: affectedContacts.length };
  } catch (error: any) {
    console.error("❌ Error en migrateEventTags:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🧹 Purga un evento en cascada (Limpia Keap, Registros y Caché)
 */
export async function purgeEvent(eventId: string) {
  try {
    // 1. Obtener detalles del evento (Tags)
    const { data: event } = await supabaseAdmin
      .from('events')
      .select('title, keap_tag_id, keap_pending_tag_id')
      .eq('id', eventId)
      .single();
    
    if (!event) throw new Error("Evento no encontrado");

    const tagsToRemove = [event.keap_tag_id, event.keap_pending_tag_id].filter(Boolean) as string[];

    // 2. Buscar TODOS los usuarios registrados en este evento
    const { data: registrations } = await supabaseAdmin
      .from('registrations')
      .select('id, email, first_name, last_name, selected_events, event_statuses, event_data')
      .contains('selected_events', [eventId]);

    if (registrations && registrations.length > 0) {

      
      // 3. Limpiar cada usuario (Keap y Supabase)
      for (const reg of registrations) {
        // A. Quitar tags en Keap
        if (tagsToRemove.length > 0) {
          try {
            await syncKeapTags(
              { email: reg.email, firstName: reg.first_name, lastName: reg.last_name },
              tagsToRemove, // oldTagIds (quitar)
              [] // newTagIds (poner)
            );
          } catch (keapErr) {
            console.error(`⚠️ Error quitando tags Keap para ${reg.email}:`, keapErr);
          }
        }

        // B. Actualizar registro en Supabase (Quitar evento de la lista y del objeto de estados)
        const updatedEvents = (reg.selected_events || []).filter((id: string) => id !== eventId);
        const updatedStatuses = { ...(reg.event_statuses || {}) };
        const updatedEventData = { ...(reg.event_data || {}) };
        delete updatedStatuses[eventId];
        delete updatedEventData[eventId];

        await supabaseAdmin
          .from('registrations')
          .update({
            selected_events: updatedEvents,
            event_statuses: updatedStatuses,
            event_data: updatedEventData,
            updated_at: new Date().toISOString()
          })
          .eq('id', reg.id);
      }
    }

    // 4. Eliminar el evento definitivamente
    const { error: deleteError } = await supabaseAdmin.from('events').delete().eq('id', eventId);
    if (deleteError) throw deleteError;

    // 5. Notificar auditoría
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || "un administrador";
    await notifyAdminEventPurged(adminEmail, event.title, registrations?.length || 0);

    // 6. Limpiar Caché de Redis
    await clearEventsCache();

    return { success: true };
  } catch (error: any) {
    console.error("❌ Error en Purga de Evento:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Actualización Masiva de Estados (Confirmar/Cancelar todos los de un evento)
 */
export async function massUpdateRegistrationStatus(eventId: string, newStatus: 'confirmed' | 'pending' | 'cancelled') {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || "un administrador";

    // 1. Obtener detalles del evento (Tags)
    const { data: event } = await supabaseAdmin
      .from('events')
      .select('title, keap_tag_id, keap_pending_tag_id')
      .eq('id', eventId)
      .single();
    
    if (!event) throw new Error("Evento no encontrado");

    // 2. Buscar usuarios registrados en este evento que NO tengan el nuevo estado
    const { data: registrations } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .contains('selected_events', [eventId]);

    const targetRegistrations = (registrations || []).filter(reg => reg.event_statuses?.[eventId] !== newStatus);

    if (targetRegistrations.length === 0) {
      return { success: true, count: 0, message: "No hay usuarios que requieran actualización." };
    }



    const affectedEmails: string[] = [];

    // 3. Procesar cada usuario
    for (const reg of targetRegistrations) {
      try {
        const updatedStatuses = { ...(reg.event_statuses || {}), [eventId]: newStatus };
        
        // A. Actualizar Supabase
        await supabaseAdmin
          .from('registrations')
          .update({
            event_statuses: updatedStatuses,
            updated_at: new Date().toISOString()
          })
          .eq('id', reg.id);

        // B. Sincronizar Keap
        const tagsToAdd = newStatus === 'confirmed' ? [event.keap_tag_id] : 
                        newStatus === 'pending' ? [event.keap_pending_tag_id] : [];
        const tagsToRemove = newStatus === 'confirmed' ? [event.keap_pending_tag_id] :
                           newStatus === 'pending' ? [event.keap_tag_id] : 
                           [event.keap_tag_id, event.keap_pending_tag_id];

        await syncKeapTags(
          { email: reg.email, firstName: reg.first_name, lastName: reg.last_name },
          tagsToRemove.filter(Boolean) as string[], // oldTagIds (quitar)
          tagsToAdd.filter(Boolean) as string[] // newTagIds (poner)
        );

        affectedEmails.push(reg.email);
      } catch (err) {
        console.error(`❌ Error en actualización masiva para ${reg.email}:`, err);
      }
    }

    // 4. Notificar auditoría
    await notifyAdminMassStatusUpdate(adminEmail, event.title, newStatus, affectedEmails.length);

    return { success: true, count: affectedEmails.length };
  } catch (error: any) {
    console.error("❌ Error en massUpdateRegistrationStatus:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🗑️ Elimina un registro permanentemente (Purga Selectiva)
 */
export async function deleteRegistration(id: string) {
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
    if (reg.clerk_id) {
      try {
        await clerk.users.deleteUser(reg.clerk_id);
      } catch (clerkError: any) {
        console.error("⚠️ Error al borrar usuario de Clerk (posiblemente ya no existe):", clerkError.message);
      }
    }

    // 3. Eliminar Notificaciones en Supabase
    if (reg.clerk_id) {
      await supabaseAdmin.from('notifications').delete().eq('clerk_id', reg.clerk_id);
    }

    // 4. Eliminar Registro en Supabase
    await supabaseAdmin.from('registrations').delete().eq('id', id);

    // 5. Obtener detalles de eventos para la notificación (antes de borrar)
    const { data: eventsData } = await supabaseAdmin
      .from('events')
      .select('title, city, country')
      .in('id', reg.selected_events || []);

    // 6. Notificar a los administradores
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || "un administrador";
    await notifyAdminRegistrationDeleted(adminEmail, reg.email, eventsData || []);

    return { success: true };
  } catch (err: any) {
    console.error("❌ Error en Purga de Usuario:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 🗑️ Elimina un registro basado en el clerk_id (usado por webhooks)
 */
export async function deleteRegistrationByClerkId(clerkId: string) {
  try {
    const { data: reg } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('clerk_id', clerkId)
      .single();
      
    if (!reg) return { success: true }; // Ya no existe
    return await deleteRegistration(reg.id);
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
/**
 * ➕ Agrega un evento a un usuario de forma administrativa (Fuerza Bruta)
 */
export async function adminAddEventToUser(registrationId: string, eventId: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || "un administrador";

    // 1. Obtener datos actuales del registro y del evento
    const { data: reg } = await supabaseAdmin.from('registrations').select('*').eq('id', registrationId).single();
    const { data: event } = await supabaseAdmin.from('events').select('*').eq('id', eventId).single();

    if (!reg || !event) throw new Error("Registro o Evento no encontrado");
    if (reg.selected_events?.includes(eventId)) throw new Error("El usuario ya está inscrito en este evento");

    // 2. Preparar actualización de Supabase
    const updatedEvents = [...(reg.selected_events || []), eventId];
    const updatedStatuses = { ...(reg.event_statuses || {}), [eventId]: 'pending' };
    
    // Clonamos los datos globales para este evento específico
    const updatedEventData = { 
      ...(reg.event_data || {}), 
      [eventId]: { 
        first_name: reg.first_name,
        last_name: reg.last_name,
        email: reg.email,
        phone: reg.phone,
        phone_code: reg.phone_code,
        residence_country: reg.residence_country
      } 
    };

    const { error: updateError } = await supabaseAdmin.from('registrations').update({
      selected_events: updatedEvents,
      event_statuses: updatedStatuses,
      event_data: updatedEventData,
      updated_at: new Date().toISOString()
    }).eq('id', registrationId);

    if (updateError) throw updateError;

    // 3. Sincronizar Keap (Tag Pendiente por defecto)
    if (event.keap_pending_tag_id) {
      await syncKeapTags(
        { email: reg.email, firstName: reg.first_name, lastName: reg.last_name },
        [], // oldTagIds (quitar)
        [event.keap_pending_tag_id] // newTagIds (poner)
      );
    }

    // 4. Notificar Auditoría
    await notifyAdminEventAddedToUser(adminEmail, reg.email, event);

    return { success: true };
  } catch (err: any) {
    console.error("❌ adminAddEventToUser Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * ➖ Elimina un evento de un usuario de forma administrativa (Limpieza Total)
 */
export async function adminRemoveEventFromUser(registrationId: string, eventId: string) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    const adminEmail = user?.email || "un administrador";

    // 1. Obtener datos actuales
    const { data: reg } = await supabaseAdmin.from('registrations').select('*').eq('id', registrationId).single();
    const { data: event } = await supabaseAdmin.from('events').select('*').eq('id', eventId).single();

    if (!reg || !event) throw new Error("Registro o Evento no encontrado");

    // 2. Preparar actualización de Supabase (Limpieza)
    const updatedEvents = (reg.selected_events || []).filter((id: string) => id !== eventId);
    const updatedStatuses = { ...(reg.event_statuses || {}) };
    const updatedEventData = { ...(reg.event_data || {}) };
    delete updatedStatuses[eventId];
    delete updatedEventData[eventId];

    const { error: updateError } = await supabaseAdmin.from('registrations').update({
      selected_events: updatedEvents,
      event_statuses: updatedStatuses,
      event_data: updatedEventData,
      updated_at: new Date().toISOString()
    }).eq('id', registrationId);

    if (updateError) throw updateError;

    // 3. Sincronizar Keap (Eliminar todos los tags de este evento)
    const tagsToRemove = [event.keap_tag_id, event.keap_pending_tag_id].filter(Boolean) as string[];
    if (tagsToRemove.length > 0) {
      await syncKeapTags(
        { email: reg.email, firstName: reg.first_name, lastName: reg.last_name },
        tagsToRemove, // oldTagIds (quitar)
        [] // newTagIds (poner)
      );
    }

    // 4. Notificar Auditoría
    await notifyAdminEventRemovedFromUser(adminEmail, reg.email, event);

    return { success: true };
  } catch (err: any) {
    console.error("❌ adminRemoveEventFromUser Error:", err);
    return { success: false, error: err.message };
  }
}




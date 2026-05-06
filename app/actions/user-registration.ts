'use server';

import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { registrationSchema } from "./schemas";
import { validateTurnstileToken } from "./turnstile";
import { syncKeapTags } from "./keap";
import { 
  notifyAdminNewRegistration, 
  notifyAdminSurveyCompleted, 
  notifyAdminSpecificDataUpdate 
} from "./admin-notifications";
import { notifyUserRegistrationSuccess } from "./user-notifications";
import { formatEventForNotification } from "./utils";
import { broadcastToAdmins, broadcastToUser, broadcastToPublic } from "./utils-realtime";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 🚀 Crea o actualiza un registro desde el formulario público
 */
export async function createRegistration(data: any, turnstileToken: string) {
  try {
    const verification = await validateTurnstileToken(turnstileToken);
    if (!verification.success) return { success: false, error: "Fallo de verificación de seguridad." };

    const validatedData = registrationSchema.parse(data);
    const { userId } = await auth();
    const isAuthenticated = !!userId;

    // 0. Obtener información de los eventos ANTES de decidir estados
    const { data: allEventsInfo } = await supabaseAdmin
      .from('events')
      .select('id, title, city, country, start_date, capacity, keap_tag_id, keap_pending_tag_id, initial_status, categories(name)')
      .in('id', validatedData.selected_events);

    const eventInfoMap: Record<string, any> = {};
    allEventsInfo?.forEach(e => { eventInfoMap[e.id] = e; });

    // 1. Buscar registro existente (por Clerk ID o Email)
    let existing = null;
    if (isAuthenticated) {
      const { data: byId } = await supabaseAdmin.from('registrations').select('*').eq('clerk_id', userId).maybeSingle();
      existing = byId;
    }
    
    if (!existing) {
      const { data: byEmail } = await supabaseAdmin.from('registrations').select('*').eq('email', validatedData.email).maybeSingle();
      existing = byEmail;
      if (existing && isAuthenticated && !existing.clerk_id) {
        await supabaseAdmin.from('registrations').update({ clerk_id: userId }).eq('id', existing.id);
      }
    }

    // Sincronización de conteos para Modo Abierto
    const { data: currentCounts } = await supabaseAdmin.from('registrations').select('selected_events, event_statuses');
    const countsMap: Record<string, number> = {};
    currentCounts?.forEach(reg => {
      reg.selected_events?.forEach((id: string) => {
        if (reg.event_statuses?.[id] === 'confirmed') countsMap[id] = (countsMap[id] || 0) + 1;
      });
    });

    // 2. Lógica de Actualización vs Creación
    if (existing) {
      const alreadyRegisteredIds = validatedData.selected_events.filter(id => (existing.selected_events || []).includes(id));
      
      if (alreadyRegisteredIds.length === validatedData.selected_events.length) {
        const { data: events } = await supabaseAdmin.from('events').select('title, city, country, start_date, categories(name)').in('id', alreadyRegisteredIds);
        const eventNames = events?.map(e => `\n• ${formatEventForNotification(e)}`).join('') || '';
        return { success: false, error: `Ya estás registrado en:${eventNames}` };
      }

      const newlyAddedIds = validatedData.selected_events.filter(id => !(existing.selected_events || []).includes(id));
      const mergedEvents = Array.from(new Set([...(existing.selected_events || []), ...validatedData.selected_events]));
      const updatedStatuses = { ...(existing.event_statuses || {}) };
      const updatedEventData = { ...(existing.event_data || {}) };

      validatedData.selected_events.forEach(id => {
        const ev = eventInfoMap[id];
        if (!(existing.selected_events || []).includes(id)) {
          // Lógica de "Modo Abierto" vs "Cerrado"
          const isModeOpen = ev?.initial_status === 'confirmed';
          const currentConfirmed = countsMap[id] || 0;
          const capacity = ev?.capacity || 25;

          if (isModeOpen && currentConfirmed < capacity) {
            updatedStatuses[id] = 'confirmed';
          } else {
            updatedStatuses[id] = 'pending';
          }
          
          updatedEventData[id] = { ...validatedData };
        }
      });

      const { error: updateError } = await supabaseAdmin.from('registrations').update({
        selected_events: mergedEvents,
        event_statuses: updatedStatuses,
        event_data: updatedEventData,
        updated_at: new Date().toISOString()
      }).eq('id', existing.id);

      if (updateError) throw updateError;

      // Sincronización de Tags (Keap) y Notificaciones
      const newlyAddedEvents = allEventsInfo?.filter(e => newlyAddedIds.includes(e.id)) || [];
      const alreadyInEvents = allEventsInfo?.filter(e => (existing.selected_events || []).includes(e.id)) || [];

      if (newlyAddedEvents.length > 0) {
        const tagsToAdd: string[] = [];
        newlyAddedEvents.forEach(e => {
          const status = updatedStatuses[e.id];
          const tag = status === 'pending' ? e.keap_pending_tag_id : e.keap_tag_id;
          if (tag) tagsToAdd.push(tag);
        });

        await syncKeapTags(validatedData, [], tagsToAdd);
        await notifyAdminNewRegistration(validatedData.email, newlyAddedEvents);
        await notifyUserRegistrationSuccess({ registrationId: existing.id, clerkId: userId || existing.clerk_id }, newlyAddedEvents, alreadyInEvents);
      }

      // 📢 Sincronización Realtime (Arquitectura SOLID)
      const targets = [existing.id, existing.clerk_id, userId].filter(Boolean) as string[];
      await Promise.all([
        broadcastToAdmins(null),
        broadcastToUser(targets, null),
        broadcastToPublic()
      ]);

      return { 
        success: true, 
        isUpdate: true, 
        message: "Registro completado con éxito.",
        mergedEvents: mergedEvents,
        eventStatuses: updatedStatuses,
        eventData: updatedEventData,
        surveyData: existing.survey_data || null
      };
    } 

    // 3. Nuevo Registro
    const initialStatuses: Record<string, string> = {};
    const initialEventData: Record<string, any> = {};
    validatedData.selected_events.forEach(id => {
      const ev = eventInfoMap[id];
      const isModeOpen = ev?.initial_status === 'confirmed';
      const currentConfirmed = countsMap[id] || 0;
      const capacity = ev?.capacity || 25;

      if (isModeOpen && currentConfirmed < capacity) {
        initialStatuses[id] = 'confirmed';
      } else {
        initialStatuses[id] = 'pending';
      }
      
      initialEventData[id] = { ...validatedData };
    });

    const { data: inserted, error: insertError } = await supabaseAdmin.from('registrations').insert([{
      ...validatedData,
      clerk_id: userId,
      event_statuses: initialStatuses,
      event_data: initialEventData
    }]).select('id').single();

    if (insertError) throw insertError;
    const newRegId = inserted?.id;

    if (newRegId) {
      // Sincronización inteligente para nuevo registro
      const tagsToAdd: string[] = [];
      allEventsInfo?.forEach(e => {
        const status = e.initial_status || 'confirmed';
        const tag = status === 'pending' ? e.keap_pending_tag_id : e.keap_tag_id;
        if (tag) tagsToAdd.push(tag);
      });

      await syncKeapTags(validatedData, [], tagsToAdd);
      await notifyAdminNewRegistration(validatedData.email, allEventsInfo || []);
      await notifyUserRegistrationSuccess({ registrationId: newRegId, clerkId: userId || undefined }, allEventsInfo || [], []);
    }

    // 📢 Sincronización Realtime (Arquitectura SOLID)
    const targets = [newRegId, userId].filter(Boolean) as string[];
    await Promise.all([
      broadcastToAdmins(null),
      broadcastToUser(targets, null),
      broadcastToPublic()
    ]);

    return { 
      success: true, 
      isNew: true, 
      id: newRegId,
      message: "Registro completado con éxito.",
      mergedEvents: validatedData.selected_events,
      eventStatuses: initialStatuses,
      eventData: initialEventData,
      surveyData: null
    };

  } catch (err: any) {
    console.error("UserRegistration Error:", err);
    return { success: false, error: err.message };
  }
}

/**
 * 🔍 Verifica el estado de registro de un usuario
 */
export async function checkRegistration(email: string, clerkId?: string) {
  try {
    let data = null;
    if (clerkId) {
      const { data: byId } = await supabaseAdmin.from('registrations').select('*').eq('clerk_id', clerkId).single();
      data = byId;
    }
    if (!data) {
      const { data: byEmail } = await supabaseAdmin.from('registrations').select('*').eq('email', email.toLowerCase().trim()).single();
      data = byEmail;
    }

    if (!data) return { success: false, error: "No se encontró registro." };

    return {
      success: true,
      exists: true,
      userData: data,
      selectedEvents: data.selected_events || [],
      eventStatuses: data.event_statuses || {},
      eventData: data.event_data || {},
      surveyData: data.survey_data || null
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 📝 Guarda los datos de la encuesta general
 */
export async function saveSurveyData(email: string, surveyData: any) {
  try {
    const { userId } = await auth();
    const { data: reg } = await supabaseAdmin.from('registrations').select('clerk_id').eq('email', email.toLowerCase().trim()).single();
    
    if (reg?.clerk_id && reg.clerk_id !== userId) throw new Error("No autorizado");

    await supabaseAdmin.from('registrations').update({ survey_data: surveyData }).eq('email', email.toLowerCase().trim());
    await notifyAdminSurveyCompleted(email);
    
    // 📢 Sincronización Realtime (Arquitectura SOLID)
    const targetId = userId || reg?.clerk_id;
    await Promise.all([
      broadcastToAdmins(null),
      targetId ? broadcastToUser(targetId, null) : Promise.resolve(),
      broadcastToPublic()
    ]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * ✏️ Actualiza datos específicos de un evento para un usuario
 */
export async function updateEventSpecificData(email: string, eventId: string, newData: any) {
  try {
    const { userId } = await auth();
    const { data: existing } = await supabaseAdmin.from('registrations').select('event_data, clerk_id').eq('email', email.toLowerCase().trim()).single();
    
    if (existing?.clerk_id && existing.clerk_id !== userId) throw new Error("No autorizado");

    const updatedEventData = {
      ...(existing?.event_data || {}),
      [eventId]: { ...(existing?.event_data?.[eventId] || {}), ...newData, email }
    };

    await supabaseAdmin.from('registrations').update({ event_data: updatedEventData }).eq('email', email.toLowerCase().trim());
    
    const { data: eventInfo } = await supabaseAdmin.from('events').select('title, city, country, start_date, categories(name)').eq('id', eventId).single();
    await notifyAdminSpecificDataUpdate(email, eventInfo);

    // 📢 Sincronización Realtime (Arquitectura SOLID)
    const targetId = userId || existing?.clerk_id;
    await Promise.all([
      broadcastToAdmins(null),
      targetId ? broadcastToUser(targetId, null) : Promise.resolve(),
      broadcastToPublic()
    ]);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

'use server';

import { auth } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { registrationSchema } from "./schemas";
import { validateTurnstileToken } from "./turnstile";
import { syncKeapTags, getContactTagsByEmail } from "./keap";
import { 
  notifyAdminNewRegistration, 
  notifyAdminSurveyCompleted, 
  notifyAdminSpecificDataUpdate 
} from "./admin-notifications";
import { formatEventForNotification } from "./utils";
import { broadcastToAdmins, broadcastToUser, broadcastToPublic } from "./utils-realtime";
import { getEventUIConfig } from "@/lib/event-config";
import { dispatchSignal } from "@/lib/services/signal-dispatcher";
import { clearEventsCache } from "./events";

import { supabaseAdmin } from "@/lib/supabase-admin";

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
      .select('id, title, city, country, start_date, capacity, keap_tag_id, keap_pending_tag_id, initial_status, paid_links, categories(name), event_tags(tags(*))')
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

    // Sincronización de conteos de cupos confirmados
    const { data: currentCounts } = await supabaseAdmin.from('registrations').select('selected_events, event_statuses');
    const countsMap: Record<string, number> = {};
    currentCounts?.forEach(reg => {
      reg.selected_events?.forEach((id: string) => {
        if (reg.event_statuses?.[id] === 'confirmed') countsMap[id] = (countsMap[id] || 0) + 1;
      });
    });

    // 🎯 Detección de Pago con cupo para evento seleccionado
    let checkoutRedirectUrl: string | null = null;
    const selectedEventId = validatedData.selected_events[0];
    const selectedEvInfo = eventInfoMap[selectedEventId];
    const isClosedEv = selectedEvInfo?.initial_status === 'pending';
    const isPagoCupoEv = isClosedEv && (selectedEvInfo?.event_tags || []).some((et: any) => et.tags?.slug === 'pago_cupo');

    if (isPagoCupoEv) {
      const pConfig = (selectedEvInfo?.paid_links || []).find((l: any) => l.type === 'pago_cupo_config');
      const confirmedCount = countsMap[selectedEventId] || 0;
      const capacity = selectedEvInfo?.capacity || 50;
      const isFull = confirmedCount >= capacity;

      const queryParams = new URLSearchParams({
        name: `${validatedData.first_name} ${validatedData.last_name}`.trim(),
        email: validatedData.email,
        phone: `${validatedData.phone_code || ""}${validatedData.phone || ""}`.replace(/\s+/g, '')
      }).toString();

      // Escenario A: No hay cupos y tiene lista de espera externa activada
      // NO se registra en Supabase ni en Keap; solo se redirige inmediatamente.
      if (isFull && pConfig?.use_external_waitlist && pConfig?.paid_waitlist_url) {
        const separator = pConfig.paid_waitlist_url.includes('?') ? '&' : '?';
        const externalRedirect = `${pConfig.paid_waitlist_url}${separator}${queryParams}`;
        return {
          success: true,
          pureRedirect: true,
          redirectUrl: externalRedirect
        };
      }

      // Escenario B: Sí hay cupos disponibles -> Se preparará checkoutRedirectUrl
      if (!isFull && (pConfig?.checkout_url || pConfig?.url)) {
        const rawUrl = pConfig.checkout_url || pConfig.url;
        const separator = rawUrl.includes('?') ? '&' : '?';
        checkoutRedirectUrl = `${rawUrl}${separator}${queryParams}`;
      }
    }

    // 2. Lógica de Actualización vs Creación
    if (existing) {
      const alreadyRegisteredIds = validatedData.selected_events.filter(id => (existing.selected_events || []).includes(id));
      
      if (alreadyRegisteredIds.length === validatedData.selected_events.length) {
        const { data: events } = await supabaseAdmin.from('events').select('title, city, country, start_date, categories(name)').in('id', alreadyRegisteredIds);
        const eventNames = events?.map(e => `\n• ${formatEventForNotification(e)}`).join('') || '';
        return { success: false, error: `Ya estás registrado en:${eventNames}` };
      }

      const newlyAddedIds = validatedData.selected_events.filter(id => !(existing.selected_events || []).includes(id));
      const mergedEvents = Array.from(new Set([...validatedData.selected_events, ...(existing.selected_events || [])]));
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
      const _alreadyInEvents = allEventsInfo?.filter(e => (existing.selected_events || []).includes(e.id)) || [];

      if (newlyAddedEvents.length > 0) {
        const tagsToAdd: string[] = [];
        newlyAddedEvents.forEach(e => {
          const status = updatedStatuses[e.id];
          const tag = status === 'pending' ? e.keap_pending_tag_id : e.keap_tag_id;
          if (tag) tagsToAdd.push(tag);
        });

        await syncKeapTags(validatedData, [], tagsToAdd);
        await notifyAdminNewRegistration(validatedData.email, newlyAddedEvents);

        // 📢 Notificar al Usuario (Dispatcher EDA)
        const isWaitingList = newlyAddedEvents.some(e => getEventUIConfig(e).type === 'OPEN');
        const eventNames = newlyAddedEvents.map(e => formatEventForNotification(e)).join(', ');

        await dispatchSignal('REGISTRATION_SUCCESS', {
          targetIds: [existing.id, userId || existing.clerk_id],
          metadata: {
            email: validatedData.email, // 🚀 Canal de emergencia activado
            eventNames,
            isWaitingList
          },
          realtimePayload: {
            event_statuses: updatedStatuses,
            selected_events: mergedEvents,
            event_data: updatedEventData
          }
        });
      }

      // 📢 Sincronización Realtime (No bloqueante para el usuario)
      Promise.all([
        broadcastToAdmins(null),
        broadcastToPublic()
      ]).catch(err => console.error("Realtime sync error:", err));

      return { 
        success: true, 
        isUpdate: true, 
        message: "Registro completado con éxito.",
        mergedEvents: mergedEvents,
        eventStatuses: updatedStatuses,
        eventData: updatedEventData,
        surveyData: existing.survey_data || null,
        checkoutRedirectUrl: checkoutRedirectUrl || undefined
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
      
      // 📢 Notificación inicial (Dispatcher EDA)
      const isWaitingList = allEventsInfo?.some(e => getEventUIConfig(e).type === 'OPEN');
      const eventNames = allEventsInfo?.map(e => formatEventForNotification(e)).join(', ');

      await dispatchSignal('REGISTRATION_SUCCESS', {
        targetIds: [newRegId, userId || undefined],
        metadata: {
          email: validatedData.email, // 🚀 Canal de emergencia activado
          eventNames,
          isWaitingList
        },
        realtimePayload: {
          event_statuses: initialStatuses,
          selected_events: validatedData.selected_events,
          event_data: initialEventData
        }
      });
    }

    // 📢 Sincronización Realtime (No bloqueante para el usuario)
    Promise.all([
      broadcastToAdmins(null),
      broadcastToPublic()
    ]).catch(err => console.error("Realtime sync error:", err));

    return { 
      success: true, 
      isNew: true, 
      id: newRegId,
      message: "Registro completado con éxito.",
      mergedEvents: validatedData.selected_events,
      eventStatuses: initialStatuses,
      eventData: initialEventData,
      surveyData: null,
      checkoutRedirectUrl: checkoutRedirectUrl || undefined
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

    // 🛡️ Blindaje: Si el registro existe pero no tiene eventos, lo tratamos como "No registrado"
    if (!data.selected_events || data.selected_events.length === 0) {
      return { success: false, error: "No tienes eventos registrados actualmente." };
    }

    // 🔄 Sincronización Automática con Keap para eventos con "Pago con cupo"
    let currentStatuses = { ...(data.event_statuses || {}) };
    let hasStatusChanges = false;

    // Obtener detalles de los eventos del usuario
    const { data: userEvents } = await supabaseAdmin
      .from('events')
      .select('id, title, keap_tag_id, keap_pending_tag_id, initial_status, event_tags(tags(*))')
      .in('id', data.selected_events);

    const pagoCupoEvents = (userEvents || []).filter(e => {
      const isClosed = e.initial_status === 'pending';
      const hasPagoCupo = (e.event_tags || []).some((et: any) => et.tags?.slug === 'pago_cupo');
      return isClosed && hasPagoCupo && e.keap_tag_id;
    });

    if (pagoCupoEvents.length > 0) {
      // Consultar qué tags tiene el usuario en Keap CRM vía REST API
      const keapResult = await getContactTagsByEmail(data.email);
      if (keapResult.success && keapResult.tags && keapResult.tags.length > 0) {
        const userKeapTagIds = keapResult.tags;

        for (const ev of pagoCupoEvents) {
          const userStatus = currentStatuses[ev.id];
          // Si el usuario está en pending y ya tiene en Keap el TAG: CONFIRMADO
          if (userStatus === 'pending' && userKeapTagIds.includes(ev.keap_tag_id)) {
            currentStatuses[ev.id] = 'confirmed';
            hasStatusChanges = true;
          }
        }
      }
    }

    // Si hubo promociones automáticas a confirmado:
    if (hasStatusChanges) {
      await supabaseAdmin.from('registrations').update({
        event_statuses: currentStatuses,
        updated_at: new Date().toISOString()
      }).eq('id', data.id);

      data.event_statuses = currentStatuses;

      // 🧹 Invalidación de caché en Redis para actualizar aforos globales
      await clearEventsCache();

      // Emitir señales en tiempo real
      Promise.all([
        broadcastToAdmins(null),
        broadcastToUser(data.clerk_id || data.id, null),
        broadcastToPublic()
      ]).catch(err => console.error("Realtime broadcast error on payment sync:", err));
    }

    return {
      success: true,
      exists: true,
      userData: data,
      selectedEvents: data.selected_events || [],
      eventStatuses: currentStatuses,
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

/**
 * 📊 Registra un clic analítico para eventos de pago
 */
export async function trackPaidEventClick(eventId: string) {
  try {
    const { userId } = await auth();
    const reqHeaders = await headers();
    const ip = reqHeaders.get("x-forwarded-for") || reqHeaders.get("x-real-ip") || "127.0.0.1";
    
    // Generar un hash de la IP
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex");

    const { error } = await supabaseAdmin.from('event_clicks').insert({
      event_id: eventId,
      clerk_id: userId || null,
      ip_hash: ipHash
    });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error tracking paid event click:", err);
    return { success: false, error: err.message };
  }
}


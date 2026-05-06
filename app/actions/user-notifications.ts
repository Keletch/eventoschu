'use server';

import { insertNotification } from "./notifications";
import { formatEventForNotification } from "./utils";
import { getEventUIConfig } from "@/lib/event-config";

/**
 * 👤 NOTIFICACIONES PARA USUARIOS FINALES
 */

export async function notifyUserRegistrationSuccess(ids: { registrationId: string, clerkId?: string }, newlyAddedEvents: any[], alreadyInEvents: any[], selectedEvents?: string[], userName?: string) {
  const isFuture = (e: any) => new Date(e.start_date).getFullYear() === 2099;

  // 0. Obtener configuración del primer evento nuevo para el estilo del brindis
  const firstEvent = newlyAddedEvents[0] || alreadyInEvents[0];
  const uiConfig = getEventUIConfig(firstEvent);
  const nameToUse = userName || firstEvent?.first_name || ""; 

  // Separar eventos nuevos
  const newNormal = newlyAddedEvents.filter(e => !isFuture(e));
  const newFuture = newlyAddedEvents.filter(e => isFuture(e));

  // Separar eventos previos
  const oldNormal = alreadyInEvents.filter(e => !isFuture(e));
  const oldFuture = alreadyInEvents.filter(e => isFuture(e));

  const formatList = (evs: any[]) => evs.map(e => `\n• ${formatEventForNotification(e)}`).join('');

  let message = "";
  
  // Construir mensaje de registros previos
  if (oldNormal.length > 0 || oldFuture.length > 0) {
    message += "Ya estabas registrado en:";
    const allOld = [...oldNormal, ...oldFuture];
    message += formatList(allOld);
    message += "\n\n";
  }

  // Construir mensaje de nuevos registros
  if (newNormal.length > 0 || newFuture.length > 0) {
    const isWaitingList = uiConfig.type === 'OPEN';
    
    if (isWaitingList) {
      message += "Has sido registrado a la lista de espera para:";
    } else {
      message += (oldNormal.length > 0 || oldFuture.length > 0) 
        ? "Hemos añadido con éxito tu registro para:" 
        : "¡Registro exitoso! Tu solicitud ha sido recibida para:";
    }
    
    const allNew = [...newNormal, ...newFuture];
    message += formatList(allNew);
  }

  if (!message) {
    message = "Tu registro ya había sido recibido y sigue en proceso.";
  }

  // Título dinámico
  const title = uiConfig.type === 'OPEN' 
    ? uiConfig.registrationToast.title(nameToUse) 
    : "¡Registro Exitoso!";

  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: title,
    message,
    type: "success",
    selected_events: selectedEvents // 🚀 Sincronización de carrusel
  });
}

export async function notifyUserConfirmed(ids: { registrationId: string, clerkId?: string }, confirmedEvents: any[], eventStatuses?: Record<string, string>, selectedEvents?: string[]) {
  const eventList = confirmedEvents.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: "¡Cupo Confirmado!",
    message: `¡Buenas noticias! Tu cupo ha sido confirmado para:${eventList}`,
    type: "success",
    event_statuses: eventStatuses,
    selected_events: selectedEvents // 🚀 Sincronización de carrusel
  });
}

export async function notifyUserEmailChanged(ids: { registrationId: string, clerkId?: string }, oldEmail: string, newEmail: string) {
  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: "¡Correo Actualizado!",
    message: `Tu dirección de correo electrónico principal ha sido actualizada con éxito.\n\n• De: ${oldEmail}\n• A: ${newEmail}\n\nTodos tus registros y el historial de eventos han sido vinculados a tu nueva cuenta.`,
    type: "info"
  });
}

export async function notifyUserRemovedFromEvent(ids: { registrationId: string, clerkId?: string }, event: any, eventStatuses?: Record<string, string>, selectedEvents?: string[]) {
  const eventDetail = `\n• ${formatEventForNotification(event)}`;
  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: "Actualización de Cupo",
    message: `Has sido removido de la lista de espera del evento:${eventDetail}`,
    type: "warning",
    event_statuses: eventStatuses,
    selected_events: selectedEvents // 🚀 Sincronización de carrusel
  });
}

'use server';

import { insertNotification } from "./notifications";
import { formatEventForNotification } from "./utils";

/**
 * 👤 NOTIFICACIONES PARA USUARIOS FINALES
 */

export async function notifyUserRegistrationSuccess(ids: { registrationId: string, clerkId?: string }, newlyAddedEvents: any[], alreadyInEvents: any[]) {
  const isFuture = (e: any) => new Date(e.start_date).getFullYear() === 2099;

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
    if (oldNormal.length > 0) message += formatList(oldNormal);
    if (oldFuture.length > 0) message += `\n\nPróximamente:${formatList(oldFuture)}`;
    message += "\n\n";
  }

  // Construir mensaje de nuevos registros
  if (newNormal.length > 0 || newFuture.length > 0) {
    message += (oldNormal.length > 0 || oldFuture.length > 0) 
      ? "Hemos añadido con éxito tu registro para:" 
      : "¡Registro exitoso! Tu solicitud ha sido recibida para:";
    
    if (newNormal.length > 0) message += formatList(newNormal);
    if (newFuture.length > 0) message += `\n\nPróximamente:${formatList(newFuture)}`;
  }

  if (!message) {
    message = "Tu registro ya había sido recibido y sigue en proceso.";
  }

  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: "Registro Exitoso",
    message,
    type: "success"
  });
}

export async function notifyUserConfirmed(ids: { registrationId: string, clerkId?: string }, confirmedEvents: any[]) {
  const eventList = confirmedEvents.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: "¡Cupo Confirmado!",
    message: `¡Buenas noticias! Tu cupo ha sido confirmado para:${eventList}`,
    type: "success"
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

export async function notifyUserRemovedFromEvent(ids: { registrationId: string, clerkId?: string }, event: any) {
  const eventDetail = `\n• ${formatEventForNotification(event)}`;
  return insertNotification({
    registration_id: ids.registrationId,
    user_id: ids.clerkId,
    title: "Actualización de Cupo",
    message: `Has sido removido de la lista de espera del evento:${eventDetail}`,
    type: "warning"
  });
}

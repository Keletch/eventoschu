'use server';

import { insertNotification } from "./notifications";
import { formatEventForNotification } from "./utils";

/**
 * 👤 NOTIFICACIONES PARA USUARIOS FINALES
 */

export async function notifyUserRegistrationSuccess(ids: { registrationId: string, clerkId?: string }, newlyAddedEvents: any[], alreadyInEvents: any[]) {
  const newNames = newlyAddedEvents.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  const oldNames = alreadyInEvents.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  
  let message = "";
  if (newNames.length > 0 && oldNames.length > 0) {
    message = `Ya estabas registrado en:${oldNames}\n\nHemos añadido con éxito tu registro para:${newNames}`;
  } else if (newNames.length > 0) {
    message = `¡Registro exitoso! Tu solicitud ha sido recibida para:${newNames}`;
  } else {
    message = `Tu registro para:${oldNames}\nya había sido recibido y sigue en proceso.`;
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

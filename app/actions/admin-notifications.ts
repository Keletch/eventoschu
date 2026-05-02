'use server';

import { insertAdminNotification } from "./notifications";
import { formatEventForNotification } from "./utils";

/**
 * 🏢 NOTIFICACIONES PARA ADMINISTRADORES (Auditoría)
 */

export async function notifyAdminNewRegistration(email: string, events: any[]) {
  const eventList = events.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  return insertAdminNotification({
    title: "Nuevo Registro",
    message: `El usuario ${email} se ha inscrito para:${eventList}`,
    type: "info"
  });
}

export async function notifyAdminRegistrationModified(adminEmail: string, targetEmail: string, personalDataChanged: boolean, statusChanges: { event: any, status: string }[]) {
  let message = `El administrador ${adminEmail} modificó el registro de ${targetEmail}.`;
  
  if (personalDataChanged) {
    message += `\n• Se actualizaron datos personales.`;
  }

  if (statusChanges.length > 0) {
    const statusSummary = statusChanges.map(change => {
      const statusText = change.status === 'confirmed' ? 'Aprobado' : change.status === 'cancelled' ? 'Cancelado' : 'Pendiente';
      return `\n✅ ${formatEventForNotification(change.event)} → ${statusText}`;
    }).join('');
    message += `\n\nCambios de estado en:${statusSummary}`;
  }

  return insertAdminNotification({
    admin_email: adminEmail,
    title: "Registro Modificado",
    message,
    type: "info"
  });
}

export async function notifyAdminSurveyCompleted(email: string) {
  return insertAdminNotification({
    title: "Formulario Finalizado",
    message: `El usuario ${email} ha completado exitosamente la encuesta general de perfil.\n\nLos datos ya están disponibles en su ficha de registro.`,
    type: "info"
  });
}

export async function notifyAdminSpecificDataUpdate(email: string, event: any) {
  return insertAdminNotification({
    title: "Datos de Evento Actualizados",
    message: `El usuario ${email} actualizó su información personal para ${formatEventForNotification(event)}.`,
    type: "info"
  });
}


export async function notifyAdminRegistrationDeleted(adminEmail: string, targetEmail: string, events: any[]) {
  const eventList = (events || []).map(e => `\n• ${formatEventForNotification(e)}`).join('');
  return insertAdminNotification({
    admin_email: adminEmail,
    title: "Usuario Purgado (Total)",
    message: `El administrador ${adminEmail} ha purgado permanentemente a ${targetEmail}.\n\nEstaba inscrito en:${eventList || '\n• Ningún evento'}`,
    type: "warning"
  });
}

export async function notifyAdminEventPurged(adminEmail: string, eventTitle: string, affectedUsersCount: number) {
  return insertAdminNotification({
    admin_email: adminEmail,
    title: "Evento Eliminado (Purga)",
    message: `El administrador ${adminEmail} ha eliminado el evento "${eventTitle}".\n\nEsta acción afectó a ${affectedUsersCount} usuarios inscritos (tags removidos y registros actualizados).`,
    type: "warning"
  });
}

export async function notifyAdminEventStatusChanged(adminEmail: string, event: any, isActivated: boolean) {
  const eventDetails = `\n• ${formatEventForNotification(event)}`;
  return insertAdminNotification({
    admin_email: adminEmail,
    title: `Evento ${isActivated ? 'Activado' : 'Desactivado'}`,
    message: `El administrador ${adminEmail} ha ${isActivated ? 'activado' : 'desactivado'} el evento:${eventDetails}\n\nSe han sincronizado los tags en Keap.`,
    type: isActivated ? 'success' : 'warning'
  });
}

export async function notifyAdminMassStatusUpdate(adminEmail: string, eventTitle: string, newStatus: string, affectedCount: number) {
  return insertAdminNotification({
    admin_email: adminEmail,
    title: `Actualización Masiva: ${newStatus.toUpperCase()}`,
    message: `El administrador ${adminEmail} ha cambiado el estado a "${newStatus}" para ${affectedCount} usuarios del evento "${eventTitle}".`,
    type: "info"
  });
}

export async function notifyAdminTagsMigrated(data: {
  adminEmail: string,
  eventTitle: string,
  count: number,
  oldTags: { pending?: string, confirmed?: string },
  newTags: { pending?: string, confirmed?: string }
}) {
  return insertAdminNotification({
    admin_email: data.adminEmail,
    title: "Migración de Tags Completada",
    message: `El administrador ${data.adminEmail} ha actualizado los tags de Keap para ${data.count} usuarios del evento "${data.eventTitle}". \n\n` +
             `Pendiente: ${data.oldTags.pending || 'Ninguno'} ➔ ${data.newTags.pending || 'Ninguno'}\n` +
             `Confirmado: ${data.oldTags.confirmed || 'Ninguno'} ➔ ${data.newTags.confirmed || 'Ninguno'}`,
    type: "info"
  });
}

export async function notifyAdminEmailSynced(oldEmail: string, newEmail: string) {
  return insertAdminNotification({
    title: "Sincronización de Correo",
    message: `Sincronización exitosa de identidad para el usuario.\n\n• Email previo: ${oldEmail}\n• Email actual: ${newEmail}`,
    type: "info"
  });
}

export async function notifyAdminAccountLinked(email: string) {
  return insertAdminNotification({
    title: "Cuenta Verificada (Clerk)",
    message: `El usuario ${email} ha vinculado su registro local con una cuenta de autenticación Clerk.\n\nA partir de ahora, este usuario podrá acceder al portal de autogestión de forma segura.`,
    type: "success"
  });
}

export async function notifyAdminEventAddedToUser(adminEmail: string, targetEmail: string, event: any) {
  const eventDetail = `\n• ${formatEventForNotification(event)}`;
  return insertAdminNotification({
    admin_email: adminEmail,
    title: "Evento Agregado (Manual)",
    message: `El administrador ${adminEmail} ha agregado el evento:${eventDetail}\nal usuario ${targetEmail}.`,
    type: "success"
  });
}

export async function notifyAdminEventRemovedFromUser(adminEmail: string, targetEmail: string, event: any) {
  const eventDetail = `\n• ${formatEventForNotification(event)}`;
  return insertAdminNotification({
    admin_email: adminEmail,
    title: "Evento Eliminado (Manual)",
    message: `El administrador ${adminEmail} ha eliminado permanentemente el evento:${eventDetail}\ndel registro de ${targetEmail}.`,
    type: "warning"
  });
}


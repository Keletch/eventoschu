/**
 * 📝 REGISTRO CENTRALIZADO DE PLANTILLAS DE NOTIFICACIÓN
 * Este archivo es la única fuente de verdad para los mensajes del sistema.
 */

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface NotificationTemplate {
  id: string;
  title: string | ((data: any) => string);
  message: string | ((data: any) => string);
  type: NotificationType;
  action?: 'REFRESH_UI' | 'LOGOUT' | 'RESET_STEP';
}

/**
 * 👤 PLANTILLAS PARA USUARIOS FINALES
 */
export const USER_TEMPLATES: Record<string, NotificationTemplate> = {
  REGISTRATION_SUCCESS: {
    id: 'REGISTRATION_SUCCESS',
    title: (data) => data.isWaitingList ? 'Lista de Espera' : '¡Registro Exitoso!',
    message: (data) => `Tu solicitud ha sido recibida para: ${data.eventNames}`,
    type: 'success',
    action: 'REFRESH_UI'
  },
  EVENT_CONFIRMED: {
    id: 'EVENT_CONFIRMED',
    title: '¡Cupo Confirmado!',
    message: (data) => `Tu lugar ha sido asegurado para: ${data.eventNames}`,
    type: 'success',
    action: 'REFRESH_UI'
  },
  EVENT_REMOVED: {
    id: 'EVENT_REMOVED',
    title: 'Actualización de Registro',
    message: (data) => `Has sido removido ${data.context}: ${data.eventNames}`,
    type: 'warning',
    action: 'REFRESH_UI'
  },
  EMAIL_UPDATED: {
    id: 'EMAIL_UPDATED',
    title: 'Correo Actualizado',
    message: (data) => `Tu dirección principal ahora es: ${data.newEmail}`,
    type: 'info'
  },
  PROFILE_UPDATED: {
    id: 'PROFILE_UPDATED',
    title: 'Perfil Actualizado',
    message: 'Tus datos personales han sido actualizados con éxito.',
    type: 'success',
    action: 'REFRESH_UI'
  },
  EVENT_PURGED: {
    id: 'EVENT_PURGED',
    title: 'Cambios en Programación',
    message: 'Un evento en el que estabas inscrito ha sido cancelado o modificado.',
    type: 'warning',
    action: 'RESET_STEP'
  }
};

/**
 * 🏢 PLANTILLAS PARA ADMINISTRADORES (AUDITORÍA)
 */
export const ADMIN_TEMPLATES: Record<string, NotificationTemplate> = {
  NEW_REGISTRATION: {
    id: 'NEW_REGISTRATION',
    title: 'Nuevo Registro Recibido',
    message: (data) => `El usuario ${data.email} se ha inscrito en ${data.count} eventos.`,
    type: 'info'
  },
  MASS_STATUS_UPDATE: {
    id: 'MASS_STATUS_UPDATE',
    title: 'Acción Masiva Completada',
    message: (data) => `Se cambió el estado a ${data.status} para ${data.count} usuarios de ${data.eventTitle}.`,
    type: 'success'
  },
  USER_PURGED: {
    id: 'USER_PURGED',
    title: 'Usuario Eliminado',
    message: (data) => `El administrador ${data.adminEmail} eliminó permanentemente a ${data.targetEmail}.`,
    type: 'warning'
  },
  KEAP_SYNC_ERROR: {
    id: 'KEAP_SYNC_ERROR',
    title: 'Error de Sincronización',
    message: (data) => `Fallo al sincronizar tags de Keap para ${data.email}: ${data.error}`,
    type: 'error'
  }
};

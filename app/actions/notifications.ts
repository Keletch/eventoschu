'use server';

import { createClient } from "@supabase/supabase-js";
import { formatEventForNotification } from "./utils";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * 📥 Base para insertar en la tabla de notificaciones
 */
export async function insertNotification(data: {
  user_id?: string;
  is_admin?: boolean;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
}) {
  try {
    await supabaseAdmin.from('notifications').insert([{
      ...data,
      is_admin: data.is_admin || false,
      type: data.type || 'info',
      read: false
    }]);
  } catch (err) {
    console.error("❌ Notification Error:", err);
  }
}

/**
 * 📥 Leer notificaciones
 */
export async function getNotifications(userId: string, isAdmin = false) {
  try {
    const query = supabaseAdmin
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (isAdmin) {
      query.eq('is_admin', true);
    } else {
      query.eq('user_id', userId).eq('is_admin', false);
    }

    const { data, error } = await query;
    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 📥 Marcar como leída
 */
export async function markAsRead(notificationId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 📥 Marcar todas como leídas
 */
export async function markAllAsRead(userId: string, isAdmin = false) {
  try {
    const query = supabaseAdmin
      .from('notifications')
      .update({ read: true })
      .eq('read', false);

    if (isAdmin) {
      query.eq('is_admin', true);
    } else {
      query.eq('user_id', userId);
    }

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 🏢 FUNCIONES DE NOTIFICACIÓN (Individuales para evitar error de Next.js)
 */

export async function notifyAdminNewRegistration(email: string, events: any[]) {
  const eventList = events.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  return insertNotification({
    is_admin: true,
    title: "Nuevo Registro",
    message: `${email} se ha inscrito para:${eventList}`,
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

  return insertNotification({
    is_admin: true,
    title: "Registro Modificado",
    message,
    type: "info"
  });
}

export async function notifyAdminSurveyCompleted(email: string) {
  return insertNotification({
    is_admin: true,
    title: "Encuesta Completada",
    message: `El usuario ${email} ha completado el formulario general.`,
    type: "info"
  });
}

export async function notifyAdminSpecificDataUpdate(email: string, event: any) {
  return insertNotification({
    is_admin: true,
    title: "Datos de Evento Actualizados",
    message: `El usuario ${email} actualizó su información personal para ${formatEventForNotification(event)}.`,
    type: "info"
  });
}

export async function notifyAdminEmailChanged(oldEmail: string, newEmail: string) {
  return insertNotification({
    is_admin: true,
    title: "Cambio de Email (Clerk)",
    message: `${oldEmail} ha cambiado su correo a ${newEmail} vía Clerk.`,
    type: "warning"
  });
}

export async function notifyAdminRegistrationDeleted(adminEmail: string, targetEmail: string) {
  return insertNotification({
    is_admin: true,
    title: "Registro Eliminado",
    message: `El registro de ${targetEmail} ha sido eliminado permanentemente por ${adminEmail}.`,
    type: "warning"
  });
}

export async function notifyAdminEmailSynced(email: string) {
  return insertNotification({
    is_admin: true,
    title: "Email Sincronizado",
    message: `El usuario ha sincronizado su cuenta con el nuevo email: ${email}.`,
    type: "info"
  });
}

export async function notifyAdminAccountLinked(email: string) {
  return insertNotification({
    is_admin: true,
    title: "Cuenta Vinculada",
    message: `La cuenta de ${email} ha sido vinculada exitosamente con Clerk.`,
    type: "success"
  });
}

export async function notifyUserRegistrationSuccess(userId: string, newlyAddedEvents: any[], alreadyInEvents: any[]) {
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
    user_id: userId,
    title: "Registro Exitoso",
    message,
    type: "success"
  });
}

export async function notifyUserConfirmed(userId: string, confirmedEvents: any[]) {
  const eventList = confirmedEvents.map(e => `\n• ${formatEventForNotification(e)}`).join('');
  return insertNotification({
    user_id: userId,
    title: "¡Cupo Confirmado!",
    message: `¡Buenas noticias! Tu cupo ha sido confirmado para:${eventList}`,
    type: "success"
  });
}

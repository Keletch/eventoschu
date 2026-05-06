'use server';

import { supabaseAdmin } from "@/lib/supabase-admin";
import { broadcastToAdmins, broadcastToUser } from "./utils-realtime";

/**
 * 🏢 Base para insertar en la tabla de admin_notifications (Auditoría)
 */
export async function insertAdminNotification(data: {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  admin_email?: string;
  metadata?: any;
}) {
  try {
    const { data: newNotif, error } = await supabaseAdmin.from('admin_notifications').insert([{
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      admin_email: data.admin_email,
      metadata: data.metadata || {},
      read: false
    }]).select().single();

    if (error) throw error;

    // 📢 Notificar en tiempo real (Canal Administrativo)
    await broadcastToAdmins(newNotif);

  } catch (err) {
    console.error("❌ Admin Notification Error:", err);
  }
}

/**
 * 👤 Base para insertar en la tabla de notifications (Usuario)
 */
export async function insertNotification(data: {
  user_id?: string; // Clerk ID
  registration_id?: string; // Supabase UUID
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning';
  event_statuses?: any; // 🚀 Estados opcionales para sincronización RT
  selected_events?: string[]; // 🚀 Lista de eventos actualizada
}) {
  try {
    const { data: newNotif, error } = await supabaseAdmin.from('notifications').insert([{
      user_id: data.user_id,
      registration_id: data.registration_id,
      title: data.title,
      message: data.message,
      is_admin: false,
      type: data.type || 'info',
      read: false
    }]).select().single();

    if (error) throw error;

    // 📢 Notificar en tiempo real (Canal Privado de Usuario)
    const targets = [data.registration_id, data.user_id].filter(Boolean) as string[];
    if (targets.length > 0) {
      await broadcastToUser(targets, { 
        ...newNotif, 
        event_statuses: data.event_statuses, // 💡 Adjuntamos los estados al broadcast
        selected_events: data.selected_events // 💡 Adjuntamos la lista de eventos actualizada
      });
    }

    return { success: true, data: newNotif };
  } catch (err) {
    console.error("❌ User Notification Error:", err);
    return { success: false, error: err };
  }
}

/**
 * 📥 Obtener notificaciones
 */
export async function getNotifications(ids: { clerkId?: string, registrationId?: string }, isAdmin = false) {
  try {
    const tableName = isAdmin ? 'admin_notifications' : 'notifications';
    let query = supabaseAdmin
      .from(tableName)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (!isAdmin) {
      const conditions = [];
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

      if (ids.clerkId) {
        conditions.push(`user_id.eq.${ids.clerkId}`);
      }
      
      if (ids.registrationId && uuidRegex.test(ids.registrationId)) {
        conditions.push(`registration_id.eq.${ids.registrationId}`);
      }

      if (conditions.length > 0) {
        query = query.or(conditions.join(','));
      } else if (!ids.clerkId && !ids.registrationId) {
        // Si no hay IDs en modo usuario, devolvemos vacío por seguridad
        return { success: true, data: [] };
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return { success: true, data: data || [] };
  } catch (err: any) {
    console.error(`❌ Error fetching notifications [${isAdmin ? 'ADMIN' : 'USER'}]:`, err);
    return { success: false, error: err.message };
  }
}

/**
 * 📥 Marcar como leída
 */
export async function markAsRead(notificationId: string, isAdmin = false) {
  try {
    const tableName = isAdmin ? 'admin_notifications' : 'notifications';
    const { error } = await supabaseAdmin
      .from(tableName)
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
export async function markAllAsRead(ids: { clerkId?: string, registrationId?: string }, isAdmin = false) {
  try {
    const tableName = isAdmin ? 'admin_notifications' : 'notifications';
    let query = supabaseAdmin
      .from(tableName)
      .update({ read: true })
      .eq('read', false);

    if (!isAdmin) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      const hasValidClerk = !!ids.clerkId;
      const hasValidUUID = ids.registrationId && uuidRegex.test(ids.registrationId);

      if (hasValidClerk && hasValidUUID) {
        query = query.or(`user_id.eq.${ids.clerkId},registration_id.eq.${ids.registrationId}`);
      } else if (hasValidClerk) {
        query = query.eq('user_id', ids.clerkId);
      } else if (hasValidUUID) {
        query = query.eq('registration_id', ids.registrationId);
      } else {
        return { success: true };
      }
    }

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 🗑️ Eliminar notificación
 */
export async function deleteNotification(notificationId: string, isAdmin = false) {
  try {
    const tableName = isAdmin ? 'admin_notifications' : 'notifications';
    const { error } = await supabaseAdmin
      .from(tableName)
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

'use server';

import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

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
    await supabaseAdmin.from('admin_notifications').insert([{
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      admin_email: data.admin_email,
      metadata: data.metadata || {},
      read: false
    }]);
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

    // --- TIEMPO REAL SEGURO (BROADCAST) ---
    const targetId = data.registration_id || data.user_id;
    if (targetId && newNotif) {
      const channel = supabaseAdmin.channel(`user-updates:${targetId}`);
      await channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.send({
            type: 'broadcast',
            event: 'new-notification',
            payload: newNotif,
          });
          supabaseAdmin.removeChannel(channel);
        }
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
      if (ids.clerkId && ids.registrationId) {
        query = query.or(`user_id.eq.${ids.clerkId},registration_id.eq.${ids.registrationId}`);
      } else if (ids.clerkId) {
        query = query.eq('user_id', ids.clerkId);
      } else if (ids.registrationId) {
        query = query.eq('registration_id', ids.registrationId);
      } else {
        return { success: true, data: [] };
      }
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
      if (ids.clerkId && ids.registrationId) {
        query = query.or(`user_id.eq.${ids.clerkId},registration_id.eq.${ids.registrationId}`);
      } else if (ids.clerkId) {
        query = query.eq('user_id', ids.clerkId);
      } else if (ids.registrationId) {
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

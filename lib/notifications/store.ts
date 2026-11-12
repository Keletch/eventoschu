import "server-only";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { broadcastToAdmins } from "@/app/actions/utils-realtime";


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

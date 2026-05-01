'use server';
import { createClient } from "@supabase/supabase-js";

// Note: Using standard createClient with service role or anon key for server actions
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function getNotifications(userId: string, isAdmin = false) {
  try {
    const query = supabase
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

export async function markAsRead(notificationId: string) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAllAsRead(userId: string, isAdmin = false) {
  try {
    const query = supabase
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

'use server';

import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdminPermission } from "./admin-check";

type NotificationIds = { clerkId?: string, registrationId?: string };

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 🛡️ Resuelve el alcance permitido de la consulta.
 * - Admin: exige sesión de admin verificada en servidor (el flag del cliente no basta).
 * - Usuario: el clerkId sale de la sesión de Clerk (nunca del cliente). El registrationId (UUID)
 *   se acepta del cliente porque es el identificador de los invitados sin cuenta.
 * Devuelve el filtro PostgREST para `.or()` o null si no hay identidad válida.
 */
async function resolveScope(ids: NotificationIds = {}, isAdmin: boolean): Promise<{ table: string, filter: string | null } | null> {
  if (isAdmin) {
    const { isAdmin: ok } = await verifyAdminPermission();
    return ok ? { table: 'admin_notifications', filter: null } : null;
  }

  const { userId } = await auth();
  const conditions: string[] = [];
  if (userId) conditions.push(`user_id.eq.${userId}`);
  if (ids.registrationId && UUID_REGEX.test(ids.registrationId)) {
    conditions.push(`registration_id.eq.${ids.registrationId}`);
  }

  return conditions.length > 0 ? { table: 'notifications', filter: conditions.join(',') } : null;
}

/**
 * 📥 Obtener notificaciones
 */
export async function getNotifications(ids: NotificationIds, isAdmin = false) {
  try {
    const scope = await resolveScope(ids, isAdmin);
    if (!scope) return isAdmin ? { success: false, error: "No tienes permisos" } : { success: true, data: [] };

    let query = supabaseAdmin
      .from(scope.table)
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (scope.filter) query = query.or(scope.filter);

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
export async function markAsRead(notificationId: string, isAdmin = false, ids: NotificationIds = {}) {
  try {
    const scope = await resolveScope(ids, isAdmin);
    if (!scope) return { success: false, error: "No autorizado" };

    let query = supabaseAdmin
      .from(scope.table)
      .update({ read: true })
      .eq('id', notificationId);

    if (scope.filter) query = query.or(scope.filter);

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * 📥 Marcar todas como leídas
 */
export async function markAllAsRead(ids: NotificationIds, isAdmin = false) {
  try {
    const scope = await resolveScope(ids, isAdmin);
    if (!scope) return isAdmin ? { success: false, error: "No autorizado" } : { success: true };

    let query = supabaseAdmin
      .from(scope.table)
      .update({ read: true })
      .eq('read', false);

    if (scope.filter) query = query.or(scope.filter);

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
export async function deleteNotification(notificationId: string, isAdmin = false, ids: NotificationIds = {}) {
  try {
    const scope = await resolveScope(ids, isAdmin);
    if (!scope) return { success: false, error: "No autorizado" };

    let query = supabaseAdmin
      .from(scope.table)
      .delete()
      .eq('id', notificationId);

    if (scope.filter) query = query.or(scope.filter);

    const { error } = await query;
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

'use server';

import { verifyAdminPermission } from "./admin-check";
import * as adminNotifications from "@/lib/notifications/admin-notifications";

/**
 * 🏢 Puntos de entrada del panel para auditoría.
 * La lógica vive en `lib/notifications/admin-notifications.ts` (server-only).
 * Aquí solo se exponen las que el cliente necesita, con verificación de admin
 * y el email del actor tomado de la sesión (no del cliente).
 */

export async function notifyAdminEventStatusChanged(_adminEmail: string, event: any, isActivated: boolean, removeKeapTags: boolean = true) {
  const { isAdmin, email } = await verifyAdminPermission();
  if (!isAdmin || !email) return;
  return adminNotifications.notifyAdminEventStatusChanged(email, event, isActivated, removeKeapTags);
}

export async function notifyAdminTagsMigrated(data: Parameters<typeof adminNotifications.notifyAdminTagsMigrated>[0]) {
  const { isAdmin, email } = await verifyAdminPermission();
  if (!isAdmin || !email) return;
  return adminNotifications.notifyAdminTagsMigrated({ ...data, adminEmail: email });
}

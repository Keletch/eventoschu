"use server";

import { verifyAdminPermission } from "./admin-check";
import * as keap from "@/lib/keap";

/**
 * 🛠️ Puntos de entrada de Keap para el cliente.
 * Toda la lógica (incluido `keapFetch`) vive en `lib/keap.ts` (server-only)
 * para que nunca pueda quedar expuesta como Server Action.
 */

/** 🏷️ Catálogo de tags (solo panel admin) */
export async function getKeapTags() {
  const { isAdmin } = await verifyAdminPermission();
  if (!isAdmin) return { success: false, error: "No tienes permisos" };
  return keap.getKeapTags();
}

/** 🏷️ Tags de un contacto (precios promocionales en la Event Card) */
export async function getContactTagsByEmail(email: string) {
  return keap.getContactTagsByEmail(email);
}

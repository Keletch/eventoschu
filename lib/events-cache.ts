import "server-only";

import { Redis } from "@upstash/redis";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * 🗄️ Caché de eventos en Redis (Upstash) — uso interno del servidor.
 * La acción pública protegida para el panel está en `app/actions/events.ts`.
 */
export const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

export const EVENTS_CACHE_KEY = "events_list_v2";
export const CACHE_TTL = 3600; // 1 hora

const CONFIRMED_TAGS_WHITELIST_KEY = "keap_confirmed_tags_whitelist";

/** Reconstruye la lista de tags de confirmación de eventos activos con 'Pago con cupo' */
async function buildConfirmedTagsWhitelist(): Promise<string[]> {
  const { data: events } = await supabaseAdmin
    .from('events')
    .select('keap_tag_id, initial_status, event_tags(tags(*))')
    .eq('active', true)
    .eq('initial_status', 'pending')
    .not('keap_tag_id', 'is', null);

  const pagoCupoEvents = (events || []).filter(e =>
    (e.event_tags || []).some((et: any) => et.tags?.slug === 'pago_cupo')
  );

  const tagIds = Array.from(new Set(pagoCupoEvents.map(e => e.keap_tag_id?.toString()).filter(Boolean))) as string[];
  await redis.set(CONFIRMED_TAGS_WHITELIST_KEY, tagIds, { ex: CACHE_TTL });
  return tagIds;
}

/**
 * 🏷️ Obtiene la lista blanca de IDs de tags de confirmación para eventos activos con 'Pago con cupo' desde Redis
 */
export async function getConfirmedTagsWhitelist(): Promise<string[]> {
  try {
    const cached = await redis.get<string[]>(CONFIRMED_TAGS_WHITELIST_KEY);
    if (cached && Array.isArray(cached)) return cached;
    return await buildConfirmedTagsWhitelist();
  } catch (_e) {
    return [];
  }
}

/**
 * 🔄 Actualiza la lista blanca de tags en Redis (solo eventos Pago con cupo)
 */
export async function refreshConfirmedTagsWhitelist() {
  try {
    const tagIds = await buildConfirmedTagsWhitelist();
    return { success: true, count: tagIds.length };
  } catch (_e) {
    return { success: false };
  }
}

/**
 * 🧹 Limpia el caché de eventos en Redis
 * Si `refreshWhitelist` es true (por ejemplo, al crear/editar un evento con Pago con cupo), también actualiza la whitelist.
 */
export async function clearEventsCache(refreshWhitelist = false) {
  try {
    const tasks: Promise<any>[] = [redis.del(EVENTS_CACHE_KEY)];
    if (refreshWhitelist) {
      tasks.push(refreshConfirmedTagsWhitelist());
    }
    await Promise.all(tasks);
    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

"use server";

import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

import { supabaseAdmin } from "@/lib/supabase-admin";

const EVENTS_CACHE_KEY = "events_list_v2";
const CACHE_TTL = 3600; // 1 hora

export interface Event {
  id: string;
  title: string;
  city: string;
  country: string;
  start_date: string;
  active: boolean;
  time?: string;
  duration?: string;
  location?: string;
  price?: string;
  capacity?: number;
  flag?: string;
  bg_class?: string;
  initial_status?: string;
  created_at?: string;
  keap_tag_id?: string;
  keap_pending_tag_id?: string;
  categories?: { name: string } | { name: string }[];
  performer?: string;
}

/**
 * 📅 Obtiene eventos con capa de caché inteligente en Redis
 */
export async function getEvents() {
  try {
    // 1. Intentar desde Cache
    const cached = await redis.get(EVENTS_CACHE_KEY);
    if (cached) return { success: true, data: cached as Event[], source: "cache" };

    // 2. Si no hay cache, ir a Supabase
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, categories(name)')
      .eq('active', true)
      .order('start_date', { ascending: true });

    if (error) throw error;

    // 3. Guardar en Cache
    if (data && data.length > 0) {
      await redis.set(EVENTS_CACHE_KEY, data, { ex: CACHE_TTL });
    }

    return { success: true, data: data as Event[], source: "supabase" };
  } catch (error: any) {
    console.error("❌ getEvents Error:", error);
    
    // Fallback: Supabase directo sin cache
    try {
      const { data } = await supabaseAdmin
        .from('events')
        .select('*, categories(name)')
        .eq('active', true)
        .order('start_date', { ascending: true });
      return { success: true, data: data as Event[], source: "fallback" };
    } catch (e) {
      return { success: false, error: "Error al cargar eventos" };
    }
  }
}

/**
 * 🧹 Limpia manualmente el caché de eventos
 */
export async function clearEventsCache() {
  try {
    await redis.del(EVENTS_CACHE_KEY);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

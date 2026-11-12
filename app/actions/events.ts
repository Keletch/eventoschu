"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { redis, EVENTS_CACHE_KEY, CACHE_TTL, clearEventsCache as clearCache } from "@/lib/events-cache";
import { verifyAdminPermission } from "./admin-check";

export interface PaidLink {
  url: string;
  button_text?: string;
  keap_tag_id?: string;
  price?: string;
  // Campos de soporte para la etiqueta Pago con cupo en eventos cerrados
  type?: string;
  checkout_url?: string;
  checkout_button_text?: string;
  waitlist_button_text?: string;
  use_external_waitlist?: boolean;
  paid_waitlist_url?: string;
  // Enlace alternativo a Paso 2 (TYP externa)
  external_typ_url?: string;
  // Paso 3: Comunidad / WhatsApp
  whatsapp_url?: string;
  whatsapp_button_text?: string;
  whatsapp_description?: string;
}

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  city: string;
  country: string;
  start_date: string;
  end_date?: string | null;
  active: boolean;
  time?: string;
  timezone?: string;
  duration?: string;
  location?: string;
  is_virtual?: boolean;
  price?: string;
  capacity?: number;
  flag?: string;
  bg_class?: string;
  initial_status?: string;
  created_at?: string;
  keap_tag_id?: string;
  keap_pending_tag_id?: string;
  paid_links?: PaidLink[] | null;
  categories?: { 
    id?: string; 
    name: string; 
    icon?: string | null;
    parent_category_id?: string | null;
    parent_category?: { id: string; name: string; icon?: string | null; };
  } | any;
  performer?: string;
  description?: string | null;
  info_url?: string | null;
  external_url?: string | null;
  external_button_text?: string | null;
  external_typ_url?: string | null;
  whatsapp_url?: string | null;
  whatsapp_button_text?: string | null;
  whatsapp_description?: string | null;
  event_tags?: {
    tags: {
      id: string;
      name: string;
      slug: string;
      color_hex: string;
    };
  }[];
}

/**
 * 📅 Obtiene eventos con capa de caché inteligente en Redis
 */
export async function getEvents(bypassCache = false) {
  // Obtener la fecha de hoy en formato YYYY-MM-DD
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split('T')[0];

  try {
    // 1. Intentar desde Cache (si no se pide bypass)
    if (!bypassCache) {
      const cached = await redis.get(EVENTS_CACHE_KEY);
      if (cached) {
        // Filtrar también el caché por si hay eventos que caducaron mientras estaban en memoria
        const validEvents = (cached as Event[]).filter(e => e.start_date >= todayStr);
        return { success: true, data: validEvents, source: "cache" };
      }
    }

    // 2. Si no hay cache, ir a Supabase (solo eventos futuros/de hoy)
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, categories(*, parent_category:parent_category_id(id, name, icon)), event_tags(tags(*))')
      .eq('active', true)
      .gte('start_date', todayStr)
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
        .select('*, categories(*, parent_category:parent_category_id(id, name, icon)), event_tags(tags(*))')
        .eq('active', true)
        .gte('start_date', todayStr)
        .order('start_date', { ascending: true });
      return { success: true, data: data as Event[], source: "fallback" };
    } catch (_e) {
      return { success: false, error: "Error al cargar eventos" };
    }
  }
}

/**
 * 🧹 Limpia el caché de eventos (solo panel admin).
 * Uso interno del servidor: importar `clearEventsCache` de `@/lib/events-cache`.
 */
export async function clearEventsCache(refreshWhitelist = false) {
  const { isAdmin } = await verifyAdminPermission();
  if (!isAdmin) return { success: false };
  return clearCache(refreshWhitelist);
}

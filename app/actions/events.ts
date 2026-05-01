"use server";

import { Redis } from "@upstash/redis";
import { createClient } from "@supabase/supabase-js";

// Upstash Redis setup - Using Vercel's standard KV environment variables
const redis = new Redis({
  url: process.env.KV_REST_API_URL!,
  token: process.env.KV_REST_API_TOKEN!,
});

// Supabase Admin setup for server-side fetching
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const EVENTS_CACHE_KEY = "events_list_v2";
const CACHE_TTL = 3600; // 1 hour in seconds

/**
 * Fetches events with an intelligent caching layer using Redis.
 * This significantly reduces Supabase load and improves response times.
 */
export async function getEvents() {
  try {
    // 1. Try to get from Redis Cache first
    const cachedEvents = await redis.get(EVENTS_CACHE_KEY);
    
    if (cachedEvents) {
      return { success: true, data: cachedEvents as any[], source: "cache" };
    }

    // 2. If not in cache, fetch from Supabase
    const { data, error } = await supabaseAdmin
      .from('events')
      .select('*, categories(name)')
      .eq('active', true)
      .order('start_date', { ascending: true });

    if (error) throw error;

    // 3. Store in Redis with TTL (1 hour)
    if (data && data.length > 0) {
      await redis.set(EVENTS_CACHE_KEY, data, { ex: CACHE_TTL });
    }

    return { success: true, data: data as any[], source: "supabase" };
  } catch (error: any) {
    console.error("Error fetching events:", error);
    
    // Fallback: If Redis fails, try a direct Supabase fetch without throwing
    try {
      const { data } = await supabaseAdmin
        .from('events')
        .select('*')
        .eq('active', true)
        .order('start_date', { ascending: true });
      return { success: true, data: data as any[], source: "fallback" };
    } catch (e) {
      return { success: false, error: error.message };
    }
  }
}

/**
 * Utility to clear the events cache manually (e.g. after adding events in admin)
 */
export async function clearEventsCache() {
  try {
    await redis.del(EVENTS_CACHE_KEY);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

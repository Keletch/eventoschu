import "server-only";

import { createClient } from "@supabase/supabase-js";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Sin la Service Role Key, RLS bloquea todo en silencio (listas vacías). Mejor fallar visible.
if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY no está configurada: el cliente admin de Supabase no puede inicializarse.");
}

/**
 * 🔒 SUPABASE ADMIN CLIENT
 * Este cliente tiene privilegios de Service Role para bypass de RLS.
 * Se utiliza exclusivamente en Server Actions y servicios de backend.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  serviceRoleKey,
  { 
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    } 
  }
);

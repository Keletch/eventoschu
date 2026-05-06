import { createClient } from "@supabase/supabase-js";

/**
 * 🔒 SUPABASE ADMIN CLIENT
 * Este cliente tiene privilegios de Service Role para bypass de RLS.
 * Se utiliza exclusivamente en Server Actions y servicios de backend.
 */
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { 
    auth: { 
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    } 
  }
);

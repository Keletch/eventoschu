'use server';

import { createSupabaseServer } from "@/lib/supabase-server";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * 🛡️ Verifica si el usuario actual está en la lista blanca de administradores
 */
export async function verifyAdminPermission() {
  try {
    // 🔍 1. Obtener el usuario desde el cliente que SI lee las cookies del servidor
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || !user.email) return { isAdmin: false, email: null };

    // 🔑 2. Consultar la tabla de admins usando el cliente con permisos totales
    const { data: admin, error } = await supabaseAdmin
      .from('admins')
      .select('email')
      .eq('email', user.email.toLowerCase().trim())
      .single();

    if (error || !admin) {
      console.warn(`🛑 Intento de acceso no autorizado: ${user.email}`);
      return { isAdmin: false, email: user.email };
    }

    return { isAdmin: true, email: user.email };
  } catch (_err) {
    return { isAdmin: false, email: null };
  }
}

import { createClient } from '@supabase/supabase-js';

// Cliente administrativo para bypass de RLS en emisiones
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

/**
 * 🏗️ ARQUITECTURA DE TIEMPO REAL (SOLID)
 * Dividimos las responsabilidades de emisión para evitar mezclar canales.
 */

// 1. CANAL ADMINISTRATIVO: Solo para la gestión del panel
export async function broadcastToAdmins(payload: any) {
  const channelName = 'admin-updates';
  const channel = supabaseAdmin.channel(channelName);

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      try {
        // 1. Enviamos el refresh general
        await channel.send({
          type: 'broadcast',
          event: 'admin-refresh',
          payload: { ...payload, timestamp: new Date().toISOString() }
        });
        
        // 2. Si hay un payload detallado (una notificación), la enviamos
        if (payload && payload.title) {
          await channel.send({
            type: 'broadcast',
            event: 'new-notification',
            payload: payload
          });
        }
      } finally {
        supabaseAdmin.removeChannel(channel);
      }
    }
  });
  return { success: true };
}

// 2. CANAL PRIVADO DE USUARIO: Para Toasts, tags y cambios de estado personales
export async function broadcastToUser(targetIds: string | string[], payload: any) {
  const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
  
  // 🚀 Optimizamos: Enviamos y cerramos rápido sin bloquear el hilo principal del servidor
  for (const id of ids) {
    if (!id || id === 'guest') continue;
    
    const channelName = `user-private:${id}`;
    const channel = supabaseAdmin.channel(channelName);
    
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          // Enviamos actualización y notificación en un solo envío si es posible
          await channel.send({
            type: 'broadcast',
            event: 'personal-update',
            payload: { ...payload, timestamp: new Date().toISOString() }
          });
          
          if (payload && (payload.title || payload.type === 'notification')) {
            await channel.send({
              type: 'broadcast',
              event: 'new-notification',
              payload: payload
            });
          }
        } finally {
          supabaseAdmin.removeChannel(channel);
        }
      }
    });
  }
  // Devolvemos éxito de inmediato para no secuestrar la promesa del servidor
  return { success: true };
}

// 3. CANAL PÚBLICO GLOBAL: Solo para disponibilidad y eventos (Barras de progreso)
export async function broadcastToPublic() {
  const channelName = 'global-counts';
  const channel = supabaseAdmin.channel(channelName);

  channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      try {
        await channel.send({
          type: 'broadcast',
          event: 'counts-updated',
          payload: { timestamp: new Date().toISOString() }
        });
      } finally {
        supabaseAdmin.removeChannel(channel);
      }
    }
  });
  return { success: true };
}

// Función legacy para compatibilidad mientras migramos el resto (Deprecada)
export async function broadcastDataChange(type: any, payload: any, targetId: any) {
  console.warn("⚠️ Usando broadcastDataChange deprecado. Migrar a funciones específicas.");
  if (type === 'registrations') {
    await broadcastToAdmins(payload);
    if (targetId) await broadcastToUser(targetId, payload);
    await broadcastToPublic();
  } else if (type === 'notifications') {
    if (targetId) await broadcastToUser(targetId, payload);
  }
}

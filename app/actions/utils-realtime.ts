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
  const channel = supabaseAdmin.channel('admin-updates');
  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      // Enviamos el refresh general
      await channel.send({
        type: 'broadcast',
        event: 'admin-refresh',
        payload: { ...payload, timestamp: new Date().toISOString() }
      });
      
      // Si hay un payload detallado (una notificación), la enviamos específicamente
      if (payload && payload.title) {
        await channel.send({
          type: 'broadcast',
          event: 'new-notification',
          payload: payload
        });
      }
      
      setTimeout(() => supabaseAdmin.removeChannel(channel), 1000);
    }
  });
}

// 2. CANAL PRIVADO DE USUARIO: Para Toasts, tags y cambios de estado personales
export async function broadcastToUser(targetIds: string | string[], payload: any) {
  const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
  console.log(`📡 [Realtime-Server] Iniciando broadcast para ${ids.length} usuarios...`);
  
  for (const id of ids) {
    if (!id || id === 'guest') continue;
    const channelName = `user-private:${id}`;
    const channel = supabaseAdmin.channel(channelName);
    
    console.log(`🔌 [Realtime-Server] Intentando suscribir a: ${channelName}`);
    
    await channel.subscribe(async (status) => {
      console.log(`📡 [Realtime-Server] Estado del canal ${channelName}: ${status}`);
      
      if (status === 'SUBSCRIBED') {
        console.log(`🚀 [Realtime-Server] Emitiendo datos a ${channelName}...`);
        
        // 1. Enviamos actualización de datos (Estados, Indicators, etc)
        await channel.send({
          type: 'broadcast',
          event: 'personal-update',
          payload: { 
            ...payload, 
            timestamp: new Date().toISOString() 
          }
        });
        
        // 2. Si el payload tiene estructura de notificación, activamos la campana
        if (payload && (payload.title || payload.type === 'notification')) {
          console.log(`🔔 [Realtime-Server] Emitiendo notificación a ${channelName}`);
          await channel.send({
            type: 'broadcast',
            event: 'new-notification',
            payload: payload
          });
        }
        
        // Limpieza con retraso para asegurar entrega
        setTimeout(() => {
          supabaseAdmin.removeChannel(channel);
          console.log(`🔌 [Realtime-Server] Canal ${channelName} cerrado.`);
        }, 3000);
      }
    });
  }
}

// 3. CANAL PÚBLICO GLOBAL: Solo para disponibilidad y eventos (Barras de progreso)
export async function broadcastToPublic() {
  const channel = supabaseAdmin.channel('global-counts');
  await channel.subscribe(async (status) => {
    if (status === 'SUBSCRIBED') {
      await channel.send({
        type: 'broadcast',
        event: 'counts-updated',
        payload: { timestamp: new Date().toISOString() }
      });
      setTimeout(() => supabaseAdmin.removeChannel(channel), 1000);
    }
  });
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

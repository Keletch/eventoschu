import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * 🏗️ ARQUITECTURA DE TIEMPO REAL (SOLID)
 * Dividimos las responsabilidades de emisión para evitar mezclar canales.
 */

// 1. CANAL ADMINISTRATIVO: Solo para la gestión del panel
export async function broadcastToAdmins(payload: any) {
  const channelName = 'admin-updates';
  const channel = supabaseAdmin.channel(channelName);

  console.log(`[Realtime] 🏢 Broadcasting to Admins...`);

  return new Promise((resolve) => {
    channel.subscribe(async (status) => {
      console.log(`[Realtime] 🔌 Admin Channel Status: ${status}`);
      if (status === 'SUBSCRIBED') {
        try {
          // 1. Refresh general
          await channel.send({
            type: 'broadcast',
            event: 'admin-refresh',
            payload: { ...payload, timestamp: new Date().toISOString() }
          });
          
          // 2. Notificación detallada
          if (payload && payload.title) {
            await channel.send({
              type: 'broadcast',
              event: 'new-notification',
              payload: payload
            });
          }
          console.log(`[Realtime] ✅ Admin broadcast completado.`);
          resolve(true);
        } catch (err) {
          console.error(`[Realtime] ❌ Admin Broadcast Error:`, err);
          resolve(false);
        } finally {
          supabaseAdmin.removeChannel(channel);
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        resolve(false);
      }
    });
  });
}

// 2. CANAL PRIVADO DE USUARIO: Para Toasts, tags y cambios de estado personales
export async function broadcastToUser(targetIds: string | string[], payload: any) {
  const ids = Array.isArray(targetIds) ? targetIds : [targetIds];
  const cleanIds = Array.from(new Set(ids.filter(id => id && id !== 'guest')));
  
  if (cleanIds.length === 0) {
    console.warn("[Realtime] ⚠️ No hay IDs válidos para broadcast.");
    return { success: true };
  }

  console.log(`[Realtime] 📡 Iniciando broadcast para IDs:`, cleanIds);

  const broadcastPromises = cleanIds.map(id => {
    const channelName = `user-private:${id}`;
    const channel = supabaseAdmin.channel(channelName);
    
    return new Promise((resolve) => {
      channel.subscribe(async (status) => {
        console.log(`[Realtime] 🔌 Canal ${channelName} status: ${status}`);
        if (status === 'SUBSCRIBED') {
          try {
            await channel.send({
              type: 'broadcast',
              event: 'personal-update',
              payload: { ...payload, timestamp: new Date().toISOString(), msg_id: globalThis.crypto.randomUUID() }
            });
            
            if (payload && (payload.title || payload.type === 'notification')) {
              await channel.send({
                type: 'broadcast',
                event: 'new-notification',
                payload: payload
              });
            }
            console.log(`[Realtime] ✅ Mensajes enviados al canal ${channelName}`);
            resolve(true);
          } catch (err) {
            console.error(`[Realtime] ❌ Error en canal ${channelName}:`, err);
            resolve(false);
          } finally {
            supabaseAdmin.removeChannel(channel);
          }
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          resolve(false);
        }
      });
    });
  });

  const results = await Promise.all(broadcastPromises);
  return { success: results.some(r => r === true) };
}

// 3. CANAL PÚBLICO GLOBAL: Solo para disponibilidad y eventos (Barras de progreso)
export async function broadcastToPublic() {
  const channelName = 'global-counts';
  const channel = supabaseAdmin.channel(channelName);

  return new Promise((resolve) => {
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        try {
          await channel.send({
            type: 'broadcast',
            event: 'counts-updated',
            payload: { timestamp: new Date().toISOString() }
          });
          resolve(true);
        } catch (err) {
          console.error(`[Realtime] ❌ Public Broadcast Error:`, err);
          resolve(false);
        } finally {
          supabaseAdmin.removeChannel(channel);
        }
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        resolve(false);
      }
    });
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

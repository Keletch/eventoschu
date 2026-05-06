'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";

interface PersonalRealtimeProps {
  userId?: string | string[]; // UUID o ClerkID (ahora soporta múltiples)
  onUpdate: (payload: any) => void;
  onNotification?: (notification: any) => void;
}

/**
 * 🔒 Hook de Sincronización Personal
 * Propósito: Toasts de confirmación, cambios de etiquetas y notificaciones privadas.
 * Canal: 'user-private:ID'
 */
export function usePersonalRealtime({ userId, onUpdate, onNotification }: PersonalRealtimeProps) {
  const onUpdateRef = useRef(onUpdate);
  const onNotificationRef = useRef(onNotification);
  const lastProcessedId = useRef<string | null>(null);
  const activeChannels = useRef<any[]>([]);
  const currentIdsJson = useRef<string>("");

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onNotificationRef.current = onNotification;
  }, [onUpdate, onNotification]);

  useEffect(() => {
    const ids = Array.isArray(userId) ? userId : [userId];
    const cleanIds = Array.from(new Set(ids.filter(id => id && id !== 'guest'))) as string[];
    const newIdsJson = JSON.stringify(cleanIds.sort());
    
    // 🛡️ Solo reconectar si los IDs cambiaron de verdad
    if (newIdsJson === currentIdsJson.current && activeChannels.current.length > 0) {
      return;
    }

    // 🧹 Limpiar canales anteriores antes de abrir nuevos
    activeChannels.current.forEach(ch => supabase.removeChannel(ch));
    activeChannels.current = [];
    currentIdsJson.current = newIdsJson;

    if (cleanIds.length === 0) return;



    const channels = cleanIds.map(id => {
      const channelName = `user-private:${id}`;
      
      const channel = supabase
        .channel(channelName)
        .on(
          'broadcast',
          { event: 'personal-update' },
          (payload) => {
            const data = payload.payload;

            
            if (data.msg_id && data.msg_id === lastProcessedId.current) return;
            if (data.msg_id) lastProcessedId.current = data.msg_id;

            if (onUpdateRef.current) onUpdateRef.current(data);
          }
        )
        .on(
          'broadcast',
          { event: 'new-notification' },
          (payload) => {
            const data = payload.payload;

            if (onNotificationRef.current) onNotificationRef.current(data);
          }
        );

      channel.subscribe((status) => {

      });
      
      return channel;
    });

    activeChannels.current = channels;

    return () => {
      // No cerramos inmediatamente para evitar parpadeos en HMR, 
      // pero React lo llamará al desmontar de verdad.
    };
  }, [userId]); // El JSON.stringify interno maneja la estabilidad
}

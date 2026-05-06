'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";

interface AdminRealtimeProps {
  onRefresh: () => void;
  onNewNotification?: (notification: any) => void;
}

/**
 * 👨‍💼 Hook de Sincronización Administrativa
 * Propósito: Refrescar el dashboard y notificaciones de auditoría.
 * Canal: 'admin-updates'
 */
export function useAdminRealtime({ onRefresh, onNewNotification }: AdminRealtimeProps) {
  const onRefreshRef = useRef(onRefresh);
  const onNewNotificationRef = useRef(onNewNotification);

  useEffect(() => {
    onRefreshRef.current = onRefresh;
    onNewNotificationRef.current = onNewNotification;
  }, [onRefresh, onNewNotification]);

  useEffect(() => {
    console.log("🔌 Admin Realtime: Conectando a 'admin-updates'...");
    
    const channel = supabase
      .channel('admin-updates')
      .on(
        'broadcast',
        { event: 'admin-refresh' },
        (payload) => {
          console.log("🔄 Admin Realtime: Recibido admin-refresh", payload);
          onRefreshRef.current();
        }
      )
      .on(
        'broadcast',
        { event: 'new-notification' },
        (payload) => {
          console.log("🔔 Admin Realtime: Recibida nueva notificación", payload);
          const data = payload.payload || payload;
          if (data && onNewNotificationRef.current) {
            onNewNotificationRef.current(data);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          console.log("📅 Admin Realtime: Cambio detectado en tabla 'events'");
          onRefreshRef.current();
        }
      )
      .subscribe((status) => {
        console.log(`📡 Admin Realtime: Estado: ${status}`);
      });

    return () => {
      console.log("🔌 Admin Realtime: Desconectando...");
      supabase.removeChannel(channel);
    };
  }, []);
}

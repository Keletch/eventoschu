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
    const channel = supabase
      .channel('admin-updates')
      .on(
        'broadcast',
        { event: 'admin-refresh' },
        () => {
          onRefreshRef.current();
        }
      )
      .on(
        'broadcast',
        { event: 'new-notification' },
        (payload) => {
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
          onRefreshRef.current();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}

'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";

interface PersonalRealtimeProps {
  userId?: string; // UUID o ClerkID
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

  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onNotificationRef.current = onNotification;
  }, [onUpdate, onNotification]);

  useEffect(() => {
    if (!userId || userId === 'guest') return;

    const channel = supabase
      .channel(`user-private:${userId}`)
      .on(
        'broadcast',
        { event: 'personal-update' },
        (payload) => {
          if (onUpdateRef.current) onUpdateRef.current(payload.payload);
        }
      )
      .on(
        'broadcast',
        { event: 'new-notification' },
        (payload) => {
          if (onNotificationRef.current) onNotificationRef.current(payload.payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);
}

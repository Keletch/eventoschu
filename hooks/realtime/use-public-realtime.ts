'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";

/**
 * 🌍 Hook de Sincronización Pública
 * Propósito: Actualizar barras de progreso y disponibilidad global.
 * Canal: 'global-counts'
 */
export function usePublicRealtime(onUpdate: () => void) {
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    const channel = supabase
      .channel('global-counts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => onUpdateRef.current()
      )
      .on(
        'broadcast',
        { event: 'counts-updated' },
        () => onUpdateRef.current()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}

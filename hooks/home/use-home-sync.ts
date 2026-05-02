'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";

interface HomeSyncProps {
  isPageReady: boolean;
  onEventsUpdate: () => void;
  onCountsUpdate: () => void;
  onPersonalUpdate: (payload: any) => void;
}

export function useHomeSync({
  isPageReady,
  onEventsUpdate,
  onCountsUpdate,
  onPersonalUpdate
}: HomeSyncProps) {
  // Usamos refs para los callbacks, así evitamos re-renders y re-suscripciones
  // si las funciones cambian en el componente padre.
  const onEventsUpdateRef = useRef(onEventsUpdate);
  const onCountsUpdateRef = useRef(onCountsUpdate);
  const onPersonalUpdateRef = useRef(onPersonalUpdate);

  useEffect(() => {
    onEventsUpdateRef.current = onEventsUpdate;
    onCountsUpdateRef.current = onCountsUpdate;
    onPersonalUpdateRef.current = onPersonalUpdate;
  }, [onEventsUpdate, onCountsUpdate, onPersonalUpdate]);

  useEffect(() => {
    if (!isPageReady) return;

    let isMounted = true;


    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          if (isMounted && onEventsUpdateRef.current) onEventsUpdateRef.current();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        (payload) => {
          if (!isMounted) return;
          
          // 1. Siempre avisar que hay cambios en registros para actualizar contadores (aforos)
          if (onCountsUpdateRef.current) onCountsUpdateRef.current();

          // 2. Si es un UPDATE, enviamos el payload para evaluar si afecta al usuario actual
          if (payload.eventType === 'UPDATE' && onPersonalUpdateRef.current) {
            onPersonalUpdateRef.current(payload);
          }
        }
      )
      .subscribe();

    return () => {
      isMounted = false;

      supabase.removeChannel(channel);
    };
  }, [isPageReady]);
}

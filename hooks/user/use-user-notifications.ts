'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNotifications } from '@/app/admin/dashboard/hooks/use-notifications';
import { usePersonalRealtime } from '../realtime/use-personal-realtime';

export function useUserNotifications(propRegistrationId?: string | null) {
  const { userId: clerkId, isSignedIn, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  
  // 🎯 Estado para el ID definitivo y estable
  const [stableUserId, setStableUserId] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chu_registration');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          return parsed.userData?.id;
        } catch (e) {
          return undefined;
        }
      }
    }
    return propRegistrationId || undefined;
  });

  // 1. Sincronización de ID (Estrategia de Estabilidad)
  useEffect(() => {
    // Si Clerk aún no carga, no tomamos decisiones drásticas
    if (!isLoaded) return;

    if (propRegistrationId) {
      // Si el componente padre nos da un ID oficial, lo usamos de inmediato
      setStableUserId(propRegistrationId);
    } else if (isSignedIn && clerkId) {
      // Si estamos logueados pero no hay propRegistrationId, 
      // esperamos un momento antes de usar el clerkId para dar tiempo al sync de useHomeLogic
      const timer = setTimeout(() => {
        setStableUserId(prev => prev || clerkId);
      }, 500); 
      return () => clearTimeout(timer);
    } else if (!isSignedIn) {
      // Si no hay sesión, intentamos recuperar el ID local de modo público
      const saved = localStorage.getItem('chu_registration');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Usamos el ID de registro para mantener la sincronización aunque no haya sesión
          if (parsed.userData?.id) {
            setStableUserId(parsed.userData.id);
          }
        } catch (e) {}
      }
    }
  }, [propRegistrationId, isSignedIn, isLoaded, clerkId]);

  // 2. Efecto para escuchar el éxito de registro
  useEffect(() => {
    const handleSuccess = () => {
      const saved = localStorage.getItem('chu_registration');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.userData?.id) setStableUserId(parsed.userData.id);
        } catch (e) {}
      }
    };
    window.addEventListener('registration-success', handleSuccess);
    return () => window.removeEventListener('registration-success', handleSuccess);
  }, []);

  const ids = { 
    clerkId: clerkId || undefined, 
    registrationId: stableUserId 
  };

  useEffect(() => {
    if (ids.clerkId || ids.registrationId) {
      console.log(`[useUserNotifications] 🎯 IDs Estables detectados:`, ids);
    }
  }, [ids.clerkId, ids.registrationId]);

  const {
    notifications,
    unreadCount,
    isLoading,
    handleMarkAsRead,
    handleMarkAllRead,
    addNotificationLocally
  } = useNotifications(false, ids);

  // 3. Sincronización Realtime (Canal Privado Multicanal)
  // Obtenemos el email disponible para escuchar el canal de emergencia
  const email = typeof window !== 'undefined' ? (function() {
    try {
      const saved = localStorage.getItem('chu_registration');
      return saved ? JSON.parse(saved).userData?.email : null;
    } catch (e) { return null; }
  })() : null;

  usePersonalRealtime({
    userId: [stableUserId, clerkId, email].filter(Boolean) as string[],
    onUpdate: () => {}, 
    onNotification: (notif: any) => {
      console.log(`[useUserNotifications] 🔔 Notificación recibida vía RT:`, notif);
      addNotificationLocally(notif);
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading: isLoading || !isLoaded,
    handleMarkAsRead,
    handleMarkAllRead,
    isOpen,
    setIsOpen,
    isSignedIn,
    userId: stableUserId
  };
}

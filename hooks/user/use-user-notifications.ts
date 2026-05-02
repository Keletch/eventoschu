'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNotifications } from '@/app/admin/dashboard/hooks/use-notifications';
import { useRealtimeSync } from '@/app/admin/dashboard/hooks/use-realtime-sync';
import { getRegistrationId } from '@/app/actions/auth-actions';

export function useUserNotifications(propRegistrationId?: string | null) {
  const { userId: clerkId, isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [activeRegId, setActiveRegId] = useState<string | undefined>(propRegistrationId || undefined);

  // 1. Efecto para sincronizar con el prop y detectar ID inicial en localStorage
  useEffect(() => {
    if (propRegistrationId) {
      setActiveRegId(propRegistrationId);
    } else if (!isSignedIn) {
      const saved = localStorage.getItem('chu_registration');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.userData?.id) setActiveRegId(parsed.userData.id);
        } catch (e) {}
      }
    }
  }, [propRegistrationId, isSignedIn]);

  // 2. Efecto para escuchar el evento de éxito de registro (para anonimos instantáneos)
  useEffect(() => {
    const handleSuccess = () => {
      const saved = localStorage.getItem('chu_registration');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.userData?.id) setActiveRegId(parsed.userData.id);
        } catch (e) {}
      }
    };
    window.addEventListener('registration-success', handleSuccess);
    return () => window.removeEventListener('registration-success', handleSuccess);
  }, []);

  const ids = { 
    clerkId: clerkId || undefined, 
    registrationId: activeRegId 
  };

  const {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllRead,
    addNotificationLocally
  } = useNotifications(false, ids);

  // Sincronización Realtime (Dual)
  useRealtimeSync({
    isAdmin: false,
    ids,
    onNewNotification: (notif) => {
      addNotificationLocally(notif);
    }
  });

  return {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllRead,
    isOpen,
    setIsOpen,
    isSignedIn,
    userId: activeRegId || clerkId
  };
}


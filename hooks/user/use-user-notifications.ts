'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNotifications } from '@/app/admin/dashboard/hooks/use-notifications';
import { useRealtimeSync } from '@/app/admin/dashboard/hooks/use-realtime-sync';
import { getRegistrationId } from '@/app/actions/auth-actions';

export function useUserNotifications(registrationId?: string | null) {
  const { userId: clerkId, isSignedIn, isLoaded } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const ids = { 
    clerkId: clerkId || undefined, 
    registrationId: registrationId || undefined 
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
    isLoaded,
    userId: registrationId || clerkId
  };
}


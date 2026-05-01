'use client';

import { useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useNotifications } from '@/app/admin/dashboard/hooks/use-notifications';
import { useRealtimeSync } from '@/app/admin/dashboard/hooks/use-realtime-sync';

export function useUserNotifications() {
  const { userId, isSignedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllRead,
    addNotificationLocally
  } = useNotifications(false, userId || undefined);

  // Sync for users
  useRealtimeSync({
    isAdmin: false,
    userId: userId || undefined,
    onNewNotification: (notif) => {
      addNotificationLocally(notif);
    }
    // Users don't necessarily need a full data re-fetch on every registration change 
    // unless they are on the "Already Registered" portal.
  });

  return {
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllRead,
    isOpen,
    setIsOpen,
    isSignedIn,
    userId
  };
}

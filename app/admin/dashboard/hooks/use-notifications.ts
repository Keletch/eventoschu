'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead,
  deleteNotification
} from '@/app/actions/notifications';

export interface Notification {
  id: string;
  user_id?: string;
  is_admin: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

export function useNotifications(isAdmin = true, ids?: { clerkId?: string, registrationId?: string }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!ids?.clerkId && !ids?.registrationId && !isAdmin) return;
    setIsLoading(true);
    try {
      const res = await getNotifications(ids || {}, isAdmin);
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.read).length);
      }
    } finally {
      setIsLoading(false);
    }
  }, [ids?.clerkId, ids?.registrationId, isAdmin]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id, isAdmin);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return res;
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead(ids || {}, isAdmin);
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
    return res;
  };

  const handleDeleteNotification = async (id: string) => {
    const res = await deleteNotification(id, isAdmin);
    if (res.success) {
      setNotifications(prev => {
        const filtered = prev.filter(n => n.id !== id);
        const removed = prev.find(n => n.id === id);
        if (removed && !removed.read) {
          setUnreadCount(c => Math.max(0, c - 1));
        }
        return filtered;
      });
    }
    return res;
  };

  const addNotificationLocally = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  useEffect(() => {
    // Limpiar datos inmediatamente al cambiar de ID para evitar "stackeo" de notificaciones de usuarios distintos
    setNotifications([]);
    setUnreadCount(0);
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllRead,
    handleDeleteNotification,
    addNotificationLocally
  };
}

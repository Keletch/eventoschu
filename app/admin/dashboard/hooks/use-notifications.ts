'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
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

export function useNotifications(isAdmin = true, userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId && !isAdmin) return;
    setIsLoading(true);
    try {
      const res = await getNotifications(userId || 'admin', isAdmin);
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.read).length);
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isAdmin]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
    return res;
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead(userId || 'admin', isAdmin);
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
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
    fetchNotifications();
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    handleMarkAsRead,
    handleMarkAllRead,
    addNotificationLocally
  };
}

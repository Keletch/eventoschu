'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@clerk/nextjs';
import { Notification } from './use-notifications';

interface RealtimeSyncProps {
  isAdmin?: boolean;
  userId?: string;
  onNewNotification?: (notification: Notification) => void;
  onDataChange?: () => void;
}

export function useRealtimeSync({ 
  isAdmin = false, 
  userId, 
  onNewNotification, 
  onDataChange 
}: RealtimeSyncProps) {
  const { getToken } = useAuth();
  const channelRef = useRef<any>(null);
  
  // Use refs for callbacks to avoid re-triggering the effect
  const onNewNotificationRef = useRef(onNewNotification);
  const onDataChangeRef = useRef(onDataChange);
  const getTokenRef = useRef(getToken);

  useEffect(() => {
    onNewNotificationRef.current = onNewNotification;
    onDataChangeRef.current = onDataChange;
    getTokenRef.current = getToken;
  }, [onNewNotification, onDataChange, getToken]);

  useEffect(() => {
    let isMounted = true;
    let channel: any = null;

    const setupRealtime = async () => {
      // 1. Auth Setup for Supabase RLS
      if (!isAdmin && getTokenRef.current) {
        try {
          // Check current session first to avoid redundant setSession calls
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          
          // Only update if no session or different user
          // Note: Clerk tokens are short-lived, but we only need to set it once per mount/user change
          if (!currentSession || currentSession.user.id !== userId) {
            const token = await getTokenRef.current({ template: 'supabase' });
            if (token && isMounted) {
              await supabase.auth.setSession({ access_token: token, refresh_token: '' });
            }
          }
        } catch (err) {
          console.error("⚠️ Realtime: Error setting Clerk-Supabase session:", err);
        }
      }

      if (!isMounted) return;

      const subId = isAdmin ? 'admin' : (userId || 'guest');
      const channelName = `rt-sync-${subId}`;
      
      // If we already have a channel for this name, don't recreate it
      if (channelRef.current) return;

      console.log(`🔌 Attempting Realtime connection for: ${subId}...`);

      // 2. Subscribe to Notifications and Table Changes
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'notifications' },
          (payload) => {
            if (!isMounted) return;
            const newNotif = payload.new as Notification;
            const isForMe = isAdmin ? (newNotif.is_admin === true) : (newNotif.user_id === userId);
            if (isForMe && onNewNotificationRef.current) {
              onNewNotificationRef.current(newNotif);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'registrations' },
          () => {
            if (isMounted && onDataChangeRef.current) onDataChangeRef.current();
          }
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'events' },
          () => {
            if (isMounted && onDataChangeRef.current) onDataChangeRef.current();
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED' && isMounted) {
            console.log(`✅ Realtime Sync Connected for: ${subId}`);
          }
        });
        
      channelRef.current = channel;
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
        channelRef.current = null;
      }
    };
  }, [isAdmin, userId]);

  return null; // This is a logic-only hook
}

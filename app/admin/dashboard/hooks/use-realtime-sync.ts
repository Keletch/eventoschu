'use client';

import { useEffect, useRef } from 'react';
import { supabase } from "@/lib/supabase";
import { useAuth } from '@clerk/nextjs';
import { Notification } from './use-notifications';

interface RealtimeSyncProps {
  isAdmin?: boolean;
  ids?: { clerkId?: string, registrationId?: string };
  onNewNotification?: (notification: Notification) => void;
  onDataChange?: () => void;
}

export function useRealtimeSync({ 
  isAdmin = false, 
  ids, 
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
      const currentUserId = ids?.registrationId || ids?.clerkId || 'guest';
      
      if (!isAdmin && getTokenRef.current && ids?.clerkId) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (!currentSession || currentSession.user.id !== ids.clerkId) {
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

      const subId = isAdmin ? 'admin' : currentUserId;
      const channelName = isAdmin ? `rt-sync-${subId}` : `user-updates:${subId}`;
      
      if (channelRef.current) return;



      const tableName = isAdmin ? 'admin_notifications' : 'notifications';

      // 2. Subscribe to Notifications and Table Changes
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: tableName },
          (payload) => {
            if (!isMounted) return;
            const newNotif = payload.new as any;
            
            // Lógica de filtrado dual: coincide por clerk_id O por registration_id
            const isForMe = isAdmin || 
              (ids?.clerkId && newNotif.user_id === ids.clerkId) || 
              (ids?.registrationId && newNotif.registration_id === ids.registrationId);
            
            if (isForMe && onNewNotificationRef.current) {

              onNewNotificationRef.current(newNotif as Notification);
            }
          }
        )
        .on(
          'broadcast',
          { event: 'new-notification' },
          (payload) => {
            if (isMounted && onNewNotificationRef.current) {
              onNewNotificationRef.current(payload.payload as Notification);
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
  }, [isAdmin, ids?.clerkId, ids?.registrationId]);

  return null; // This is a logic-only hook
}

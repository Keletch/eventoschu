'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Bell, Check, Info, AlertTriangle, Circle } from 'lucide-react';
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead 
} from '@/app/actions/notifications';
import { supabase } from "@/lib/supabase";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Custom relative time helper (since date-fns is not installed)
function formatRelativeTime(dateString: string) {
  const now = new Date();
  const then = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace un momento';
  if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
  if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
  if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)} d`;
  
  return then.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

interface Notification {
  id: string;
  user_id?: string;
  is_admin: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  read: boolean;
  created_at: string;
}

export function NotificationBell({ userId, isAdmin = false }: { userId?: string, isAdmin?: boolean }) {
  const { getToken } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  const fetchNotifications = async () => {
    if (!userId && !isAdmin) return;
    const res = await getNotifications(userId || 'admin', isAdmin);
    if (res.success && res.data) {
      setNotifications(res.data);
      setUnreadCount(res.data.filter((n: any) => !n.read).length);
    }
  };

  useEffect(() => {
    let channel: any;
    let isMounted = true;

    const setupRealtime = async () => {
      // 1. Initial Fetch
      await fetchNotifications();
      if (!isMounted) return;

      // 2. Auth Setup for Non-Admins (Clerk Users)
      if (!isAdmin) {
        try {
          const token = await getToken({ template: 'supabase' });
          if (token && isMounted) {
            await supabase.auth.setSession({ access_token: token, refresh_token: '' });
          }
        } catch (err) {
          // Keep silent in production or use a logging service
        }
      }

      if (!isMounted) return;

      const subId = isAdmin ? 'admin' : (userId || 'guest');

      // 3. Subscribe with a unique channel name to avoid "after subscribe" errors
      const channelName = `notifs-${subId}-${Math.random().toString(36).substring(7)}`;
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications'
          },
          (payload: any) => {
            if (!isMounted) return;
            const newNotif = payload.new as Notification;
            const isForMe = isAdmin ? newNotif.is_admin : newNotif.user_id === userId;
            
            if (isForMe) {
              setNotifications(prev => [newNotif, ...prev]);
              setUnreadCount(prev => prev + 1);
            }
          }
        )
        .subscribe();
    };

    setupRealtime();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [userId, isAdmin, getToken]);

  const handleMarkAsRead = async (id: string) => {
    const res = await markAsRead(id);
    if (res.success) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllRead = async () => {
    const res = await markAllAsRead(userId || 'admin', isAdmin);
    if (res.success) {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-500 bg-emerald-50';
      case 'warning': return 'text-amber-500 bg-amber-50';
      default: return 'text-sky-500 bg-sky-50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return <Check className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* Removed asChild and styled the Trigger directly to avoid nested button issues and TS errors */}
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-xl size-10 hover:bg-slate-100 transition-all outline-none">
        <Bell className={cn("h-5 w-5 text-slate-600", unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 mr-4 shadow-xl border-slate-200 overflow-hidden" align="end">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h4 className="font-bold text-slate-800 flex items-center gap-2">
            Notificaciones
            {unreadCount > 0 && <span className="bg-sky-100 text-sky-700 text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount} nuevas</span>}
          </h4>
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead} 
              className="text-[10px] font-medium h-7 text-sky-600 hover:text-sky-700 hover:bg-sky-50 px-2 rounded-lg transition-colors"
            >
              Marcar todo como leído
            </button>
          )}
        </div>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar scroll-smooth">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 p-8 text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                <Bell className="h-8 w-8 opacity-20" />
              </div>
              <p className="text-sm">No tienes notificaciones por el momento.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={cn(
                    "p-4 transition-colors flex gap-3 relative group",
                    !notification.read ? "bg-sky-50/30 hover:bg-sky-50/50" : "hover:bg-slate-50"
                  )}
                >
                  <div className={cn("mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm", getTypeStyles(notification.type))}>
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1 pr-4">
                    <div className="flex items-center justify-between">
                      <p className={cn("text-sm font-bold text-slate-800 leading-tight", !notification.read && "text-sky-900")}>
                        {notification.title}
                      </p>
                      {!notification.read && <Circle className="h-2 w-2 fill-sky-500 text-sky-500" />}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">
                      {notification.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button 
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="absolute right-2 top-4 p-1 text-slate-300 hover:text-sky-500 opacity-0 group-hover:opacity-100 transition-all"
                      title="Marcar como leído"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

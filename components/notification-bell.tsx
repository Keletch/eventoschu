'use client';

import { Bell } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Notification } from '@/app/admin/dashboard/hooks/use-notifications';

// Modular Components
import { NotificationItem } from './notifications/notification-item';

interface NotificationBellProps {
  notifications: Notification[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function NotificationBell({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead,
  isOpen,
  setIsOpen
}: NotificationBellProps) {
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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
              onClick={onMarkAllAsRead} 
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
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

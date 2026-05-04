'use client';
import React from 'react';

import { Bell, Search, X } from 'lucide-react';
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
  onDeleteNotification?: (id: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export function NotificationBell({ 
  notifications, 
  unreadCount, 
  onMarkAsRead, 
  onMarkAllAsRead,
  onDeleteNotification,
  isOpen,
  setIsOpen
}: NotificationBellProps) {
  const [search, setSearch] = React.useState("");

  const filteredNotifications = React.useMemo(() => {
    if (!search.trim()) return notifications;
    const q = search.toLowerCase();
    
    return notifications.filter(n => {
      const titleMatch = n.title?.toLowerCase().includes(q);
      const messageMatch = n.message?.toLowerCase().includes(q);
      const dateMatch = new Date(n.created_at).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      }).toLowerCase().includes(q);
      
      return titleMatch || messageMatch || dateMatch;
    });
  }, [notifications, search]);

  return (
    <Popover open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setSearch(""); // Limpiar búsqueda al cerrar
    }}>
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-xl size-10 hover:bg-slate-100 transition-all outline-none">
        <Bell className={cn("h-5 w-5 text-slate-600", unreadCount > 0 && "animate-pulse")} />
        {unreadCount > 0 && (
          <span className="notif-badge absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 mr-4 shadow-xl border-slate-200 overflow-hidden z-[100]" align="end" sideOffset={8}>
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

        {/* Barra de Búsqueda */}
        <div className="p-2 bg-white border-b border-slate-100">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
            <input 
              type="text"
              placeholder="Filtrar por nombre, evento o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-slate-50 border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-sky-500/20 transition-all outline-none placeholder:text-slate-400"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar scroll-smooth">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-slate-400 p-8 text-center">
              <div className="bg-slate-50 p-4 rounded-full mb-3">
                {search ? <Search className="h-8 w-8 opacity-20" /> : <Bell className="h-8 w-8 opacity-20" />}
              </div>
              <p className="text-sm">
                {search ? "No se encontraron resultados para tu búsqueda." : "No tienes notificaciones por el momento."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {Array.from(new Map(filteredNotifications.map(n => [n.id, n])).values()).map((notification) => (
                <NotificationItem 
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                  onDelete={onDeleteNotification}
                />
              ))}
            </div>
          )}
        </div>

      </PopoverContent>
    </Popover>
  );
}

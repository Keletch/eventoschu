'use client';
import React from 'react';

import { Bell, Search, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Notification } from '@/app/admin/dashboard/hooks/use-notifications';

// Modular Components
import { NotificationItem } from '@/components/notifications/notification-item';

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
      <PopoverTrigger className="relative inline-flex items-center justify-center rounded-xl size-10 hover:bg-accent transition-all outline-none">
        <Bell className="size-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 size-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center ring-2 ring-background">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[320px] md:w-[380px] p-0 rounded-[24px] border-border bg-popover shadow-2xl overflow-hidden z-[70]" align="end" sideOffset={8}>
        <div className="p-4 bg-popover border-b border-border flex items-center justify-between">
          <h3 className="font-bold text-foreground">Notificaciones</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onMarkAllAsRead}
              className="text-xs text-primary hover:text-primary/80 h-8 px-2"
            >
              Marcar todas como leídas
            </Button>
          )}
        </div>

        {/* Barra de Búsqueda */}
        <div className="p-2 bg-popover border-b border-border">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground/40 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Filtrar por nombre, evento o fecha..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 pl-9 pr-4 bg-muted border-none rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary/20 transition-all outline-none placeholder:text-muted-foreground/40 text-foreground"
            />
            {search && (
              <button 
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto no-scrollbar scroll-smooth">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground/40 p-8 text-center">
              <div className="bg-muted p-4 rounded-full mb-3">
                {search ? <Search className="h-8 w-8 opacity-20" /> : <Bell className="h-8 w-8 opacity-20" />}
              </div>
              <p className="text-sm">
                {search ? "No se encontraron resultados para tu búsqueda." : "No tienes notificaciones por el momento."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
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

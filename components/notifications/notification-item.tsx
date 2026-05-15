"use client";

import { Check, Info, AlertTriangle, Circle, Trash2 } from 'lucide-react';
import { cn, formatRelativeTime } from "@/lib/utils";
import { Notification } from '@/app/(admin)/admin/dashboard/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'warning': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
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
    <div 
      className={cn(
        "p-4 transition-colors flex gap-3 relative group border-b border-border/50",
        !notification.read ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-accent/50"
      )}
    >
      <div className={cn("mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border", getTypeStyles(notification.type))}>
        {getTypeIcon(notification.type)}
      </div>
      <div className="flex-1 space-y-1 pr-4">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm font-bold text-foreground leading-tight", !notification.read && "text-primary")}>
            {notification.title}
          </p>
          {!notification.read && <Circle className="h-2 w-2 fill-primary text-primary" />}
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {notification.message}
        </p>
        <p className="text-[10px] text-muted-foreground/40 font-medium">
          {formatRelativeTime(notification.created_at || (notification as any).metadata?.dispatched_at || new Date().toISOString())}
        </p>
      </div>
      <div className="absolute right-3 bottom-3 flex items-center gap-1">
        {!notification.read && (
          <button 
            onClick={() => onMarkAsRead(notification.id)}
            className="p-1 text-emerald-500 hover:text-emerald-600 transition-all"
            title="Marcar como leído"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={() => onDelete(notification.id)}
            className="p-1 text-red-500 hover:text-red-600 transition-all"
            title="Eliminar notificación"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

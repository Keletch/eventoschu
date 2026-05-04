"use client";

import { Check, Info, AlertTriangle, Circle, Trash2 } from 'lucide-react';
import { cn, formatRelativeTime } from "@/lib/utils";
import { Notification } from '@/app/admin/dashboard/hooks/use-notifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function NotificationItem({ notification, onMarkAsRead, onDelete }: NotificationItemProps) {
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
    <div 
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
      <div className="absolute right-2 top-4 flex flex-col gap-1">
        {!notification.read && (
          <button 
            onClick={() => onMarkAsRead(notification.id)}
            className="p-1 text-slate-300 hover:text-sky-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Marcar como leído"
          >
            <Check className="h-4 w-4" />
          </button>
        )}
        {onDelete && (
          <button 
            onClick={() => onDelete(notification.id)}
            className="p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
            title="Eliminar notificación"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

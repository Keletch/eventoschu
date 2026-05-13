import React from "react";
import { Users, Ticket, RefreshCw, ClipboardCheck, Calendar, XCircle } from "lucide-react";
import { StatCard } from "./stat-card";

interface StatsGridProps {
  registrationsCount: number;
  cancelledCount: number;
  pendingCount: number;
  approvedCount: number;
  activeEventsCount: number;
  onEventsClick?: () => void;
  onUsersClick?: () => void;
  onApprovedClick?: () => void;
  onPendingClick?: () => void;
  onCancelledClick?: () => void;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  registrationsCount,
  cancelledCount,
  pendingCount,
  approvedCount,
  activeEventsCount,
  onEventsClick,
  onUsersClick,
  onApprovedClick,
  onPendingClick,
  onCancelledClick,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label="Eventos activos"
        value={activeEventsCount}
        icon={Calendar}
        colorClass="text-indigo-500"
        bgClass="bg-indigo-500/10"
        onClick={onEventsClick}
      />
      <StatCard
        label="Usuarios únicos"
        value={registrationsCount}
        icon={Users}
        colorClass="text-primary"
        bgClass="bg-primary/10"
        onClick={onUsersClick}
      />
      <StatCard
        label="Inscripciones aprobadas"
        value={approvedCount}
        icon={ClipboardCheck}
        colorClass="text-emerald-500"
        bgClass="bg-emerald-500/10"
        onClick={onApprovedClick}
      />
      <StatCard
        label="Inscripciones pendientes"
        value={pendingCount}
        icon={RefreshCw}
        colorClass="text-amber-500"
        bgClass="bg-amber-500/10"
        onClick={onPendingClick}
      />
      <StatCard
        label="Inscripciones canceladas"
        value={cancelledCount}
        icon={XCircle}
        colorClass="text-destructive"
        bgClass="bg-destructive/10"
        onClick={onCancelledClick}
      />
    </div>
  );
};

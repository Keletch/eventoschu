import React from "react";
import { Users, Ticket, RefreshCw, ClipboardCheck, Calendar } from "lucide-react";
import { StatCard } from "./stat-card";

interface StatsGridProps {
  registrationsCount: number;
  totalInscriptions: number;
  pendingCount: number;
  approvedCount: number;
  activeEventsCount: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  registrationsCount,
  totalInscriptions,
  pendingCount,
  approvedCount,
  activeEventsCount,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      <StatCard
        label="Usuarios"
        value={registrationsCount}
        icon={Users}
        colorClass="text-blue-600"
        bgClass="bg-blue-50"
      />
      <StatCard
        label="Inscripciones"
        value={totalInscriptions}
        icon={Ticket}
        colorClass="text-neutral-600"
        bgClass="bg-neutral-50"
      />
      <StatCard
        label="Pendientes"
        value={pendingCount}
        icon={RefreshCw}
        colorClass="text-amber-600"
        bgClass="bg-amber-50"
      />
      <StatCard
        label="Aprobadas"
        value={approvedCount}
        icon={ClipboardCheck}
        colorClass="text-emerald-600"
        bgClass="bg-emerald-50"
      />
      <StatCard
        label="Activos"
        value={activeEventsCount}
        icon={Calendar}
        colorClass="text-indigo-600"
        bgClass="bg-indigo-50"
      />
    </div>
  );
};

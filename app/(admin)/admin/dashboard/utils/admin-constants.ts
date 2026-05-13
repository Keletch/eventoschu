import { CheckCircle2, Clock, XCircle, RefreshCw } from "lucide-react";
import React from "react";

export type AdminRegistrationStatus = "confirmed" | "cancelled" | "pending";

export interface AdminStatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  icon: React.ReactNode;
  color: string;
}

export const ADMIN_STATUS_CONFIGS: Record<AdminRegistrationStatus, AdminStatusConfig> = {
  confirmed: {
    label: "Aprobada",
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    border: "border-emerald-500/20",
    color: "#10b981", // emerald-500
    icon: React.createElement(CheckCircle2, { className: "size-4" }),
  },
  cancelled: {
    label: "Cancelada",
    bg: "bg-destructive/10",
    text: "text-destructive",
    border: "border-destructive/20",
    color: "#ef4444", // red-500
    icon: React.createElement(XCircle, { className: "size-4" }),
  },
  pending: {
    label: "Pendiente",
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    border: "border-amber-500/20",
    color: "#f59e0b", // amber-500
    icon: React.createElement(RefreshCw, { className: "size-4 animate-spin-slow" }),
  },
};

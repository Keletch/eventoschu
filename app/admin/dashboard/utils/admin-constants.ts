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
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    color: "#10b981", // emerald-500
    icon: React.createElement(CheckCircle2, { className: "size-4" }),
  },
  cancelled: {
    label: "Cancelada",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
    color: "#f43f5e", // rose-500
    icon: React.createElement(XCircle, { className: "size-4" }),
  },
  pending: {
    label: "Pendiente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    color: "#f59e0b", // amber-500
    icon: React.createElement(RefreshCw, { className: "size-4 animate-spin-slow" }),
  },
};

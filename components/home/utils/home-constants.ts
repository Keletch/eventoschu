import { Check, Loader2, XCircle } from "lucide-react";
import React from "react";

export type RegistrationStatus = "confirmed" | "cancelled" | "pending";

export interface StatusConfig {
  label: string;
  bg: string;
  text: string;
  border: string;
  dot: string;
  icon: React.ReactNode;
  description?: string;
}

export const STATUS_CONFIGS: Record<RegistrationStatus, StatusConfig> = {
  confirmed: {
    label: "Cupo confirmado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-100",
    dot: "bg-emerald-500",
    icon: React.createElement(Check, { className: "size-5", strokeWidth: 3 }),
    description: "Se te enviará un correo con los datos del evento",
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
    dot: "bg-rose-500",
    icon: React.createElement(XCircle, { className: "size-5" }),
    description: "Tu registro para este evento ha sido cancelado",
  },
  pending: {
    label: "Validando cupo",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
    icon: React.createElement(Loader2, { className: "size-5 animate-spin" }),
    description: "Estamos revisando tu solicitud, te avisaremos pronto",
  },
};

/**
 * 🛠️ Deriva los datos finales a mostrar para un usuario en una ciudad específica.
 * Sigue la regla de oro: Prioriza datos del evento -> Cae a datos globales.
 */
export function getDisplayData(userData: any, eventDataMap: Record<string, any>, selectedCityId: string) {
  const currentEventData = eventDataMap?.[selectedCityId] || {};
  
  return {
    firstName: currentEventData.first_name || userData?.firstName || "",
    lastName:  currentEventData.last_name  || userData?.lastName  || "",
    email:     currentEventData.email       || userData?.email      || "",
    phone:     currentEventData.phone       || userData?.phone      || "",
    phoneCode: currentEventData.phone_code  || userData?.phoneCode  || "",
    country:   currentEventData.residence_country || userData?.country || "",
  };
}

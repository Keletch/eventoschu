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
  descriptionColor?: string;
}

export const STATUS_CONFIGS: Record<RegistrationStatus, StatusConfig> = {
  confirmed: {
    label: "Activo",
    bg: "bg-[#EAFFEE]",
    text: "text-[#0F9700]",
    border: "border-[#0F9700]/10",
    dot: "bg-[#0F9700]",
    icon: React.createElement(Check, { className: "size-4", strokeWidth: 3 }),
    description: "Se te enviará un correo con los datos del evento",
    descriptionColor: "text-[#42A53C]",
  },
  cancelled: {
    label: "Cancelado",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-100",
    dot: "bg-rose-500",
    icon: React.createElement(XCircle, { className: "size-4" }),
    description: "Tu registro para este evento ha sido cancelado",
    descriptionColor: "text-rose-600/80",
  },
  pending: {
    label: "Pendiente",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-100",
    dot: "bg-amber-500",
    icon: React.createElement(Loader2, { className: "size-4 animate-spin" }),
    description: "Estamos revisando tu solicitud, te avisaremos pronto",
    descriptionColor: "text-amber-600/80",
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

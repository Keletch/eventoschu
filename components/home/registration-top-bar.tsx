"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_CONFIGS, RegistrationStatus } from "@/components/home/utils/home-constants";
import { EventUIConfig } from "@/lib/event-config";

interface RegistrationTopBarProps {
  status: string;
  startNewRegistration: () => void;
  eventConfig: EventUIConfig;
}

export function RegistrationTopBar({ status, startNewRegistration, eventConfig }: RegistrationTopBarProps) {
  const config = STATUS_CONFIGS[(status as RegistrationStatus) ?? "pending"] ?? STATUS_CONFIGS.pending;
  
  // 🧠 Obtener etiqueta desde la configuración centralizada
  const displayLabel = eventConfig.statusLabels[status as RegistrationStatus] || config.label;

  return (
    <div className="max-w-[1372px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4">
      {/* Badge de estado de la ciudad seleccionada */}
      <div className="city-status-badge">
        <div className={cn("inline-flex items-center gap-2.5 px-4 py-1.5 rounded-xl border transition-all duration-500", config.bg, config.border)}>
          <div className={cn("size-2 rounded-full", config.dot)} />
          <span className={cn("font-bold text-[15px]", config.text)}>{displayLabel}</span>
        </div>
      </div>

      {/* Botón salir / nuevo registro */}
      <Button
        onClick={startNewRegistration}
        variant="outline"
        className="group flex items-center gap-2 border-border text-muted-foreground hover:text-primary hover:border-primary rounded-xl px-6 h-11 font-bold transition-all bg-card shadow-sm transform backface-visibility-hidden antialiased"
      >
        <LogOut className="size-4 transition-transform group-hover:translate-x-1" />
        Nuevo registro / Salir
      </Button>
    </div>
  );
}

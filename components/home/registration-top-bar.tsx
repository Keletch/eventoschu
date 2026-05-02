"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { STATUS_CONFIGS, RegistrationStatus } from "@/components/home/utils/home-constants";

interface RegistrationTopBarProps {
  status: string;
  startNewRegistration: () => void;
}

export function RegistrationTopBar({ status, startNewRegistration }: RegistrationTopBarProps) {
  const config = STATUS_CONFIGS[(status as RegistrationStatus) ?? "pending"] ?? STATUS_CONFIGS.pending;

  return (
    <div className="max-w-[1372px] mx-auto flex flex-col md:flex-row justify-between items-center gap-6 px-4">
      {/* Badge de estado de la ciudad seleccionada */}
      <div className="city-status-badge">
        <div className={cn("inline-flex items-center gap-3 px-6 py-2 rounded-full border transition-all duration-500", config.bg, config.border)}>
          <div className={cn("size-2 rounded-full", config.dot)} />
          <span className={cn("font-semibold text-base", config.text)}>{config.label}</span>
        </div>
      </div>

      {/* Botón salir / nuevo registro */}
      <Button
        onClick={startNewRegistration}
        variant="outline"
        className="group flex items-center gap-2 border-neutral-200 text-gray-500 hover:text-[#3154DC] hover:border-[#3154DC] rounded-xl px-6 h-11 font-bold transition-all bg-white/50 backdrop-blur-sm shadow-sm"
      >
        <LogOut className="size-4 transition-transform group-hover:translate-x-1" />
        Nuevo registro / Salir
      </Button>
    </div>
  );
}

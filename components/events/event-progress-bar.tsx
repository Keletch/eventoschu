"use client";

import { Users, Infinity } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventProgressBarProps {
  confirmedCount: number;
  capacity: number;
  isSoldOut: boolean;
  isOpenMode?: boolean;
}

export function EventProgressBar({
  confirmedCount,
  capacity,
  isSoldOut,
  isOpenMode = true,
}: EventProgressBarProps) {
  const isUnlimited = capacity >= 9999;
  const progress = isUnlimited ? 0 : Math.min((confirmedCount / capacity) * 100, 100);

  return (
    <div className="pt-4 border-t border-neutral-100 space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 text-neutral-500 uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>{isOpenMode ? "Disponibilidad del cupo" : "Inscritos"}</span>
        </div>
        {!isOpenMode && !isUnlimited && (
          <span className={cn(
            isSoldOut ? "text-red-600" : "text-blue-700"
          )}>
            {confirmedCount} / {capacity}
          </span>
        )}
        {isUnlimited && (
          <span className="flex items-center gap-1 text-blue-500">
            <Infinity className="w-3.5 h-3.5" />
            Cupo ilimitado
          </span>
        )}
      </div>
      {/* Barra solo si NO es ilimitado */}
      {!isUnlimited && (
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-1000",
              isSoldOut ? "bg-red-600" : "bg-blue-600"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

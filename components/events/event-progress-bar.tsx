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
  const isFull = !isOpenMode && confirmedCount >= capacity;
  const progress = isUnlimited ? 0 : Math.min((confirmedCount / capacity) * 100, 100);

  return (
    <div className="pt-4 border-t border-card-border space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 text-card-text/60 uppercase tracking-wider">
          <Users className="w-3.5 h-3.5" />
          <span>{isOpenMode ? "Disponibilidad del cupo" : "Inscritos"}</span>
        </div>
        {!isOpenMode && !isUnlimited && (
          <span className={cn(
            isSoldOut ? "text-red-600" : "text-primary"
          )}>
            {confirmedCount} / {capacity}
          </span>
        )}
        {isUnlimited && (
          <span className="flex items-center gap-1 text-primary">
            <Infinity className="w-3.5 h-3.5" />
            Cupo ilimitado
          </span>
        )}
      </div>
      {/* Barra solo si NO es ilimitado */}
      {!isUnlimited && (
        <div className="h-2 bg-card-border/50 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out",
              isSoldOut ? "bg-card-text/30" : isFull ? "bg-amber-500" : "bg-primary"
            )}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

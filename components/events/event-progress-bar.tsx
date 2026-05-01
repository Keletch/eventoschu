"use client";

import { Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventProgressBarProps {
  confirmedCount: number;
  capacity: number;
  isSoldOut: boolean;
}

export function EventProgressBar({
  confirmedCount,
  capacity,
  isSoldOut,
}: EventProgressBarProps) {
  const progress = Math.min((confirmedCount / capacity) * 100, 100);

  return (
    <div className="pt-4 border-t border-neutral-100 space-y-2">
      <div className="flex items-center justify-between text-xs font-bold">
        <div className="flex items-center gap-1.5 text-neutral-500">
          <Users className="w-3.5 h-3.5" />
          <span>Inscritos</span>
        </div>
        <span className={cn(
          isSoldOut ? "text-red-600" : "text-blue-700"
        )}>
          {confirmedCount} / {capacity}
        </span>
      </div>
      <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className={cn(
            "h-full transition-all duration-1000",
            isSoldOut ? "bg-red-600" : "bg-blue-600"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

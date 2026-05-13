"use client";

import React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

interface EventFlagProps {
  flag: string;
  className?: string;
  bgClass?: string;
}

export function EventFlag({ flag, className, bgClass }: EventFlagProps) {
  const FlagIcon = flag && (Flags as any)[flag.toUpperCase()] 
    ? (Flags as any)[flag.toUpperCase()] 
    : null;

  const isHex = bgClass?.startsWith("#");

  return (
    <div 
      className={cn(
        "rounded-lg flex items-center justify-center overflow-hidden shadow-sm transition-transform",
        !isHex && (bgClass || "bg-primary/10"),
        className
      )}
      style={isHex ? { backgroundColor: bgClass } : undefined}
    >
      {flag === "WEB" ? (
        <span className="text-[28px] drop-shadow-sm">🌐</span>
      ) : FlagIcon ? (
        <FlagIcon className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl">📍</span>
      )}
    </div>
  );
}

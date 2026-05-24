"use client";

import React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

import { AVAILABLE_ICONS } from "@/lib/icons";

interface EventFlagProps {
  flag: string;
  imageUrl?: string | null;
  className?: string;
  bgClass?: string;
}

export function EventFlag({ flag, imageUrl, className, bgClass }: EventFlagProps) {
  const FlagIcon = flag && (Flags as any)[flag.toUpperCase()] 
    ? (Flags as any)[flag.toUpperCase()] 
    : null;

  let LucideIconComponent = null;
  if (flag?.startsWith("icon:")) {
    const iconName = flag.replace("icon:", "");
    LucideIconComponent = AVAILABLE_ICONS.find(i => i.name === iconName)?.icon;
  }

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
      {imageUrl ? (
        <img src={imageUrl} alt="Icono del evento" className="w-full h-full object-cover" />
      ) : LucideIconComponent ? (
        <LucideIconComponent className="w-1/2 h-1/2 text-foreground/70" strokeWidth={1.5} />
      ) : flag === "WEB" ? (
        <span className="text-[28px] drop-shadow-sm">🌐</span>
      ) : FlagIcon ? (
        <FlagIcon className="w-full h-full object-cover" />
      ) : (
        <span className="text-xl">📍</span>
      )}
    </div>
  );
}

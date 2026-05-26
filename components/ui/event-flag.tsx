"use client";

import React from "react";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";
import { Globe, MapPin } from "lucide-react";

import { AVAILABLE_ICONS } from "@/lib/icons";

interface EventFlagProps {
  flag: string;
  imageUrl?: string | null;
  className?: string;
  bgClass?: string;
  largeIcon?: boolean;
}

export function EventFlag({ flag, imageUrl, className, bgClass, largeIcon = false }: EventFlagProps) {
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
        <LucideIconComponent className={largeIcon ? "w-[72%] h-[72%] text-primary/80 dark:text-primary" : "w-[58%] h-[58%] text-primary/80 dark:text-primary"} strokeWidth={2.2} fill="currentColor" fillOpacity={0.12} />
      ) : flag === "WEB" ? (
        <Globe className={largeIcon ? "w-[70%] h-[70%] text-primary/80 dark:text-primary" : "w-[55%] h-[55%] text-primary/80 dark:text-primary"} strokeWidth={2.2} fill="currentColor" fillOpacity={0.12} />
      ) : FlagIcon ? (
        <FlagIcon className="w-full h-full object-cover" />
      ) : (
        <MapPin className={largeIcon ? "w-[70%] h-[70%] text-primary/80 dark:text-primary" : "w-[55%] h-[55%] text-primary/80 dark:text-primary"} strokeWidth={2.2} fill="currentColor" fillOpacity={0.12} />
      )}
    </div>
  );
}

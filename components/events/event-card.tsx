"use client";

import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Check, Calendar, Clock, MapPin, CircleDollarSign, Hourglass, ExternalLink, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

// Modular Components
import { EventProgressBar } from "@/components/events/event-progress-bar";
import { EventSoldOutOverlay } from "@/components/events/event-sold-out-overlay";
import { EventFlag } from "@/components/ui/event-flag";

import { getEventUIConfig } from "@/lib/event-config";

interface EventCardProps {
  id: string;
  title: string;
  city: string;
  country: string;
  flag: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  price: string;
  selected: boolean;
  onSelect: (id: string) => void;
  bgClass?: string;
  confirmedCount?: number;
  capacity?: number;
  initialStatus?: string;
  // Propiedades para eventos en línea
  isVirtual?: boolean;
  linkTitle?: string | null;
  linkUrl?: string | null;
  linkEnabled?: boolean;
}

export function EventCard({
  id,
  title,
  city,
  country,
  flag,
  date,
  time,
  duration,
  location,
  price,
  selected,
  onSelect,
  bgClass = "bg-primary/10",
  confirmedCount = 0,
  capacity = 25,
  initialStatus = 'confirmed',
  isVirtual = false,
  linkTitle,
  linkUrl,
  linkEnabled = false,
}: EventCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const titleRef = useRef<HTMLHeadingElement>(null);

  const eventConfig = getEventUIConfig({ initial_status: initialStatus });
  const isUnlimited = capacity >= 9999;
  // Los eventos en línea nunca se marcan como llenos
  const isFull = !isVirtual && !isUnlimited && confirmedCount >= capacity;
  const isSoldOut = eventConfig.showFullCapacityOverlay && isFull;

  // Detectar si el título se trunca
  useEffect(() => {
    const checkTruncation = () => {
      if (titleRef.current) {
        const isTruncated = titleRef.current.scrollWidth > titleRef.current.clientWidth;
        setCanExpand(isTruncated);
      }
    };

    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [title]);

  return (
    <Card 
      className={cn(
        "relative h-full p-5 md:p-6 transition-all duration-300 border-2 rounded-[32px] overflow-hidden",
        "transform backface-visibility-hidden antialiased", // 🛠️ Solución global contra artifacts
        isSoldOut 
          ? "border-border bg-muted grayscale cursor-not-allowed" 
          : cn(
              "cursor-pointer bg-card transition-all duration-300",
              selected 
                ? "border-primary ring-4 ring-primary/5 shadow-md shadow-primary/20 -translate-y-0.5 hover:shadow-lg hover:shadow-primary/30" 
                : "border-card shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            )
      )}
      onClick={() => !isSoldOut && onSelect(id)}
    >
      {isSoldOut && <EventSoldOutOverlay />}

      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
          <div className="flex items-start gap-3 md:gap-4 overflow-hidden w-full">
            <EventFlag 
              flag={flag} 
              bgClass={bgClass} 
              className="size-12 md:size-14 rounded-[16px] md:rounded-[20px] p-2.5 md:p-3 shrink-0" 
            />
            <div className="flex flex-col gap-0.5 overflow-hidden w-full">
              <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-primary">
                Evento Disponible
              </span>
              <div className="relative group/title mt-1">
                <div className={cn(
                  "overflow-hidden transition-[max-height] duration-300 ease-in-out relative",
                  isExpanded ? "max-h-[120px]" : "max-h-[22px] md:max-h-[28px]"
                )}>
                  <h3 
                    ref={titleRef}
                    className={cn(
                      "text-xl md:text-2xl font-bold text-foreground leading-[1.1] text-left w-full",
                      (!isExpanded && !isTransitioning) && "truncate"
                    )}
                  >
                    {title}
                  </h3>
                </div>
              </div>
              
              <p className="text-sm md:text-base font-medium text-muted-foreground flex items-center gap-1.5 truncate text-left w-full mt-1">
                <span>{city}</span>
                <span className="w-1 h-1 rounded-full bg-border mx-1" />
                <span>{country}</span>
                
                {canExpand && (
                  <span 
                    className={cn(
                      "ml-2 transition-all duration-300 inline-flex items-center",
                      "opacity-100",
                      isTransitioning && "opacity-50 pointer-events-none"
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isTransitioning) return;
                      setIsTransitioning(true);
                      setIsExpanded(!isExpanded);
                      setTimeout(() => setIsTransitioning(false), 300);
                    }}
                  >
                    <div className="size-4 md:size-5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm transition-all hover:bg-primary/20 flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 shadow-sm">
                      {isExpanded ? (
                        <Minus className="size-2 md:size-2.5 text-primary" strokeWidth={3} />
                      ) : (
                        <Plus className="size-2 md:size-2.5 text-primary" strokeWidth={3} />
                      )}
                    </div>
                  </span>
                )}
              </p>
            </div>
          </div>
        
          {!isSoldOut && (
            <div className={cn(
              "w-6 h-6 md:w-7 md:h-7 rounded-[20px] border-2 flex items-center justify-center transition-all shrink-0",
              selected ? "bg-primary border-primary" : "border-primary"
            )}>
              {selected && <Check className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" strokeWidth={3} />}
            </div>
          )}
        </div>

        <div className="space-y-4 text-sm md:text-[16px] leading-relaxed text-muted-foreground">
          <div className="space-y-3">
            <EventDetailItem icon={<Calendar className="w-4 h-4 text-muted-foreground/60 shrink-0" />} label="Fecha" value={date} />
            <EventDetailItem icon={<Clock className="w-4 h-4 text-muted-foreground/60 shrink-0" />} label="Hora" value={time} />
            <EventDetailItem icon={<Hourglass className="w-4 h-4 text-muted-foreground/60 shrink-0" />} label="Duración" value={duration} />
            {isVirtual ? (
              <div className="flex gap-3 items-center">
                <ExternalLink className="w-4 h-4 text-muted-foreground/60 shrink-0" />
                <span className="font-bold shrink-0">Enlace:</span>
                {linkEnabled && linkUrl ? (
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-primary hover:text-primary/80 underline underline-offset-2 truncate font-medium transition-colors"
                  >
                    {linkTitle || "Acceder al evento"}
                  </a>
                ) : (
                  <span className="text-muted-foreground/60 italic truncate">
                    {linkTitle || "Enlace por confirmar"}
                  </span>
                )}
              </div>
            ) : (
              <EventDetailItem icon={<MapPin className="w-4 h-4 text-muted-foreground/60 shrink-0 mt-1" />} label="Sitio" value={location} isMultiLine />
            )}
            <EventDetailItem icon={<CircleDollarSign className="w-4 h-4 text-muted-foreground/60 shrink-0" />} label="Precio" value={price} />
          </div>
        </div>

        <div className="mt-auto pt-6">
          <EventProgressBar 
            confirmedCount={confirmedCount}
            capacity={capacity}
            isSoldOut={isSoldOut}
            isOpenMode={eventConfig.type === 'OPEN'}
          />
        </div>
      </div>
    </Card>
  );
}

function EventDetailItem({ icon, label, value, isMultiLine }: { icon: React.ReactNode, label: string, value: string, isMultiLine?: boolean }) {
  return (
    <p className={cn("flex gap-3", isMultiLine ? "items-start" : "items-center")}>
      {icon}
      <span className="font-bold shrink-0">{label}:</span> 
      <span className={cn(isMultiLine ? "leading-tight" : "truncate")}>{value}</span>
    </p>
  );
}

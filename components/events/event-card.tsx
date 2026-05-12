"use client";

import { Card } from "@/components/ui/card";
import { Check, Calendar, Clock, MapPin, CircleDollarSign, Hourglass, ExternalLink } from "lucide-react";
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
  bgClass = "bg-sky-100",
  confirmedCount = 0,
  capacity = 25,
  initialStatus = 'confirmed',
  isVirtual = false,
  linkTitle,
  linkUrl,
  linkEnabled = false,
}: EventCardProps) {
  const eventConfig = getEventUIConfig({ initial_status: initialStatus });
  const isUnlimited = capacity >= 9999;
  // Los eventos en línea nunca se marcan como llenos
  const isFull = !isVirtual && !isUnlimited && confirmedCount >= capacity;
  const isSoldOut = eventConfig.showFullCapacityOverlay && isFull;

  return (
    <Card 
      className={cn(
        "relative p-5 md:p-6 transition-all duration-500 border-2 rounded-[32px] overflow-hidden",
        "transform backface-visibility-hidden antialiased", // 🛠️ Solución global contra artifacts
        isSoldOut 
          ? "border-neutral-200 bg-neutral-50 grayscale cursor-not-allowed" 
          : "cursor-pointer bg-[#FFFFFF] hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1",
        selected && !isSoldOut 
          ? "border-blue-700 ring-4 ring-blue-700/5 shadow-[0_20px_50px_rgba(49,84,220,0.15)] -translate-y-1 z-10" 
          : "border-white shadow-sm"
      )}
      onClick={() => !isSoldOut && onSelect(id)}
    >
      {isSoldOut && <EventSoldOutOverlay />}

      <div className="flex items-start justify-between mb-6 md:mb-8 gap-4">
        <div className="flex items-start gap-3 md:gap-4 overflow-hidden">
          <EventFlag 
            flag={flag} 
            bgClass={bgClass} 
            className="size-12 md:size-14 rounded-[16px] md:rounded-[20px] p-2.5 md:p-3 shrink-0" 
          />
          <div className="flex flex-col gap-0.5 overflow-hidden">
            <span className="text-[10px] md:text-[11px] font-black uppercase tracking-widest text-blue-600">
              Evento Disponible
            </span>
            <h3 className="text-xl md:text-2xl font-bold text-gray-950 leading-tight truncate">
              {title}
            </h3>
            <p className="text-sm md:text-base font-medium text-neutral-500 flex items-center gap-1.5 truncate">
              <span>{city}</span>
              <span className="w-1 h-1 rounded-full bg-neutral-300 mx-1" />
              <span>{country}</span>
            </p>
          </div>
        </div>
        
        {!isSoldOut && (
          <div className={cn(
            "w-6 h-6 md:w-7 md:h-7 rounded-[20px] border-2 flex items-center justify-center transition-all shrink-0",
            selected ? "bg-blue-700 border-blue-700" : "border-blue-700"
          )}>
            {selected && <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />}
          </div>
        )}
      </div>

      <div className="space-y-4 text-sm md:text-[16px] leading-relaxed text-neutral-700">
        <div className="space-y-3">
          <EventDetailItem icon={<Calendar className="w-4 h-4 text-neutral-400 shrink-0" />} label="Fecha" value={date} />
          <EventDetailItem icon={<Clock className="w-4 h-4 text-neutral-400 shrink-0" />} label="Hora" value={time} />
          <EventDetailItem icon={<Hourglass className="w-4 h-4 text-neutral-400 shrink-0" />} label="Duración" value={duration} />
          {/* Condicional: Sitio para presencial, enlace para online */}
          {isVirtual ? (
            <div className="flex gap-3 items-center">
              <ExternalLink className="w-4 h-4 text-neutral-400 shrink-0" />
              <span className="font-bold shrink-0">Enlace:</span>
              {linkEnabled && linkUrl ? (
                <a
                  href={linkUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-blue-600 hover:text-blue-800 underline underline-offset-2 truncate font-medium transition-colors"
                >
                  {linkTitle || "Acceder al evento"}
                </a>
              ) : (
                <span className="text-neutral-400 italic truncate">
                  {linkTitle || "Enlace por confirmar"}
                </span>
              )}
            </div>
          ) : (
            <EventDetailItem icon={<MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />} label="Sitio" value={location} isMultiLine />
          )}
          <EventDetailItem icon={<CircleDollarSign className="w-4 h-4 text-neutral-400 shrink-0" />} label="Precio" value={price} />
        </div>

        <EventProgressBar 
          confirmedCount={confirmedCount}
          capacity={capacity}
          isSoldOut={isSoldOut}
          isOpenMode={eventConfig.type === 'OPEN'}
        />
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

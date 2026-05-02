"use client";

import { Card } from "@/components/ui/card";
import { Check, Calendar, Clock, MapPin, CircleDollarSign, Hourglass } from "lucide-react";
import { cn } from "@/lib/utils";

// Modular Components
import { EventProgressBar } from "./events/event-progress-bar";
import { EventSoldOutOverlay } from "./events/event-sold-out-overlay";
import { EventFlag } from "./ui/event-flag";

interface EventCardProps {
  id: string;
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
}

export function EventCard({
  id,
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
}: EventCardProps) {
  const isSoldOut = confirmedCount >= capacity;

  return (
    <Card 
      className={cn(
        "relative p-6 md:p-8 transition-all duration-500 border-2 rounded-[32px] overflow-hidden",
        isSoldOut 
          ? "border-neutral-200 bg-neutral-50 grayscale cursor-not-allowed" 
          : "cursor-pointer bg-white hover:shadow-xl hover:-translate-y-1",
        selected && !isSoldOut 
          ? "border-blue-700 ring-4 ring-blue-700/5 shadow-2xl shadow-blue-700/10 -translate-y-1 z-10" 
          : "border-neutral-100"
      )}
      onClick={() => !isSoldOut && onSelect(id)}
    >
      {isSoldOut && <EventSoldOutOverlay />}

      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <EventFlag 
            flag={flag} 
            bgClass={bgClass} 
            className="size-12 md:size-14 rounded-[16px] md:rounded-[20px] p-2.5 md:p-3" 
          />
          <h3 className="text-xl md:text-2xl font-bold text-gray-950 truncate">{city}, {country}</h3>
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
          <EventDetailItem icon={<MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />} label="Sitio" value={location} isMultiLine />
          <EventDetailItem icon={<CircleDollarSign className="w-4 h-4 text-neutral-400 shrink-0" />} label="Precio" value={price} />
        </div>

        <EventProgressBar 
          confirmedCount={confirmedCount}
          capacity={capacity}
          isSoldOut={isSoldOut}
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

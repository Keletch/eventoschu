import { Card } from "@/components/ui/card";
import { Check, Calendar, Clock, MapPin, CircleDollarSign, Hourglass, Users } from "lucide-react";
import { cn } from "@/lib/utils";

import * as Flags from 'country-flag-icons/react/3x2';

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
  const FlagComponent = flag && (Flags as any)[flag.toUpperCase()] ? (Flags as any)[flag.toUpperCase()] : null;

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
      {/* Sold Out Overlay Label */}
      {isSoldOut && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/40 backdrop-blur-[2px]">
          <div className="bg-red-600 text-white font-black text-2xl md:text-3xl px-8 py-3 rounded-2xl rotate-[-12deg] shadow-2xl border-4 border-white animate-in zoom-in-50 duration-500">
            CUPO LLENO
          </div>
        </div>
      )}

      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <div className={cn(
            "size-12 md:size-14 rounded-[16px] md:rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden p-2.5 md:p-3",
            bgClass
          )}>
            {FlagComponent ? (
              <FlagComponent className="w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <span className="text-xl">📍</span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-950 truncate">{city}, {country}</h3>
        </div>
        
        {/* Selection Marker */}
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
          <p className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-bold shrink-0">Fecha:</span> 
            <span className="truncate">{date}</span>
          </p>
          <p className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-bold shrink-0">Hora:</span> 
            <span className="truncate">{time}</span>
          </p>
          <p className="flex items-center gap-3">
            <Hourglass className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-bold shrink-0">Duración:</span> 
            <span className="truncate">{duration}</span>
          </p>
          <p className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-1" />
            <span className="font-bold shrink-0">Sitio:</span> 
            <span className="leading-tight">{location}</span>
          </p>
          <p className="flex items-center gap-3">
            <CircleDollarSign className="w-4 h-4 text-neutral-400 shrink-0" />
            <span className="font-bold shrink-0">Precio:</span> 
            <span className="truncate">{price}</span>
          </p>
        </div>

        {/* Slot Progress Bar */}
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
              style={{ width: `${Math.min((confirmedCount / capacity) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}

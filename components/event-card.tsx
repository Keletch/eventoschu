import { Card } from "@/components/ui/card";
import { Check, Calendar, Clock, MapPin, CircleDollarSign, Hourglass } from "lucide-react";

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
}: EventCardProps) {
  // Determine if we should render a flag SVG or a placeholder
  const FlagComponent = flag && (Flags as any)[flag.toUpperCase()] ? (Flags as any)[flag.toUpperCase()] : null;

  return (
    <Card 
      className={`relative p-6 md:p-8 cursor-pointer transition-all duration-500 border-2 rounded-[32px] ${
        selected 
          ? "border-blue-700 bg-white ring-4 ring-blue-700/5 shadow-2xl shadow-blue-700/10 -translate-y-1 z-10" 
          : "border-neutral-100 bg-white hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
      }`}
      onClick={() => onSelect(id)}
    >
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
          <div className={`size-12 md:size-14 ${bgClass} rounded-[16px] md:rounded-[20px] flex items-center justify-center shrink-0 overflow-hidden p-2.5 md:p-3`}>
            {FlagComponent ? (
              <FlagComponent className="w-full h-full object-contain drop-shadow-sm" />
            ) : (
              <span className="text-xl">📍</span>
            )}
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-950 truncate">{city}, {country}</h3>
        </div>
        
        {/* Selection Marker */}
        <div className={`w-6 h-6 md:w-7 md:h-7 rounded-[20px] border-2 flex items-center justify-center transition-all shrink-0 ${
          selected ? "bg-blue-700 border-blue-700" : "border-blue-700"
        }`}>
          {selected && <Check className="w-4 h-4 md:w-5 md:h-5 text-white" strokeWidth={3} />}
        </div>
      </div>

      <div className="space-y-3 text-sm md:text-[16px] leading-relaxed text-neutral-700">
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
          <span className="font-bold shrink-0">Valor:</span> 
          <span className="truncate">{price}</span>
        </p>
      </div>
    </Card>
  );
}

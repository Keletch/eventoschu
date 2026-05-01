"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COUNTRY_CODES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  value: string;
  isOther: boolean;
  onSelect: (val: string | null) => void;
  onCustomChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function CountrySelector({
  value,
  isOther,
  onSelect,
  onCustomChange,
}: CountrySelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <Label htmlFor="country" className="text-gray-900 font-bold px-1">
        País de residencia <span className="text-neutral-400 font-normal ml-1">(opcional)</span>
      </Label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <Select
            onValueChange={onSelect}
            value={isOther ? "otro" : value}
          >
            <SelectTrigger className={cn(
              "h-12 md:h-14 px-2.5 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50 transition-all text-left",
              isOther ? "w-[110px] md:w-[140px]" : "w-full"
            )}>
              <SelectValue>
                {isOther ? "Otro" : (value || "Seleccionar")}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {COUNTRY_CODES.map((item, idx) => (
                <SelectItem key={idx} value={item.country}>
                  <span className="flex items-center gap-2">
                    <span>{item.flag}</span>
                    <span>{item.country}</span>
                  </span>
                </SelectItem>
              ))}
              <SelectItem value="otro">
                <span className="flex items-center gap-2">
                  <span>🌍</span>
                  <span>Otro</span>
                </span>
              </SelectItem>
            </SelectContent>
          </Select>

          {isOther && (
            <Input
              id="country-custom"
              name="country"
              placeholder="Nombre del país"
              className="flex-1 h-12 md:h-14 rounded-xl border-neutral-200 focus:ring-blue-700 bg-neutral-50/50 animate-in fade-in slide-in-from-left-2 duration-300"
              value={value}
              onChange={onCustomChange}
              autoFocus
            />
          )}
        </div>
      </div>
    </div>
  );
}

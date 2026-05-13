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
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="country" className="text-foreground font-normal px-1 text-base">
        País de residencia <span className="text-muted-foreground/60 font-normal ml-1">(opcional)</span>
      </Label>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3">
          <Select
            onValueChange={onSelect}
            value={isOther ? "otro" : value}
          >
            <SelectTrigger className={cn(
              "h-10 md:h-11 px-4 rounded-xl border-[#616B77]/40 dark:border-primary/20 focus:ring-primary bg-transparent transition-all text-left text-foreground font-medium text-base",
              isOther ? "w-[100px] md:w-[120px]" : "w-full"
            )}>
              <SelectValue placeholder="Escribe tu país">
                {isOther ? "Otro" : (value || <span className="text-muted-foreground/40 font-medium text-base">Escribe tu país</span>)}
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
              className="flex-1 h-10 md:h-11 rounded-xl border-[#616B77]/40 dark:border-primary/20 focus:ring-primary bg-transparent placeholder:text-muted-foreground/40 placeholder:text-base placeholder:font-medium text-foreground font-medium text-base animate-in fade-in slide-in-from-left-2 duration-300"
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

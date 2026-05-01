import React from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  tooltipTitle: string;
  tooltipDescription: React.ReactNode;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder,
  value,
  onChange,
  tooltipTitle,
  tooltipDescription,
  className,
}) => {
  return (
    <div className={cn("relative flex-1 min-w-[200px]", className)}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={
            <div className="relative">
              <Input
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-11 rounded-xl bg-white border-neutral-200 hover:border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-500/10 transition-all duration-200 shadow-sm text-sm font-bold text-neutral-600 placeholder:text-xs placeholder:font-medium placeholder:text-neutral-400 pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          } />
          <TooltipContent side="bottom" className="p-4 rounded-2xl shadow-2xl bg-white border border-neutral-200 max-w-xs z-[100]">
            <div className="space-y-1">
              <p className="font-black text-blue-700 text-sm">{tooltipTitle}</p>
              <div className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                {tooltipDescription}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

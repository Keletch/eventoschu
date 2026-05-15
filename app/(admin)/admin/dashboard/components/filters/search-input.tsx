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
                className="h-11 rounded-xl bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-200 shadow-sm text-sm font-bold text-foreground placeholder:text-xs placeholder:font-medium placeholder:text-muted-foreground/60 pl-10 w-full"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            </div>
          } />
          <TooltipContent side="bottom" className="p-4 rounded-2xl shadow-2xl bg-card border border-border max-w-xs z-[100]">
            <div className="space-y-1">
              <p className="font-black text-primary text-sm">{tooltipTitle}</p>
              <div className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                {tooltipDescription}
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

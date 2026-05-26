import React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface PickerOption {
  id: string;
  label: string;
  searchValue?: string;
  color?: string;
}

interface SearchablePickerProps {
  options: PickerOption[];
  value: string;
  onSelect: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
}

export const SearchablePicker: React.FC<SearchablePickerProps> = ({
  options,
  value,
  onSelect,
  placeholder,
  searchPlaceholder = "Buscar...",
  emptyMessage = "No se encontraron resultados.",
  className,
  triggerClassName,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const portalContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        const input = containerRef.current?.querySelector('input[data-slot="command-input"]') as HTMLInputElement | null;
        if (input) {
          input.focus({ preventScroll: true });
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <div className="relative w-full sm:w-auto" ref={portalContainerRef}>
      <Popover open={disabled ? false : open} onOpenChange={disabled ? undefined : setOpen}>
        <PopoverTrigger render={
          <Button
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-11 rounded-xl bg-muted/30 border-border hover:bg-muted/50 hover:border-muted-foreground/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-200 shadow-sm text-sm font-bold text-foreground",
              disabled && "opacity-50 cursor-not-allowed bg-muted/10 border-border/50 text-muted-foreground hover:bg-muted/10 hover:border-border/50 hover:text-muted-foreground",
              triggerClassName
            )}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedOption?.color && (
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: selectedOption.color }}
                />
              )}
              {displayLabel}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
          </Button>
        } />
        <PopoverContent
          className={cn("p-0 rounded-2xl shadow-2xl border-border bg-card overflow-hidden picker-anim", className)}
          align="start"
          finalFocus={false}
          initialFocus={false}
          container={portalContainerRef}
        >
          <div ref={containerRef}>
            <Command>
              <CommandInput placeholder={searchPlaceholder} className="h-10 border-none focus:ring-0 text-xs" />
              <CommandList>
                <CommandEmpty className="p-4 text-[10px] text-muted-foreground/60 text-center">{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {options.map((option) => (
                    <CommandItem
                      key={option.id}
                      value={option.searchValue || option.label}
                      onSelect={() => {
                        onSelect(option.id);
                        setOpen(false);
                      }}
                      className="cursor-pointer py-2 text-xs"
                    >
                      <Check className={cn("mr-2 h-3 w-3", value === option.id ? "opacity-100" : "opacity-0")} />
                      {option.color && (
                        <span
                          className="mr-2 h-2 w-2 rounded-full shrink-0"
                          style={{ backgroundColor: option.color }}
                        />
                      )}
                      <span className="truncate">{option.label}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

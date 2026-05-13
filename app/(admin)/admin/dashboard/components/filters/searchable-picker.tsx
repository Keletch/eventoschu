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
}) => {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.id === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={
        <Button
          variant="outline"
          className={cn(
            "h-11 rounded-xl bg-card border-border hover:border-muted-foreground/30 focus:border-primary/40 focus:ring-2 focus:ring-primary/10 transition-all duration-200 shadow-sm text-sm font-bold text-foreground",
            triggerClassName
          )}
        >
          <span className="truncate">{displayLabel}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
        </Button>
      } />
      <PopoverContent className={cn("p-0 rounded-2xl shadow-2xl border-border bg-card overflow-hidden picker-anim", className)} align="start">
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
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

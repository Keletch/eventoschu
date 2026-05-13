"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeapTagPickerProps {
  label: string;
  value: string;
  onChange: (tagId: string) => void;
  tags: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
  showRefresh?: boolean;
}

export const KeapTagPicker: React.FC<KeapTagPickerProps> = ({
  label,
  value,
  onChange,
  tags,
  isLoading = false,
  onRefresh,
  showRefresh = false,
}) => {
  const [open, setOpen] = useState(false);
  const selectedTag = tags.find((t) => t.id === value);

  return (
    <div className={cn(label ? "space-y-2" : "")}>
      {label && (
        <div className="flex items-center justify-between min-h-6">
          <Label className="text-xs font-black uppercase text-muted-foreground">{label}</Label>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between rounded-xl h-12 font-normal bg-muted/30 border-border text-xs hover:bg-muted transition-all text-foreground"
          >
            <span className={cn("truncate", !selectedTag && "text-muted-foreground")}>
              {selectedTag ? selectedTag.name : "Seleccionar tag..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
          </Button>
        } />
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-2xl border-border bg-popover text-popover-foreground"
          align="start"
        >
          <Command className="rounded-2xl bg-popover">
            <CommandInput placeholder="Buscar tag..." className="h-11 text-xs border-none focus:ring-0" />
            <CommandList className="max-h-[220px]">
              <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">
                {isLoading ? "Cargando tags..." : "No se encontraron tags."}
              </CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    onSelect={() => { onChange(""); setOpen(false); }}
                    className="cursor-pointer text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="mr-2 h-3 w-3" />
                    Quitar selección
                  </CommandItem>
                )}
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => { onChange(tag.id); setOpen(false); }}
                    className={cn(
                      "cursor-pointer text-xs hover:bg-accent hover:text-accent-foreground transition-colors",
                      value === tag.id && "font-black text-primary bg-primary/5"
                    )}
                  >
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

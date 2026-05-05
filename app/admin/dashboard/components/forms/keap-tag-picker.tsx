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
          <Label className="text-xs font-black uppercase text-neutral-400">{label}</Label>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between rounded-xl h-12 font-normal bg-neutral-50 border-neutral-100 text-xs hover:bg-neutral-100 transition-all"
          >
            <span className={cn("truncate", !selectedTag && "text-neutral-400")}>
              {selectedTag ? selectedTag.name : "Seleccionar tag..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-40 shrink-0" />
          </Button>
        } />
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] p-0 rounded-2xl shadow-2xl border-neutral-100"
          align="start"
        >
          <Command className="rounded-2xl">
            <CommandInput placeholder="Buscar tag..." className="h-11 text-xs" />
            <CommandList className="max-h-[220px]">
              <CommandEmpty className="py-6 text-center text-xs text-neutral-400">
                {isLoading ? "Cargando tags..." : "No se encontraron tags."}
              </CommandEmpty>
              <CommandGroup>
                {value && (
                  <CommandItem
                    onSelect={() => { onChange(""); setOpen(false); }}
                    className="cursor-pointer text-xs text-red-500 hover:text-red-600"
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
                      "cursor-pointer text-xs",
                      value === tag.id && "font-bold text-blue-700"
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

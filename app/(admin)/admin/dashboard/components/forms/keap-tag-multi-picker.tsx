"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check, ChevronsUpDown, ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface KeapTagMultiPickerProps {
  label: string;
  value: string[];
  onChange: (tagIds: string[]) => void;
  tags: any[];
}

/** Busca cada línea/coma pegada por ID o nombre exacto (sin distinguir mayúsculas). */
export function matchPastedTags(text: string, tags: any[]) {
  const found: string[] = [];
  const missing: string[] = [];
  for (const raw of text.split(/[\n,;]+/)) {
    const token = raw.trim();
    if (!token) continue;
    const lower = token.toLowerCase();
    const tag = tags.find((t) => String(t.id) === token || String(t.name).trim().toLowerCase() === lower);
    if (tag) found.push(String(tag.id));
    else missing.push(token);
  }
  return { found, missing };
}

/** Selector de varios tags de Keap: búsqueda + pegar una lista de nombres o IDs. */
export const KeapTagMultiPicker: React.FC<KeapTagMultiPickerProps> = ({ label, value, onChange, tags }) => {
  const [open, setOpen] = useState(false);
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasted, setPasted] = useState("");
  const selected = value.map((id) => tags.find((t) => String(t.id) === id) ?? { id, name: `ID ${id}` });

  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  const applyPaste = () => {
    const { found, missing } = matchPastedTags(pasted, tags);
    const added = found.filter((id) => !value.includes(id));
    onChange([...value, ...added.filter((id, i) => added.indexOf(id) === i)]);
    if (missing.length) toast.warning(`${found.length} encontrados. No encontrados: ${missing.join(", ")}`);
    else toast.success(`${found.length} tags encontrados.`);
    setPasted("");
    setPasteOpen(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between min-h-6 gap-2">
        <Label className="text-xs font-black uppercase text-muted-foreground">{label}</Label>
        <Button type="button" variant="ghost" size="sm" onClick={() => setPasteOpen((o) => !o)} className="h-6 rounded-lg px-2 text-[10px] text-muted-foreground">
          <ClipboardList className="size-3 mr-1" /> Pegar lista
        </Button>
      </div>

      {pasteOpen && (
        <div className="space-y-2">
          <Textarea
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder={"Un tag por línea (nombre o ID), o separados por coma"}
            className="rounded-xl text-xs min-h-24 bg-muted/50"
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={() => setPasteOpen(false)} className="rounded-xl text-xs">Cancelar</Button>
            <Button type="button" size="sm" onClick={applyPaste} disabled={!pasted.trim()} className="rounded-xl text-xs">Buscar y seleccionar</Button>
          </div>
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between rounded-xl h-12 font-normal bg-muted/30 border-border text-xs hover:bg-muted transition-all text-foreground"
          >
            <span className={cn("truncate", !value.length && "text-muted-foreground")}>
              {value.length ? `${value.length} tag${value.length > 1 ? "s" : ""} seleccionado${value.length > 1 ? "s" : ""}` : "Seleccionar tags..."}
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
              <CommandEmpty className="py-6 text-center text-xs text-muted-foreground">No se encontraron tags.</CommandEmpty>
              <CommandGroup>
                {tags.map((tag) => {
                  const id = String(tag.id);
                  const isOn = value.includes(id);
                  return (
                    <CommandItem
                      key={id}
                      value={tag.name}
                      onSelect={() => toggle(id)}
                      className={cn("cursor-pointer text-xs", isOn && "font-black text-primary bg-primary/5")}
                    >
                      <Check className={cn("mr-2 h-3 w-3 shrink-0", isOn ? "opacity-100" : "opacity-0")} />
                      {tag.name}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span key={tag.id} className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 pl-3 pr-1 py-1 text-[11px] text-foreground">
              {tag.name}
              <button
                type="button"
                onClick={() => toggle(String(tag.id))}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Quitar ${tag.name}`}
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

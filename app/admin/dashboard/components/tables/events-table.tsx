import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MapPin, Copy, Edit, Trash2 } from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { cn } from "@/lib/utils";

interface EventsTableProps {
  events: any[];
  isLoading: boolean;
  registrations: any[];
  formatSafeDate: (date: any) => Date | null;
  toggleEventStatus: (id: string, currentStatus: boolean) => void;
  handleDuplicateEvent: (event: any) => void;
  handleEditEvent: (event: any) => void;
  handleDeleteEvent: (id: string) => void;
}

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  isLoading,
  registrations,
  formatSafeDate,
  toggleEventStatus,
  handleDuplicateEvent,
  handleEditEvent,
  handleDeleteEvent,
}) => {
  return (
    <Card className="rounded-3xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-neutral-50/50">
          <TableRow className="hover:bg-transparent border-neutral-200">
            <TableHead className="w-[300px] font-bold text-neutral-500 uppercase text-[10px] tracking-wider pl-6">Evento / Ciudad</TableHead>
            <TableHead className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Fecha</TableHead>
            <TableHead className="text-center font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Inscritos</TableHead>
            <TableHead className="text-center font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Estado</TableHead>
            <TableHead className="text-right pr-6 font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && events.length > 0 ? (
            events.map((event) => {
              const regCount = registrations.filter((r: any) =>
                r.selected_events?.includes(event.id) && r.event_statuses?.[event.id] === "confirmed"
              ).length;
              
              const FlagIcon = event.flag && (Flags as any)[event.flag.toUpperCase()] 
                ? (Flags as any)[event.flag.toUpperCase()] 
                : null;
                
              let formattedDate = "Sin fecha";
              if (event.start_date) {
                const parts = event.start_date.split('-');
                if (parts.length >= 3) {
                  const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2].substring(0,2)));
                  formattedDate = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
                }
              }

              return (
                <TableRow key={event.id} className="group border-neutral-100 hover:bg-neutral-50/50 transition-colors table-row-anim">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm overflow-hidden p-2", event.bg_class || "bg-sky-100")}>
                        {FlagIcon ? <FlagIcon className="w-full h-full object-contain" /> : <span className="text-xl">📍</span>}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{event.title}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.city}, {event.country}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formattedDate}
                  </TableCell>
                  <TableCell className="text-center font-bold">
                    <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none">
                      {regCount} / {event.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={event.active}
                      onCheckedChange={() => toggleEventStatus(event.id, event.active)}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateEvent(event)}
                        className="text-zinc-500 hover:bg-zinc-100 rounded-xl cursor-pointer"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEvent(event)}
                        className="text-blue-700 hover:bg-blue-50 rounded-xl cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event.id)}
                        className="text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-neutral-400">
                {isLoading ? "Cargando eventos..." : "No se encontraron eventos con esos filtros."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

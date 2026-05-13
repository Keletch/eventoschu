"use client";

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
import { MapPin, Copy, Edit, Trash2, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatSafeDate, formatDateToShort } from "@/lib/date-utils";
import { EventFlag } from "@/components/ui/event-flag";

interface EventsTableProps {
  events: any[];
  isLoading: boolean;
  registrations: any[];
  toggleEventStatus: (event: any) => void;
  handleDuplicateEvent: (event: any) => void;
  handleEditEvent: (event: any) => void;
  handleDeleteEvent: (event: any) => void;
}

export const EventsTable: React.FC<EventsTableProps> = ({
  events,
  isLoading,
  registrations,
  toggleEventStatus,
  handleDuplicateEvent,
  handleEditEvent,
  handleDeleteEvent,
}) => {
  return (
    <Card className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-[300px] font-bold text-muted-foreground uppercase text-[10px] tracking-wider pl-6">Evento / Ciudad</TableHead>
            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Fecha</TableHead>
            <TableHead className="text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Inscritos</TableHead>
            <TableHead className="text-center font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Estado</TableHead>
            <TableHead className="text-right pr-6 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && events.length > 0 ? (
            events.map((event) => {
              const regCount = registrations.filter((r: any) =>
                r.selected_events?.includes(event.id) && r.event_statuses?.[event.id] === "confirmed"
              ).length;
              
              const formattedDate = formatDateToShort(formatSafeDate(event.start_date));

              return (
                <TableRow key={event.id} className="group border-border hover:bg-muted/30 transition-colors table-row-anim">
                  <TableCell className="pl-6 py-4">
                    <div className="flex items-center gap-3">
                      <EventFlag 
                        flag={event.flag} 
                        bgClass={event.bg_class || "bg-muted"} 
                        className="w-10 h-10"
                       />
                      <div>
                        <div className="font-bold text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          {event.flag === 'WEB' ? (
                            <><Globe className="w-3 h-3" /> Evento en línea</>
                          ) : (
                            <><MapPin className="w-3 h-3" /> {event.city}, {event.country}</>
                          )}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {formattedDate}
                  </TableCell>
                   <TableCell className="text-center font-bold">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none">
                      {regCount} / {event.capacity >= 9999 ? "∞" : event.capacity}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={event.active}
                      onCheckedChange={() => toggleEventStatus(event)}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicateEvent(event)}
                         className="text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                        title="Duplicar"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditEvent(event)}
                        className="text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
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
              <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                {isLoading ? "Cargando eventos..." : "No se encontraron eventos con esos filtros."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

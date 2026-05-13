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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Info, 
  Edit, 
  Trash2, 
  MapPin,
  Mail,
  MessageCircle,
  ClipboardCheck,
  CheckCircle2
} from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { formatSafeDate, formatDateToShort } from "@/lib/date-utils";
import { ADMIN_STATUS_CONFIGS, AdminRegistrationStatus } from "../../utils/admin-constants";
import { EventFlag } from "@/components/ui/event-flag";

interface RegistrationsTableProps {
  registrations: any[];
  isLoading: boolean;
  events: any[];
  handleEditReg: (reg: any) => void;
  handleDeleteReg: (reg: any) => void;
}

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  isLoading,
  events,
  handleEditReg,
  handleDeleteReg,
}) => {
  return (
    <Card className="rounded-3xl border border-border overflow-hidden bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-border">
            <TableHead className="w-[340px] font-bold text-muted-foreground uppercase text-[10px] tracking-wider pl-6">Usuario / Contacto</TableHead>
            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Selección</TableHead>
            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Estado General</TableHead>
            <TableHead className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Registro</TableHead>
            <TableHead className="text-right pr-6 font-bold text-muted-foreground uppercase text-[10px] tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && registrations.length > 0 ? (
            registrations.map((reg) => (
              <TableRow key={reg.id} className="group border-border hover:bg-muted/30 transition-colors table-row-anim">
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className="font-bold text-foreground text-[15px]">
                      {reg.first_name ? `${reg.first_name} ${reg.last_name || ''}` : ((Object.values(reg.event_data || {}) as any[]).find((d: any) => d.first_name)?.first_name || 'Sin nombre')}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="text-xs font-medium text-primary flex items-center gap-1.5"><Mail className="w-3 h-3 text-muted-foreground/60" /> {reg.email}</div>
                      {(reg.phone || reg.phone_code) && (
                        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5"><MessageCircle className="w-3 h-3 text-muted-foreground/60" /> {reg.phone_code} {reg.phone}</div>
                      )}
                      {reg.residence_country && (
                        <div className="text-[10px] text-muted-foreground/60 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3" /> {reg.residence_country}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                    {reg.selected_events?.map((eventId: string) => {
                      const event = events.find((e: any) => e.id === eventId);
                      const status = (reg.event_statuses?.[eventId] || 'pending') as AdminRegistrationStatus;
                      const config = ADMIN_STATUS_CONFIGS[status] || ADMIN_STATUS_CONFIGS.pending;

                      return (
                        <TooltipProvider key={eventId}>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1 cursor-help transition-all",
                                  config.bg, config.text
                                )}
                              >
                                {event?.title || 'Evento'}
                                <Info className="w-2.5 h-2.5 opacity-40" />
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="p-3 rounded-xl shadow-xl bg-card border border-border z-[100]">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 border-b border-border pb-2 mb-1">
                                  <EventFlag 
                                    flag={event?.flag} 
                                    className="w-8 h-8 rounded-lg" 
                                    bgClass="bg-muted" 
                                  />
                                  <div>
                                    <p className="font-bold text-sm text-foreground">{event?.title}</p>
                                    <p className="text-[10px] text-muted-foreground/60 flex items-center gap-1 uppercase font-bold tracking-tighter">
                                      <MapPin className="w-2.5 h-2.5" /> {event?.city}, {event?.country}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Estado</span>
                                  <Badge className={cn("text-[9px] uppercase font-black px-2 py-0.5 rounded-full border-none", config.bg, config.text)}>
                                    {config.label}
                                  </Badge>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  {(() => {
                    const statuses = reg.selected_events?.map((id: string) => reg.event_statuses?.[id] || 'pending') || [];
                    const hasPending = statuses.includes('pending') || statuses.length === 0;
                    const allConfirmed = statuses.length > 0 && statuses.every((s: string) => s === 'confirmed');
                    const allCancelled = statuses.length > 0 && statuses.every((s: string) => s === 'cancelled');
                    
                    let config = ADMIN_STATUS_CONFIGS.pending;
                    let label = "Revisión Pendiente";

                    if (allConfirmed) {
                      config = ADMIN_STATUS_CONFIGS.confirmed;
                      label = "Confirmado";
                    } else if (allCancelled) {
                      config = ADMIN_STATUS_CONFIGS.cancelled;
                      label = "Cancelado";
                    } else if (!hasPending) {
                      label = "Mixto";
                      config = { ...ADMIN_STATUS_CONFIGS.confirmed, bg: "bg-primary/10", text: "text-primary" } as any;
                    }

                    return (
                      <div className="flex flex-col gap-1.5 items-start">
                        <Badge variant="outline" className={cn("text-[10px] border-none uppercase font-bold px-2 py-1", config.bg, config.text)}>
                          {label}
                        </Badge>
                        {reg.survey_data && typeof reg.survey_data === 'object' && Object.keys(reg.survey_data).length > 0 && (
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 animate-in fade-in zoom-in duration-500 cursor-help">
                                <span>Formulario</span>
                                <CheckCircle2 className="w-3 h-3" />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="right" className="bg-card border-border shadow-xl p-2 rounded-xl z-[110]">
                              <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Este usuario ya contestó el formulario general
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-medium text-muted-foreground/60">
                    {formatDateToShort(formatSafeDate(reg.created_at))}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(reg.email);
                        toast.success("Correo copiado al portapapeles");
                      }}
                      className="text-muted-foreground hover:bg-muted rounded-xl cursor-pointer"
                      title="Copiar Email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => {
                        const phone = ((reg.phone_code || '') + (reg.phone || '')).replace(/\D/g, '');
                        if(phone) window.open(`https://wa.me/${phone}`);
                      }}
                      className="text-emerald-500 hover:bg-emerald-500/10 rounded-xl cursor-pointer"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-border mx-1" />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditReg(reg)}
                      className="text-primary hover:bg-primary/10 rounded-xl cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteReg(reg)}
                      className="text-destructive hover:bg-destructive/10 rounded-xl cursor-pointer"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-40 text-center text-muted-foreground font-medium">
                {isLoading ? "Cargando usuarios..." : "No se encontraron usuarios."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

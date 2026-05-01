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
  MessageCircle
} from "lucide-react";
import * as Flags from "country-flag-icons/react/3x2";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { toast } from "sonner";

interface RegistrationsTableProps {
  registrations: any[];
  isLoading: boolean;
  events: any[];
  formatSafeDate: (date: any) => Date | null;
  handleEditReg: (reg: any) => void;
  handleDeleteReg: (id: string) => void;
}

export const RegistrationsTable: React.FC<RegistrationsTableProps> = ({
  registrations,
  isLoading,
  events,
  formatSafeDate,
  handleEditReg,
  handleDeleteReg,
}) => {
  return (
    <Card className="rounded-3xl border border-neutral-200 overflow-hidden bg-white shadow-sm">
      <Table>
        <TableHeader className="bg-neutral-50/50">
          <TableRow className="hover:bg-transparent border-neutral-200">
            <TableHead className="w-[340px] font-bold text-neutral-500 uppercase text-[10px] tracking-wider pl-6">Usuario / Contacto</TableHead>
            <TableHead className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Selección</TableHead>
            <TableHead className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Estado</TableHead>
            <TableHead className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Registro</TableHead>
            <TableHead className="text-right pr-6 font-bold text-neutral-500 uppercase text-[10px] tracking-wider">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && registrations.length > 0 ? (
            registrations.map((reg) => (
              <TableRow key={reg.id} className="group border-neutral-100 hover:bg-neutral-50/50 transition-colors table-row-anim">
                <TableCell className="pl-6 py-4">
                  <div className="flex flex-col space-y-1">
                    <span className="font-bold text-gray-900 text-[15px]">
                      {reg.first_name ? `${reg.first_name} ${reg.last_name || ''}` : ((Object.values(reg.event_data || {}) as any[]).find((d: any) => d.first_name)?.first_name || 'Sin nombre')}
                    </span>
                    <div className="flex flex-col gap-0.5 mt-1">
                      <div className="text-xs font-medium text-blue-900 flex items-center gap-1.5"><Mail className="w-3 h-3 text-neutral-400" /> {reg.email}</div>
                      {(reg.phone || reg.phone_code) && (
                        <div className="text-[11px] text-neutral-500 flex items-center gap-1.5"><MessageCircle className="w-3 h-3 text-neutral-400" /> {reg.phone_code} {reg.phone}</div>
                      )}
                      {reg.residence_country && (
                        <div className="text-[10px] text-neutral-400 flex items-center gap-1.5 mt-0.5">
                          <MapPin className="w-3 h-3" /> {reg.residence_country}
                        </div>
                      )}
                    </div>
                    <div className="pt-1">
                      {reg.survey_data ? (
                        <Badge variant="outline" className="text-[9px] bg-blue-50 text-blue-700 border-none uppercase font-black px-2 py-0.5">
                          Formulario Recibido
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] bg-neutral-50 text-neutral-400 border-none uppercase font-black px-2 py-0.5">
                          Sin Encuesta
                        </Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5 max-w-[400px]">
                    {reg.selected_events?.map((eventId: string) => {
                      const event = events.find((e: any) => e.id === eventId);
                      const status = reg.event_statuses?.[eventId] || 'pending';
                      
                      const FlagIcon = event?.flag && (Flags as any)[event.flag.toUpperCase()] 
                        ? (Flags as any)[event.flag.toUpperCase()] 
                        : null;

                      return (
                        <TooltipProvider key={eventId}>
                          <Tooltip>
                            <TooltipTrigger render={
                              <Badge 
                                variant="outline" 
                                className={cn(
                                  "text-[10px] px-2 py-0.5 rounded-lg border-none flex items-center gap-1 cursor-help",
                                  status === 'confirmed' ? "bg-emerald-50 text-emerald-700" :
                                  status === 'cancelled' ? "bg-red-50 text-red-700" :
                                  "bg-amber-50 text-amber-700"
                                )}
                              >
                                {event?.city || 'Evento'}
                                <Info className="w-2.5 h-2.5 opacity-40" />
                              </Badge>
                            } />
                            <TooltipContent side="top" className="p-3 rounded-xl shadow-xl bg-white border border-neutral-100 z-[100]">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 border-b border-neutral-50 pb-2 mb-1">
                                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-lg text-neutral-900 font-medium overflow-hidden p-1.5">
                                    {FlagIcon ? <FlagIcon className="w-full h-full object-contain" /> : "🌍"}
                                  </div>
                                  <div>
                                    <p className="font-bold text-sm text-neutral-800">{event?.title}</p>
                                    <p className="text-[10px] text-neutral-400 flex items-center gap-1 uppercase font-bold tracking-tighter">
                                      <MapPin className="w-2.5 h-2.5" /> {event?.city}, {event?.country}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                  <span className="text-[10px] text-neutral-400 font-bold uppercase">Estado</span>
                                  <Badge className={cn(
                                    "text-[9px] uppercase font-black px-2 py-0 rounded-full",
                                    status === 'confirmed' ? "bg-emerald-500 text-white" :
                                    status === 'cancelled' ? "bg-red-500 text-white" :
                                    "bg-amber-500 text-white"
                                  )}>
                                    {status === 'confirmed' ? 'Aprobado' : status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
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
                    
                    let badgeClasses = "bg-amber-50 text-amber-700";
                    let statusText = "Revisión Pendiente";

                    if (allConfirmed) {
                      badgeClasses = "bg-emerald-50 text-emerald-700";
                      statusText = "Confirmado";
                    } else if (allCancelled) {
                      badgeClasses = "bg-red-50 text-red-700";
                      statusText = "Cancelado";
                    } else if (!hasPending) {
                      badgeClasses = "bg-blue-50 text-blue-700";
                      statusText = "Mixto";
                    }

                    return (
                      <Badge variant="outline" className={cn("text-[10px] border-none uppercase font-bold px-2 py-1", badgeClasses)}>
                        {statusText}
                      </Badge>
                    );
                  })()}
                </TableCell>
                <TableCell>
                  <div className="text-xs font-medium text-neutral-400">
                    {formatSafeDate(reg.created_at)?.toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric',
                      timeZone: 'UTC'
                    })}
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
                      className="text-neutral-500 hover:bg-neutral-100 rounded-xl cursor-pointer"
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
                      className="text-emerald-600 hover:bg-emerald-50 rounded-xl cursor-pointer"
                      title="WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </Button>
                    <div className="w-px h-6 bg-neutral-200 mx-1" />
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleEditReg(reg)}
                      className="text-blue-700 hover:bg-blue-50 rounded-xl cursor-pointer"
                      title="Editar"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteReg(reg.id)}
                      className="text-red-500 hover:bg-red-50 rounded-xl cursor-pointer"
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
              <TableCell colSpan={4} className="h-40 text-center text-neutral-400">
                {isLoading ? "Cargando usuarios..." : "No se encontraron usuarios."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Card>
  );
};

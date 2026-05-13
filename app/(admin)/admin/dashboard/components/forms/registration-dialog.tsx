import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, MapPin, User, Info, Phone, Trash2, PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { EventFlag } from "@/components/ui/event-flag";
import { adminAddEventToUser, adminRemoveEventFromUser } from "@/app/actions/admin-mass-ops";
import { toast } from "sonner";
import { SearchablePicker } from "../filters/searchable-picker";


interface RegistrationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reg: any;
  setReg: (reg: any) => void;
  events: any[];
  onUpdate: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  onRefresh?: () => Promise<void>; // Para refrescar datos tras cambios rápidos
}

export const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  isOpen,
  onOpenChange,
  reg,
  setReg,
  events,
  onUpdate,
  isSubmitting,
  onRefresh
}) => {
  const [isProcessingEvent, setIsProcessingEvent] = React.useState<string | null>(null);
  const [selectedEventToAdd, setSelectedEventToAdd] = React.useState<string>("");

  if (!reg) return null;

  const availableEventsToAdd = events.filter(e => !reg.selected_events?.includes(e.id));

  const handleAddEvent = async () => {
    if (!selectedEventToAdd) return;
    
    setIsProcessingEvent('adding');
    try {
      const res = await adminAddEventToUser(reg.id, selectedEventToAdd);
      if (res.success) {
        toast.success("Evento agregado correctamente");
        setSelectedEventToAdd(""); // Limpiar selección
        if (onRefresh) await onRefresh();
      } else {
        toast.error(res.error || "Error al agregar evento");
      }
    } finally {
      setIsProcessingEvent(null);
    }
  };


  const handleRemoveEvent = async (eventId: string) => {
    if (!confirm("¿Estás seguro de eliminar esta inscripción? Se borrarán los tags de Keap y datos de este evento.")) return;
    
    setIsProcessingEvent(eventId);
    try {
      const res = await adminRemoveEventFromUser(reg.id, eventId);
      if (res.success) {
        toast.success("Evento eliminado correctamente");
        if (onRefresh) await onRefresh();
      } else {
        toast.error(res.error || "Error al eliminar evento");
      }
    } finally {
      setIsProcessingEvent(null);
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[40px] border-none shadow-2xl p-0 bg-card text-foreground">
        <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] no-scrollbar">
        <DialogHeader className="p-10 bg-primary text-primary-foreground relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <Badge className="w-fit bg-primary-foreground/20 text-primary-foreground border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Ficha del Usuario
            </Badge>
            <DialogTitle className="text-4xl font-black break-words overflow-hidden">
              {reg.first_name ? `${reg.first_name} ${reg.last_name || ''}` : ((Object.values(reg.event_data || {}) as any[]).find((d: any) => d.first_name)?.first_name || 'Gestión de Registro')}
            </DialogTitle>
            <div className="flex items-center gap-4 text-primary-foreground/70 text-sm font-medium mt-2 flex-wrap">
              <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {reg.email}</span>
              {reg.phone && (
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {reg.phone_code} {reg.phone}</span>
              )}
              {reg.residence_country && (
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {reg.residence_country}</span>
              )}
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={onUpdate} className="bg-card text-foreground">
          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-primary rounded-full"></div>
                <h3 className="text-lg font-black text-foreground">Inscripciones y Estados</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {reg.selected_events?.map((eventId: string) => {
                  const event = events.find((e: any) => e.id === eventId);
                  const currentStatus = reg.event_statuses?.[eventId] || 'pending';

                  return (
                    <div key={eventId} className="flex flex-col gap-4 p-5 bg-muted/40 rounded-[24px] border border-border hover:border-primary/50 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <EventFlag 
                            flag={event?.flag} 
                            className="w-12 h-12 rounded-2xl bg-card border border-border/50 group-hover:scale-110 transition-transform shadow-sm" 
                            bgClass="bg-card"
                          />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-0.5">{event?.title || 'Evento'}</p>
                            <p className="font-bold text-foreground leading-tight">{event?.city || 'Evento desconocido'}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {event?.country || 'Ubicación pendiente'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 min-w-[180px]">
                          <Select 
                            value={currentStatus} 
                            onValueChange={(val) => {
                              const newStatuses = { ...reg.event_statuses, [eventId]: val };
                              setReg({ ...reg, event_statuses: newStatuses });
                            }}
                          >
                            <SelectTrigger className={cn(
                              "rounded-xl border-none font-bold text-xs h-10 px-4 shadow-sm focus:ring-2 focus:ring-primary flex-1",
                              currentStatus === 'confirmed' ? "bg-emerald-500 text-white" :
                              currentStatus === 'cancelled' ? "bg-destructive text-destructive-foreground" : "bg-amber-500 text-white"
                            )}>
                              <SelectValue>
                                {currentStatus === 'confirmed' ? 'Confirmado' :
                                 currentStatus === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-border shadow-2xl bg-popover">
                              <SelectItem value="pending" className="rounded-xl font-bold text-xs text-amber-600">Pendiente</SelectItem>
                              <SelectItem value="confirmed" className="rounded-xl font-bold text-xs text-emerald-600">Aprobado</SelectItem>
                              <SelectItem value="cancelled" className="rounded-xl font-bold text-xs text-destructive">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveEvent(eventId)}
                            disabled={isProcessingEvent !== null}
                            className="h-10 w-10 rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            {isProcessingEvent === eventId ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Editable Event Data Form */}
                      {reg.event_data?.[eventId] && (
                        <div className="pt-4 mt-2 border-t border-border/50 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Datos capturados en registro</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase">País</Label>
                              <Input 
                                value={reg.event_data[eventId].residence_country || ''} 
                                onChange={(e) => {
                                  const newData = { ...reg.event_data };
                                  newData[eventId] = { ...newData[eventId], residence_country: e.target.value };
                                  setReg({ ...reg, event_data: newData });
                                }}
                                className="h-10 text-xs rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary border-border"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-muted-foreground uppercase">Tel</Label>
                              <div className="flex gap-2">
                                <Input 
                                  value={reg.event_data[eventId].phone_code || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], phone_code: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 w-20 text-xs rounded-xl bg-background text-center focus:ring-2 focus:ring-primary focus:border-primary border-border"
                                />
                                <Input 
                                  value={reg.event_data[eventId].phone || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], phone: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 flex-1 text-xs rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary border-border"
                                />
                              </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label className="text-[10px] text-muted-foreground uppercase">Nombre</Label>
                              <div className="flex gap-2">
                                <Input 
                                  value={reg.event_data[eventId].first_name || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], first_name: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 flex-1 text-xs rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary border-border"
                                />
                                <Input 
                                  value={reg.event_data[eventId].last_name || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], last_name: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 flex-1 text-xs rounded-xl bg-background focus:ring-2 focus:ring-primary focus:border-primary border-border"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Quick Add Event Selector */}
                {availableEventsToAdd.length > 0 && (
                  <div className="flex flex-col gap-4 p-5 bg-primary/5 rounded-[24px] border border-dashed border-primary/20 hover:border-primary/40 transition-all group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-card flex items-center justify-center text-primary shadow-sm border border-border/50">
                          <PlusCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">Agregar Inscripción</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                            Selecciona una gira para inscribir al usuario
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[280px] flex-1">
                        <SearchablePicker
                          options={availableEventsToAdd.map(e => ({
                            id: e.id,
                            label: e.title
                          }))}
                          value={selectedEventToAdd}
                          onSelect={(val) => setSelectedEventToAdd(val)}
                          placeholder="Elegir evento..."
                          triggerClassName="w-full h-10 border-blue-100"
                        />

                        <Button
                          type="button"
                          onClick={handleAddEvent}
                          disabled={!selectedEventToAdd || isProcessingEvent !== null}
                          className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-md shadow-primary/10 transition-all gap-2"
                        >
                          {isProcessingEvent === 'adding' ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <PlusCircle className="w-4 h-4" />
                          )}
                          Confirmar Inscripción
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {reg.survey_data && (
              <div className="p-6 bg-muted/30 rounded-[28px] border border-border space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                    <Info className="w-4 h-4" />
                  </div>
                  <h4 className="font-black text-foreground text-sm">Información Adicional</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 1. Relación con CDI */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Relación con CDI</p>
                    <p className="text-xs font-bold text-foreground">
                      {reg.survey_data.relationship?.answer || 'N/A'}
                    </p>
                  </div>

                  {/* 2. Tema para Profundizar */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Tema para Profundizar</p>
                    <p className="text-xs font-bold text-foreground">
                      {reg.survey_data.topic?.answer || 'N/A'}
                    </p>
                  </div>

                  {/* 3. Nivel de Experiencia */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Nivel de Experiencia</p>
                    <p className="text-xs font-bold text-foreground">
                      {reg.survey_data.experience?.answer || 'N/A'}
                    </p>
                  </div>

                  {/* 4. Obstáculo Financiero */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Obstáculo Financiero</p>
                    <p className="text-xs font-bold text-foreground">
                      {reg.survey_data.hurdle?.answer || 'N/A'}
                    </p>
                  </div>

                  {/* 5. Pregunta para Hyenuk */}
                  {reg.survey_data.question && (
                    <div className="md:col-span-2 space-y-1 pt-4 border-t border-border/50">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-wider">Pregunta para Hyenuk</p>
                      <div className="text-sm italic text-foreground bg-card p-4 rounded-xl border border-border shadow-sm">
                        "{reg.survey_data.question.answer || reg.survey_data.question}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-center items-center p-8 gap-4 sm:space-x-0 bg-muted/30 border-t border-border">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="rounded-2xl h-14 px-8 font-bold text-muted-foreground hover:bg-muted transition-all">
              Cerrar sin guardar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="rounded-[22px] h-14 px-10 bg-primary hover:bg-primary/90 text-primary-foreground font-black shadow-xl shadow-primary/20 transition-all gap-3"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

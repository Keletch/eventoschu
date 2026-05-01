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
import { Loader2, Mail, MapPin, User, Info, Phone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface RegistrationDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  reg: any;
  setReg: (reg: any) => void;
  events: any[];
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const RegistrationDialog: React.FC<RegistrationDialogProps> = ({
  isOpen,
  setIsOpen,
  reg,
  setReg,
  events,
  isSubmitting,
  onSubmit,
}) => {
  if (!reg) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden rounded-[40px] border-none shadow-2xl p-0 reg-dialog-anim">
        <div className="overflow-y-auto overflow-x-hidden max-h-[90vh] no-scrollbar">
        <DialogHeader className="p-10 bg-blue-700 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <User className="w-32 h-32" />
          </div>
          <div className="relative z-10 flex flex-col gap-2">
            <Badge className="w-fit bg-blue-500/30 text-blue-50 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
              Ficha del Usuario
            </Badge>
            <DialogTitle className="text-4xl font-black break-words overflow-hidden">
              {reg.first_name ? `${reg.first_name} ${reg.last_name || ''}` : ((Object.values(reg.event_data || {}) as any[]).find((d: any) => d.first_name)?.first_name || 'Gestión de Registro')}
            </DialogTitle>
            <div className="flex items-center gap-4 text-blue-100/70 text-sm font-medium mt-2 flex-wrap">
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

        <form onSubmit={onSubmit} className="bg-white">
          <div className="p-10 space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
                <h3 className="text-lg font-black text-neutral-800">Inscripciones y Estados</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {reg.selected_events?.map((eventId: string) => {
                  const event = events.find((e: any) => e.id === eventId);
                  const currentStatus = reg.event_statuses?.[eventId] || 'pending';

                  return (
                    <div key={eventId} className="flex flex-col gap-4 p-5 bg-neutral-50 rounded-[24px] border border-neutral-100 hover:border-blue-200 transition-all group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                            {event?.flag || "🌍"}
                          </div>
                          <div>
                            <p className="font-bold text-neutral-800">{event?.city || 'Evento desconocido'}</p>
                            <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-tighter flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {event?.country || 'Ubicación pendiente'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="min-w-[140px]">
                          <Select 
                            value={currentStatus} 
                            onValueChange={(val) => {
                              const newStatuses = { ...reg.event_statuses, [eventId]: val };
                              setReg({ ...reg, event_statuses: newStatuses });
                            }}
                          >
                            <SelectTrigger className={cn(
                              "rounded-xl border-none font-bold text-xs h-10 px-4 shadow-sm focus:ring-2 focus:ring-blue-500",
                              currentStatus === 'confirmed' ? "bg-emerald-500 text-white" :
                              currentStatus === 'cancelled' ? "bg-red-500 text-white" : "bg-amber-500 text-white"
                            )}>
                              <SelectValue>
                                {currentStatus === 'confirmed' ? 'Confirmado' :
                                 currentStatus === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              <SelectItem value="pending" className="rounded-xl font-bold text-xs text-amber-600">Pendiente</SelectItem>
                              <SelectItem value="confirmed" className="rounded-xl font-bold text-xs text-emerald-600">Aprobado</SelectItem>
                              <SelectItem value="cancelled" className="rounded-xl font-bold text-xs text-red-600">Cancelado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Editable Event Data Form */}
                      {reg.event_data?.[eventId] && (
                        <div className="pt-4 mt-2 border-t border-neutral-200/60 space-y-4">
                          <p className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Datos capturados en registro</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <Label className="text-[10px] text-neutral-500 uppercase">País</Label>
                              <Input 
                                value={reg.event_data[eventId].residence_country || ''} 
                                onChange={(e) => {
                                  const newData = { ...reg.event_data };
                                  newData[eventId] = { ...newData[eventId], residence_country: e.target.value };
                                  setReg({ ...reg, event_data: newData });
                                }}
                                className="h-10 text-xs rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-neutral-100"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-[10px] text-neutral-500 uppercase">Tel</Label>
                              <div className="flex gap-2">
                                <Input 
                                  value={reg.event_data[eventId].phone_code || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], phone_code: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 w-20 text-xs rounded-xl bg-white text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-neutral-100"
                                />
                                <Input 
                                  value={reg.event_data[eventId].phone || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], phone: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 flex-1 text-xs rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-neutral-100"
                                />
                              </div>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                              <Label className="text-[10px] text-neutral-500 uppercase">Nombre</Label>
                              <div className="flex gap-2">
                                <Input 
                                  value={reg.event_data[eventId].first_name || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], first_name: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 flex-1 text-xs rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-neutral-100"
                                />
                                <Input 
                                  value={reg.event_data[eventId].last_name || ''} 
                                  onChange={(e) => {
                                    const newData = { ...reg.event_data };
                                    newData[eventId] = { ...newData[eventId], last_name: e.target.value };
                                    setReg({ ...reg, event_data: newData });
                                  }}
                                  className="h-10 flex-1 text-xs rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 border-neutral-100"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {reg.survey_data && (
              <div className="p-6 bg-blue-50 rounded-[28px] border border-blue-100 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <Info className="w-4 h-4" />
                  </div>
                  <h4 className="font-black text-blue-900 text-sm">Información Adicional</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Tema de Interés */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Tema de Interés</p>
                    <p className="text-xs font-bold text-blue-800">
                      {reg.survey_data.topic === 'finanzas' && 'Finanzas Personales'}
                      {reg.survey_data.topic === 'trading' && 'Trading en Bolsa de Valores'}
                      {reg.survey_data.topic === 'cripto' && 'Criptomonedas'}
                      {reg.survey_data.topic === 'ingresos' && 'Nuevas fuentes de ingreso'}
                      {reg.survey_data.topic === 'mentalidad' && 'Mentalidad de Riqueza'}
                      {!['finanzas', 'trading', 'cripto', 'ingresos', 'mentalidad'].includes(reg.survey_data.topic) && (reg.survey_data.topic || 'N/A')}
                    </p>
                  </div>

                  {/* Nivel de Experiencia */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Nivel de Experiencia</p>
                    <p className="text-xs font-bold text-blue-800">
                      {reg.survey_data.experience === 'nivel1' && 'Aún no invierto, quiero aprender desde cero'}
                      {reg.survey_data.experience === 'nivel2' && 'He invertido algo, pero sin resultados consistentes'}
                      {reg.survey_data.experience === 'nivel3' && 'Invierto regularmente y quiero optimizar mi estrategia'}
                      {!['nivel1', 'nivel2', 'nivel3'].includes(reg.survey_data.experience) && (reg.survey_data.experience || 'N/A')}
                    </p>
                  </div>

                  {/* Conocimiento de Hyenuk */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Conocimiento de Hyenuk</p>
                    <p className="text-xs font-bold text-blue-800">
                      {reg.survey_data.relationship === 'nuevo' && 'Es la primera vez que escucho de él'}
                      {reg.survey_data.relationship === 'redes' && 'Lo sigo en redes sociales o YouTube'}
                      {reg.survey_data.relationship === 'libros' && 'He leído sus libros'}
                      {reg.survey_data.relationship === 'alumno' && 'Ya soy alumno o miembro de CDI'}
                      {!['nuevo', 'redes', 'libros', 'alumno'].includes(reg.survey_data.relationship) && (reg.survey_data.relationship || 'N/A')}
                    </p>
                  </div>

                  {/* Mayor Dolor */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Mayor Dolor</p>
                    <p className="text-xs font-bold text-blue-800">
                      {reg.survey_data.hurdle === 'dinero' && 'No tengo suficiente dinero para empezar'}
                      {reg.survey_data.hurdle === 'guia' && 'No sé por dónde empezar'}
                      {reg.survey_data.hurdle === 'miedo' && 'Me da miedo perder dinero'}
                      {reg.survey_data.hurdle === 'constancia' && 'Me cuesta ser constante'}
                      {reg.survey_data.hurdle === 'tiempo' && 'Tiempo'}
                      {!['dinero', 'guia', 'miedo', 'constancia', 'tiempo'].includes(reg.survey_data.hurdle) && (reg.survey_data.hurdle || 'N/A')}
                    </p>
                  </div>

                  {/* Pregunta para Hyenuk */}
                  {reg.survey_data.question && (
                    <div className="md:col-span-2 space-y-1 pt-4 border-t border-blue-100/50">
                      <p className="text-[10px] font-black uppercase text-blue-400 tracking-wider">Pregunta para Hyenuk</p>
                      <div className="text-sm italic text-blue-900 bg-white/50 p-4 rounded-xl border border-blue-100 shadow-sm">
                        "{reg.survey_data.question}"
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex sm:justify-center items-center p-8 gap-4 sm:space-x-0 bg-neutral-50/50 border-t border-neutral-100">
            <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="rounded-2xl h-14 px-8 font-bold text-neutral-400 hover:text-neutral-600 transition-all">
              Cerrar sin guardar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="rounded-[22px] h-14 px-10 bg-blue-700 hover:bg-blue-800 text-white font-black shadow-xl shadow-blue-200 transition-all gap-3"
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

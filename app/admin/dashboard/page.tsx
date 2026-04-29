"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getKeapTags } from "@/app/actions/keap";
import { getRegistrations, deleteRegistration, updateRegistration } from "@/app/actions/registrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, Plus, Users, Calendar, LogOut, Trash2, Edit, 
  MapPin, Tag, RefreshCw, Check, ChevronsUpDown, Copy,
  Mail, MessageCircle
} from "lucide-react";
import * as Flags from 'country-flag-icons/react/3x2';
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Helper to fix date timezone issues
const formatSafeDate = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    // Extract only the date part YYYY-MM-DD
    const baseDate = dateStr.split("T")[0];
    const parts = baseDate.split("-");
    if (parts.length === 3) {
      // Create date using local year, month (0-indexed), day
      // This ignores any timezone offset
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
};
export const dynamic = 'force-dynamic';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [keapTags, setKeapTags] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const router = useRouter();

  const [newEvent, setNewEvent] = useState({
    title: "", city: "", country: "", category_id: "", start_date: "",
    time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
    price: "30 USD", capacity: 50, keap_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true
  });

  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
      } else {
        setSession(session);
        fetchData();
        fetchTags();
      }
      setIsLoading(false);
    });
  }, [router]);

  async function fetchData() {
    const [eventsRes, regsRes, catsRes] = await Promise.all([
      supabase.from('events').select('*, categories(name)').order('created_at', { ascending: false }),
      getRegistrations(),
      supabase.from('categories').select('*')
    ]);

    if (eventsRes.data) setEvents(eventsRes.data);
    if (regsRes.success) setRegistrations(regsRes.data || []);
    if (catsRes.data) {
      setCategories(catsRes.data);
      const giraCat = catsRes.data.find(c => c.name.toLowerCase().includes('gira'));
      if (giraCat) setNewEvent(prev => ({ ...prev, category_id: giraCat.id.toString() }));
    }
  }

  async function fetchTags() {
    setIsTagsLoading(true);
    const result = await getKeapTags();
    if (result.success) setKeapTags(result.tags || []);
    setIsTagsLoading(false);
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { id, categories, ...payload } = newEvent as any;
      const { error } = id 
        ? await supabase.from('events').update(payload).eq('id', id)
        : await supabase.from('events').insert([payload]);

      if (error) throw error;
      toast.success(id ? "Evento actualizado" : "Evento creado");
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || "Error al procesar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewEvent = () => {
    setNewEvent({
      title: "", city: "", country: "", category_id: categories?.[0]?.id?.toString() || "", start_date: "",
      time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
      price: "30 USD", capacity: 50, keap_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true
    });
    setIsDialogOpen(true);
  };

  const handleEditEvent = (event: any) => {
    // Crucial: split by 'T' to get only the date YYYY-MM-DD for the input
    const formattedDate = event.start_date ? event.start_date.split('T')[0] : "";
    setNewEvent({ ...event, start_date: formattedDate, category_id: event.category_id?.toString() || "" });
    setIsDialogOpen(true);
  };

  const handleDuplicateEvent = (event: any) => {
    const { id, created_at, categories, ...rest } = event;
    const formattedDate = event.start_date ? event.start_date.split('T')[0] : "";
    setNewEvent({ 
      ...rest, 
      title: `${rest.title} (Copia)`,
      start_date: formattedDate, 
      category_id: event.category_id?.toString() || "" 
    });
    setIsDialogOpen(true);
    toast.info("Copia creada. Ajusta los detalles y publica.");
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("¿Eliminar este evento definitivamente?")) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      toast.success("Evento eliminado");
      fetchData();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const toggleEventStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('events').update({ active: !currentStatus }).eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (err) {
      toast.error("Error al actualizar");
    }
  };

  const handleEditReg = (reg: any) => {
    // Ensure event_statuses exists and has keys for all selected events
    const event_statuses = reg.event_statuses || {};
    reg.selected_events?.forEach((eventId: string) => {
      if (!event_statuses[eventId]) {
        event_statuses[eventId] = 'pending';
      }
    });
    setEditingReg({ ...reg, event_statuses });
    setIsRegDialogOpen(true);
  };

  const handleUpdateReg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { id, created_at, updated_at, ...payload } = editingReg;
      const result = await updateRegistration(id, payload);
      if (!result.success) throw new Error(result.error);
      
      toast.success("Registro actualizado");
      setIsRegDialogOpen(false);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReg = async (id: string) => {
    if (!confirm("¿Eliminar este registro definitivamente?")) return;
    try {
      const result = await deleteRegistration(id);
      if (!result.success) throw new Error(result.error);
      toast.success("Registro eliminado");
      fetchData();
    } catch (err) {
      toast.error("Error al eliminar");
    }
  };

  const toggleRegEvent = (eventId: string) => {
    setEditingReg((prev: any) => {
      const currentEvents = prev.selected_events || [];
      const currentStatuses = prev.event_statuses || {};
      
      let newEvents;
      let newStatuses = { ...currentStatuses };

      if (currentEvents.includes(eventId)) {
        newEvents = currentEvents.filter((id: string) => id !== eventId);
        // We could keep or remove the status, keeping it is safer for history
      } else {
        newEvents = [...currentEvents, eventId];
        if (!newStatuses[eventId]) {
          newStatuses[eventId] = 'pending';
        }
      }
      
      return { ...prev, selected_events: newEvents, event_statuses: newStatuses };
    });
  };

  const updateRegEventStatus = (eventId: string, status: string) => {
    setEditingReg((prev: any) => ({
      ...prev,
      event_statuses: {
        ...(prev.event_statuses || {}),
        [eventId]: status
      }
    }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 pb-20">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none !important; }
        .no-scrollbar { -ms-overflow-style: none !important; scrollbar-width: none !important; }
        /* Ultra aggressive global scrollbar hide for admin */
        body.admin-mode::-webkit-scrollbar { display: none !important; }
      `}</style>

      <TooltipProvider>
        <Toaster position="top-right" richColors />
        
        <header className="bg-white border-b border-neutral-200 px-6 py-4 mb-8 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sky-950 font-black text-2xl tracking-tighter">CDI</div>
              <h1 className="text-xl font-bold text-black border-l border-neutral-200 pl-4">Panel de Administración</h1>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-red-500 hover:bg-red-50 rounded-xl">
              <LogOut className="w-5 h-5 mr-2" /> Salir
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Total Inscritos</p>
                  <h3 className="text-3xl font-black mt-1">{registrations.length}</h3>
                </div>
                <div className="bg-blue-50 p-3 rounded-2xl text-blue-700"><Users className="w-6 h-6" /></div>
              </div>
            </Card>
            <Card className="rounded-3xl border-none shadow-sm bg-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-neutral-500 font-bold uppercase tracking-wider">Eventos Activos</p>
                  <h3 className="text-3xl font-black mt-1">{events.filter(e => e.active).length}</h3>
                </div>
                <div className="bg-green-50 p-3 rounded-2xl text-green-600"><Calendar className="w-6 h-6" /></div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="bg-white p-1 rounded-2xl border border-neutral-200 h-auto">
              <TabsTrigger value="events" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white font-bold transition-all cursor-pointer">Eventos</TabsTrigger>
              <TabsTrigger value="registrations" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white font-bold transition-all cursor-pointer">Inscritos</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">Gestión de Giras</h2>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <Button onClick={handleNewEvent} className="bg-blue-700 hover:bg-blue-800 rounded-2xl px-6 h-12 font-bold shadow-lg shadow-blue-700/20">
                    <Plus className="w-5 h-5 mr-2" /> 
                    Crear Gira
                  </Button>
                  <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden bg-white no-scrollbar border-none">
                    <div className="p-10 max-h-[85vh] overflow-y-auto no-scrollbar">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900">{(newEvent as any).id ? "Editar Gira" : "Nueva Gira"}</DialogTitle>
                        <DialogDescription>Completa todos los detalles para publicar la gira en el calendario.</DialogDescription>
                      </DialogHeader>
                      
                      <form onSubmit={handleCreateEvent} className="grid grid-cols-2 gap-6 mt-8">
                        <div className="col-span-2 space-y-2">
                          <Label className="font-bold">Título del Evento</Label>
                          <Input required value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="rounded-xl h-12" placeholder="Ej: Meetup: Lima" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="font-bold">Fecha</Label>
                          <Input type="date" required value={newEvent.start_date} onChange={(e) => setNewEvent({...newEvent, start_date: e.target.value})} className="rounded-xl h-12" />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="font-bold">Hora</Label>
                          <Input type="time" required value={newEvent.time} onChange={(e) => setNewEvent({...newEvent, time: e.target.value})} className="rounded-xl h-12" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Ciudad</Label>
                          <Input required value={newEvent.city} onChange={(e) => setNewEvent({...newEvent, city: e.target.value})} className="rounded-xl h-12" placeholder="Lima" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">País</Label>
                          <Input required value={newEvent.country} onChange={(e) => setNewEvent({...newEvent, country: e.target.value})} className="rounded-xl h-12" placeholder="Perú" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Ubicación</Label>
                          <Input required value={newEvent.location} onChange={(e) => setNewEvent({...newEvent, location: e.target.value})} className="rounded-xl h-12" placeholder="Hotel Estelar" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Precio</Label>
                          <Input required value={newEvent.price} onChange={(e) => setNewEvent({...newEvent, price: e.target.value})} className="rounded-xl h-12" placeholder="30 USD" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Capacidad</Label>
                          <Input type="number" required value={newEvent.capacity} onChange={(e) => setNewEvent({...newEvent, capacity: parseInt(e.target.value) || 0})} className="rounded-xl h-12" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Bandera (ISO: PE, MX, CO, US, ES...)</Label>
                          <div className="flex gap-3">
                            <div className="size-12 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200 overflow-hidden shrink-0 p-2">
                              {(() => {
                                const FlagComp = newEvent.flag && (Flags as any)[newEvent.flag.toUpperCase()] ? (Flags as any)[newEvent.flag.toUpperCase()] : null;
                                return FlagComp ? <FlagComp className="w-full h-full object-contain" /> : <span className="text-xl">📍</span>;
                              })()}
                            </div>
                            <Input required value={newEvent.flag} onChange={(e) => setNewEvent({...newEvent, flag: e.target.value.toUpperCase()})} className="rounded-xl h-12" placeholder="PE" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold">Color de Fondo (Icono)</Label>
                          <Select value={newEvent.bg_class} onValueChange={(val: string | null) => setNewEvent({...newEvent, bg_class: val || ""})}>
                            <SelectTrigger className="rounded-xl h-12">
                              <SelectValue>
                                {
                                  {
                                    "bg-sky-100": "Azul Cielo",
                                    "bg-emerald-100": "Verde Esmeralda",
                                    "bg-amber-100": "Ámbar",
                                    "bg-rose-100": "Rosa",
                                    "bg-purple-100": "Púrpura",
                                    "bg-neutral-100": "Gris Neutro"
                                  }[newEvent.bg_class] || "Seleccionar color"
                                }
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              <SelectItem value="bg-sky-100">Azul Cielo</SelectItem>
                              <SelectItem value="bg-emerald-100">Verde Esmeralda</SelectItem>
                              <SelectItem value="bg-amber-100">Ámbar</SelectItem>
                              <SelectItem value="bg-rose-100">Rosa</SelectItem>
                              <SelectItem value="bg-purple-100">Púrpura</SelectItem>
                              <SelectItem value="bg-neutral-100">Gris Neutro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="col-span-2 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="font-bold">Etiqueta Keap (Tag)</Label>
                            <Tooltip>
                              <TooltipTrigger render={<Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={fetchTags} disabled={isTagsLoading}><RefreshCw className={cn("h-4 w-4", isTagsLoading && "animate-spin")} /></Button>} />
                              <TooltipContent>Sincronizar tags de Keap</TooltipContent>
                            </Tooltip>
                          </div>
                          <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                            <PopoverTrigger render={<Button variant="outline" className="w-full justify-between rounded-xl h-12 font-normal">{newEvent.keap_tag_id ? keapTags.find(t => t.id === newEvent.keap_tag_id)?.name : "Seleccionar tag de Keap..."}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button>} />
                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl">
                              <Command className="rounded-xl">
                                <CommandInput placeholder="Buscar tag..." />
                                <CommandList className="max-h-[250px]">
                                  <CommandEmpty>No hay tags.</CommandEmpty>
                                  <CommandGroup>{keapTags.map(tag => (<CommandItem key={tag.id} onSelect={() => { setNewEvent({...newEvent, keap_tag_id: tag.id}); setTagPopoverOpen(false); }} className="cursor-pointer">{tag.name}</CommandItem>))}</CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </div>

                        <div className="col-span-2 flex items-center justify-between p-5 bg-neutral-50 rounded-2xl border border-neutral-100">
                          <div className="space-y-0.5"><Label className="font-bold">¿Evento Activo?</Label><p className="text-xs text-neutral-500">Visible inmediatamente en la web.</p></div>
                          <Switch checked={newEvent.active} onCheckedChange={(val) => setNewEvent({...newEvent, active: val})} />
                        </div>

                        <DialogFooter className="col-span-2 pt-6">
                          <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                          <Button type="submit" className="bg-blue-700 px-10 h-12 rounded-xl shadow-lg shadow-blue-700/20" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {(newEvent as any).id ? "Actualizar Gira" : "Publicar Gira"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="font-bold py-5 px-6">Gira</TableHead>
                      <TableHead className="font-bold">Fecha</TableHead>
                      <TableHead className="font-bold text-center">Inscritos</TableHead>
                      <TableHead className="font-bold text-center">Activo</TableHead>
                      <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? [1,2,3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-6"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>) : 
                      events.length > 0 ? events.map((event) => {
                        const regCount = registrations.filter(r => r.selected_events?.includes(event.id)).length;
                        return (
                          <TableRow key={event.id} className="hover:bg-neutral-50/50 transition-colors group">
                            <TableCell className="py-5 px-6">
                              <div className="flex items-center gap-3">
                                <div className="size-12 bg-neutral-100 rounded-2xl flex items-center justify-center overflow-hidden p-2">
                                  {(() => {
                                    const FlagIcon = event.flag && (Flags as any)[event.flag.toUpperCase()] ? (Flags as any)[event.flag.toUpperCase()] : null;
                                    return FlagIcon ? <FlagIcon className="w-full h-full object-contain" /> : <span className="text-xl">📍</span>;
                                  })()}
                                </div>
                                <div><div className="font-bold text-gray-900">{event.title}</div><div className="text-xs text-neutral-500 flex items-center gap-1"><MapPin className="w-3 h-3" /> {event.city}, {event.country}</div></div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {formatSafeDate(event.start_date)?.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' }) || "Sin fecha"}
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-none">{regCount} / {event.capacity}</Badge>
                            </TableCell>
                            <TableCell className="text-center"><Switch checked={event.active} onCheckedChange={() => toggleEventStatus(event.id, event.active)} /></TableCell>
                            <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleDuplicateEvent(event)} className="text-zinc-500 hover:bg-zinc-100 rounded-xl cursor-pointer" title="Duplicar"><Copy className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)} className="text-blue-700 hover:bg-blue-50 rounded-xl cursor-pointer" title="Editar"><Edit className="w-4 h-4" /></Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event.id)} className="text-red-500 hover:bg-red-50 rounded-xl cursor-pointer" title="Eliminar"><Trash2 className="w-4 h-4" /></Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      }) : <TableRow><TableCell colSpan={5} className="h-40 text-center text-neutral-400">No hay giras publicadas todavía.</TableCell></TableRow>
                    }
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="registrations">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-gray-900">Inscritos a Giras</h2>
                <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
                  <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden bg-white no-scrollbar border-none">
                    <div className="p-10 max-h-[85vh] overflow-y-auto no-scrollbar">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900">Editar Inscripción</DialogTitle>
                        <DialogDescription>Modifica los datos del usuario o gestiona sus eventos seleccionados.</DialogDescription>
                      </DialogHeader>
                      
                      {editingReg && (
                        <form onSubmit={handleUpdateReg} className="grid grid-cols-2 gap-6 mt-8">
                          <div className="space-y-2">
                            <Label className="font-bold">Nombre</Label>
                            <Input required value={editingReg.first_name} onChange={(e) => setEditingReg({...editingReg, first_name: e.target.value})} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Apellido</Label>
                            <Input required value={editingReg.last_name} onChange={(e) => setEditingReg({...editingReg, last_name: e.target.value})} className="rounded-xl h-12" />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label className="font-bold">Email</Label>
                            <Input type="email" required value={editingReg.email} onChange={(e) => setEditingReg({...editingReg, email: e.target.value})} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Cód. País</Label>
                            <Input required value={editingReg.phone_code} onChange={(e) => setEditingReg({...editingReg, phone_code: e.target.value})} className="rounded-xl h-12" placeholder="52" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Teléfono</Label>
                            <Input required value={editingReg.phone} onChange={(e) => setEditingReg({...editingReg, phone: e.target.value})} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">País de Residencia</Label>
                            <Input value={editingReg.residence_country || ""} onChange={(e) => setEditingReg({...editingReg, residence_country: e.target.value})} className="rounded-xl h-12" />
                          </div>
                          {/* Global Status Removed */}

                          <div className="col-span-2 space-y-4">
                            <Label className="font-bold">Giras y Estados</Label>
                            <div className="space-y-3">
                              {events.map((ev) => {
                                const isSelected = editingReg.selected_events?.includes(ev.id);
                                const currentStatus = editingReg.event_statuses?.[ev.id] || 'pending';
                                
                                return (
                                  <div key={ev.id} className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all",
                                    isSelected ? "bg-white border-blue-200 shadow-sm" : "bg-neutral-50 border-neutral-100 opacity-60"
                                  )}>
                                    <div className="flex items-center gap-3">
                                      <div 
                                        onClick={() => toggleRegEvent(ev.id)}
                                        className={cn(
                                          "cursor-pointer size-6 rounded-lg border-2 flex items-center justify-center transition-all",
                                          isSelected ? "bg-blue-700 border-blue-700 text-white" : "border-neutral-300 bg-white"
                                        )}
                                      >
                                        {isSelected && <Check className="w-4 h-4" />}
                                      </div>
                                      <div>
                                        <div className="font-bold text-sm">{ev.city}</div>
                                        <div className="text-[10px] text-neutral-500 uppercase">{ev.country}</div>
                                      </div>
                                    </div>

                                    {isSelected && (
                                      <Select 
                                        value={currentStatus} 
                                        onValueChange={(val) => updateRegEventStatus(ev.id, val)}
                                      >
                                        <SelectTrigger className="w-[140px] h-9 rounded-xl text-xs font-bold">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-xl">
                                          <SelectItem value="pending">Pendiente</SelectItem>
                                          <SelectItem value="confirmed">Confirmado</SelectItem>
                                          <SelectItem value="cancelled">Cancelado</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          <DialogFooter className="col-span-2 pt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsRegDialogOpen(false)} className="rounded-xl">Cancelar</Button>
                            <Button type="submit" className="bg-blue-700 px-10 h-12 rounded-xl shadow-lg shadow-blue-700/20" disabled={isSubmitting}>
                              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                              Guardar Cambios
                            </Button>
                          </DialogFooter>
                        </form>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="font-bold py-5 px-6">Usuario</TableHead>
                      <TableHead className="font-bold">Contacto</TableHead>
                      <TableHead className="font-bold">Selección</TableHead>
                      <TableHead className="font-bold">Estado</TableHead>
                      <TableHead className="font-bold">Registro</TableHead>
                      <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {registrations.length > 0 ? registrations.map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-neutral-50/50 transition-colors">
                        <TableCell className="py-5 px-6 font-bold">{reg.first_name} {reg.last_name}</TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-gray-900">{reg.email}</div>
                          <div className="text-xs text-neutral-500">+{reg.phone_code} {reg.phone}</div>
                          {reg.residence_country && (
                            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {reg.residence_country}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1.5 max-w-[250px]">
                            {reg.selected_events?.map((eId: string) => {
                              const ev = events.find(e => e.id === eId);
                              const status = reg.event_statuses?.[eId] || 'pending';
                              
                              return (
                                <Tooltip key={eId}>
                                  <TooltipTrigger>
                                    <Badge 
                                      variant="outline" 
                                      className={cn(
                                        "text-[10px] uppercase font-black py-0 px-2 rounded-md border-2",
                                        status === 'confirmed' ? "bg-green-50 text-green-700 border-green-100" : 
                                        status === 'cancelled' ? "bg-red-50 text-red-700 border-red-100" : 
                                        "bg-amber-50 text-amber-700 border-amber-100"
                                      )}
                                    >
                                      {ev?.city || 'Gira'}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p className="font-bold uppercase text-[10px]">{status === 'confirmed' ? 'Confirmado' : status === 'cancelled' ? 'Cancelado' : 'Pendiente'}</p>
                                  </TooltipContent>
                                </Tooltip>
                              )
                            })}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const activeStatuses = reg.selected_events?.map((id: string) => reg.event_statuses?.[id] || 'pending') || [];
                            
                            if (activeStatuses.includes('pending')) {
                              return (
                                <Badge className="bg-amber-50 text-amber-700 border-amber-100 rounded-full">
                                  Revisión Pendiente
                                </Badge>
                              );
                            }
                            
                            const allConfirmed = activeStatuses.length > 0 && activeStatuses.every((s: string) => s === 'confirmed');
                            if (allConfirmed) {
                              return (
                                <Badge className="bg-green-50 text-green-700 border-green-100 rounded-full">
                                  Confirmado
                                </Badge>
                              );
                            }

                            const allCancelled = activeStatuses.length > 0 && activeStatuses.every((s: string) => s === 'cancelled');
                            if (allCancelled) {
                              return (
                                <Badge className="bg-red-50 text-red-700 border-red-100 rounded-full">
                                  Cancelado
                                </Badge>
                              );
                            }

                            return (
                              <Badge variant="outline" className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest border-neutral-200">
                                Multi-Estado
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className="text-xs text-neutral-400">
                          {formatSafeDate(reg.created_at.split('T')[0])?.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) || "Sin fecha"}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1">
                            <Tooltip>
                              <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => window.open(`mailto:${reg.email}`)} className="text-neutral-500 hover:bg-neutral-100 rounded-xl"><Mail className="w-4 h-4" /></Button>} />
                              <TooltipContent>Enviar Email</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => window.open(`https://wa.me/${reg.phone_code}${reg.phone}`)} className="text-green-600 hover:bg-green-50 rounded-xl"><MessageCircle className="w-4 h-4" /></Button>} />
                              <TooltipContent>Enviar WhatsApp</TooltipContent>
                            </Tooltip>
                            <div className="w-px h-8 bg-neutral-200 mx-1 self-center" />
                            <Button variant="ghost" size="icon" onClick={() => handleEditReg(reg)} className="text-blue-700 hover:bg-blue-50 rounded-xl"><Edit className="w-4 h-4" /></Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteReg(reg.id)} className="text-red-500 hover:bg-red-50 rounded-xl"><Trash2 className="w-4 h-4" /></Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={6} className="h-40 text-center text-neutral-400">No hay registros todavía.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </TooltipProvider>
    </div>
  );
}

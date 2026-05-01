"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getKeapTags } from "@/app/actions/keap";
import { clearEventsCache } from "@/app/actions/events";
import { getRegistrations, deleteRegistration, updateRegistration } from "@/app/actions/registrations";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Plus, Users, Calendar, LogOut, Trash2, Edit,
  MapPin, Tag, RefreshCw, Check, ChevronsUpDown, Copy,
  Mail, MessageCircle, Info, ClipboardCheck, Search, Ticket
} from "lucide-react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
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
import { NotificationBell } from "@/components/notification-bell";
import { cn } from "@/lib/utils";

// Helper to fix date timezone issues
// Shared Design Tokens for Admin Filters
const FILTER_BASE_CLASSES = "h-11 rounded-xl bg-white border-neutral-200 hover:border-neutral-300 focus:border-neutral-400 focus:ring-2 focus:ring-neutral-500/10 transition-all duration-200 shadow-sm";
const FILTER_TEXT_CLASSES = "text-sm font-bold text-neutral-600";
const FILTER_ICON_CLASSES = "w-4 h-4 text-neutral-400";
const PLACEHOLDER_STYLE = "placeholder:text-xs placeholder:font-medium placeholder:text-neutral-400";

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
  const registrationsRef = useRef(registrations);
  const eventsRef = useRef(events);

  // Keep refs in sync for Realtime listeners
  useEffect(() => {
    registrationsRef.current = registrations;
    eventsRef.current = events;
  }, [registrations, events]);
  const [keapTags, setKeapTags] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [pendingTagPopoverOpen, setPendingTagPopoverOpen] = useState(false);
  const router = useRouter();

  // Search & Filter States
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventsStatusFilter, setEventsStatusFilter] = useState("all");
  const [eventsCategoryFilter, setEventsCategoryFilter] = useState("all");
  
  const [regsSearch, setRegsSearch] = useState("");
  const [regsEventFilter, setRegsEventFilter] = useState("all");
  const [regsStatusFilter, setRegsStatusFilter] = useState("all");
  const [regsCategoryFilter, setRegsCategoryFilter] = useState("all");

  const [eventPickerOpen, setEventPickerOpen] = useState(false);
  const [catPickerOpen, setCatPickerOpen] = useState(false);
  const [eventTabCatPickerOpen, setEventTabCatPickerOpen] = useState(false);
  const [eventStatusPickerOpen, setEventStatusPickerOpen] = useState(false);
  const [regStatusPickerOpen, setRegStatusPickerOpen] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "", city: "", country: "", category_id: "", start_date: "",
    time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
    price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true
  });

  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<any>(null);

  // GSAP Animations for Dialogs
  useGSAP(() => {
    if (isDialogOpen) {
      gsap.from(".dialog-content-anim", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: "power4.out",
        stagger: 0.05
      });
    }
  }, [isDialogOpen]);

  useGSAP(() => {
    if (isRegDialogOpen) {
      gsap.from(".reg-dialog-anim", {
        scale: 0.98,
        opacity: 0,
        y: 10,
        duration: 0.4,
        ease: "back.out(1.7)"
      });
    }
  }, [isRegDialogOpen]);

  useGSAP(() => {
    if (eventPickerOpen || catPickerOpen || eventTabCatPickerOpen || eventStatusPickerOpen || regStatusPickerOpen) {
      gsap.from(".picker-anim", {
        y: -10,
        opacity: 0,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [eventPickerOpen, catPickerOpen, eventTabCatPickerOpen, eventStatusPickerOpen, regStatusPickerOpen]);

  // GSAP Animations for Tables
  useGSAP(() => {
    if (!isLoading && (events.length > 0 || registrations.length > 0)) {
      gsap.from(".table-row-anim", {
        opacity: 0,
        x: -10,
        stagger: 0.02,
        duration: 0.5,
        ease: "power2.out",
        clearProps: "all"
      });
    }
  }, [isLoading, events.length, registrations.length, eventsSearch, regsSearch]);



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

    // Realtime listeners for admin: Sync everything live
    const channel = supabase
      .channel('admin-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations' },
        (payload: any) => {
          // Intelligent Notifications
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newReg = payload.new;
            const oldReg = payload.old || {};
            
            // 1. Detect Email Change
            if (payload.eventType === 'UPDATE' && oldReg.email && newReg.email && oldReg.email.toLowerCase() !== newReg.email.toLowerCase()) {
              toast.warning(`¡Cambio de Email detectado!`, {
                description: `${oldReg.email} ha cambiado a ${newReg.email} vía Clerk.`,
                duration: 8000
              });
            }

            // 2. Detect New Event Registrations
            const newEvents = newReg.selected_events || [];
            const newlyAddedIds = payload.eventType === 'INSERT' 
              ? newEvents 
              : newEvents.filter((id: string) => !oldReg.selected_events?.includes(id));

            if (newlyAddedIds.length > 0) {
              newlyAddedIds.forEach((id: string) => {
                const event = eventsRef.current.find((e: any) => e.id === id);
                if (event) {
                  const d = new Date(event.start_date);
                  const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
                  const catName = event.categories?.name || "Evento";
                  toast.info(`¡Nuevo registro en evento!`, {
                    description: `${newReg.email} se ha inscrito a ${catName} ${event.country} (${dateStr})`,
                    duration: 6000
                  });
                }
              });
            }

            // 3. Detect Granular Data Changes in Event Snapshots
            if (payload.eventType === 'UPDATE') {
              const oldData = oldReg.event_data || {};
              const newData = newReg.event_data || {};
              
              Object.keys(newData).forEach(eventId => {
                const oldSnap = oldData[eventId];
                const newSnap = newData[eventId];
                
                if (oldSnap && newSnap) {
                  const fieldsToWatch = [
                    { key: 'first_name', label: 'nombre' },
                    { key: 'last_name', label: 'apellido' },
                    { key: 'phone', label: 'teléfono' },
                    { key: 'residence_country', label: 'país' }
                  ];

                  fieldsToWatch.forEach(field => {
                    if (oldSnap[field.key] !== newSnap[field.key]) {
                      const event = eventsRef.current.find((e: any) => e.id === eventId);
                      const eventLabel = event ? `${event.categories?.name || "Evento"} ${event.country}` : "un evento";
                      
                      toast.info(`¡Dato actualizado!`, {
                        description: `${newReg.email} cambió su ${field.label} de "${oldSnap[field.key] || 'vacío'}" a "${newSnap[field.key]}" en ${eventLabel}.`,
                        duration: 8000
                      });
                    }
                  });
                }
              });
            }
          }

          // Detect survey completion (Robust check using local ref)
          if (payload.eventType === 'UPDATE' && payload.new.survey_data) {
            const existingReg = registrationsRef.current.find((r: any) => r.id === payload.new.id);
            const wasIncomplete = !existingReg?.survey_data;
            const isNowComplete = !!payload.new.survey_data;

            if (wasIncomplete && isNowComplete) {
              toast.success(`¡Formulario completado!`, {
                description: `${payload.new.email} ha contestado el formulario general.`,
                duration: 5000
              });
            }
          }

          fetchData(); // Sync list and stats
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          fetchData(); // Sync tours list
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
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

  const handleManualRefresh = async () => {
    setIsTagsLoading(true);
    try {
      await clearEventsCache();
      toast.success("¡Web principal actualizada con éxito!");
    } catch (err) {
      toast.error("Error al refrescar el caché");
    } finally {
      setIsTagsLoading(false);
    }
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
      await clearEventsCache();
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
      price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true
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
      await clearEventsCache();
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
      await clearEventsCache();
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
        ...(prev?.event_statuses || {}),
        [eventId]: status
      }
    }));
  };

  const updateRegEventData = (eventId: string, field: string, value: string) => {
    setEditingReg((prev: any) => {
      const currentEventData = { ...(prev?.event_data || {}) };
      const eventSnapshot = { ...(currentEventData[eventId] || {}) };

      eventSnapshot[field] = value;
      currentEventData[eventId] = eventSnapshot;

      return {
        ...prev,
        event_data: currentEventData
      };
    });
  };
  const totalInscriptions = registrations.reduce((acc, r) => acc + (r.selected_events?.length || 0), 0);
  const pendingCount = registrations.reduce((acc, r) => {
    return acc + Object.values(r.event_statuses || {}).filter(s => s === 'pending').length;
  }, 0);
  const approvedCount = registrations.reduce((acc, r) => {
    return acc + Object.values(r.event_statuses || {}).filter(s => s === 'confirmed').length;
  }, 0);

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
              <Link href="/">
                <Image
                  src="/cdi-logo.png"
                  alt="Club de Inversionistas"
                  width={140}
                  height={40}
                  className="h-8 w-auto object-contain transition-opacity hover:opacity-80"
                />
              </Link>
              <h1 className="text-xl font-bold text-black border-l border-neutral-200 pl-4">Panel de Administración</h1>
            </div>
              <div className="flex items-center gap-3">
                <NotificationBell isAdmin={true} />
                <Tooltip>
                  <TooltipTrigger
                    render={
                      <Button
                        variant="outline"
                        onClick={handleManualRefresh}
                        disabled={isTagsLoading}
                        className="rounded-xl border-neutral-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all gap-2"
                      >
                        <RefreshCw className={cn("w-4 h-4", isTagsLoading && "animate-spin")} />
                        <span className="hidden md:inline">Refrescar Web</span>
                      </Button>
                    }
                  />
                  <TooltipContent>
                    Fuerza la actualización inmediata de los datos en la página principal.
                  </TooltipContent>
                </Tooltip>
                
                <Button variant="outline" onClick={handleLogout} className="rounded-xl border-neutral-200 hover:bg-neutral-50 hover:text-red-600 hover:border-red-200 transition-all gap-2">
                  <LogOut className="w-5 h-5 mr-2" /> Salir
                </Button>
              </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Card className="rounded-3xl border-none shadow-sm bg-white py-3 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Usuarios</p>
                  <h3 className="text-2xl font-black mt-0.5 text-blue-600">{registrations.length}</h3>
                </div>
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Users className="w-4 h-4" /></div>
              </div>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-white py-3 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Inscripciones</p>
                  <h3 className="text-2xl font-black mt-0.5 text-neutral-600">{totalInscriptions}</h3>
                </div>
                <div className="bg-neutral-50 p-2 rounded-xl text-neutral-400"><Ticket className="w-4 h-4" /></div>
              </div>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-white py-3 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Pendientes</p>
                  <h3 className="text-2xl font-black mt-0.5 text-amber-600">{pendingCount}</h3>
                </div>
                <div className="bg-amber-50 p-2 rounded-xl text-amber-600"><RefreshCw className="w-4 h-4" /></div>
              </div>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-white py-3 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Aprobadas</p>
                  <h3 className="text-2xl font-black mt-0.5 text-emerald-600">{approvedCount}</h3>
                </div>
                <div className="bg-emerald-50 p-2 rounded-xl text-emerald-600"><ClipboardCheck className="w-4 h-4" /></div>
              </div>
            </Card>

            <Card className="rounded-3xl border-none shadow-sm bg-white py-3 px-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Activos</p>
                  <h3 className="text-2xl font-black mt-0.5 text-indigo-600">{events.filter(e => e.active).length}</h3>
                </div>
                <div className="bg-indigo-50 p-2 rounded-xl text-indigo-600"><Calendar className="w-4 h-4" /></div>
              </div>
            </Card>
          </div>

          <Tabs defaultValue="events" className="space-y-6">
            <TabsList className="bg-white p-1 rounded-2xl border border-neutral-200 h-auto">
              <TabsTrigger value="events" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white font-bold transition-all cursor-pointer">Eventos</TabsTrigger>
              <TabsTrigger value="registrations" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-700 data-[state=active]:text-white font-bold transition-all cursor-pointer">Gestión de Usuarios</TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Gestión de Eventos</h2>
                  <p className="text-sm text-neutral-500">Administra el calendario y los detalles de cada evento.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Tooltip>
                      <TooltipTrigger render={
                        <div className="relative">
                          <Input 
                            placeholder="Buscar evento, ciudad..." 
                            value={eventsSearch}
                            onChange={(e) => setEventsSearch(e.target.value)}
                            className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, PLACEHOLDER_STYLE, "pl-10 w-full")}
                          />
                          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", FILTER_ICON_CLASSES)} />
                        </div>
                      } />
                      <TooltipContent side="bottom" className="p-4 rounded-2xl shadow-2xl bg-white border border-neutral-200 max-w-xs z-[100]">
                        <div className="space-y-1">
                          <p className="font-black text-blue-700 text-sm">Búsqueda Inteligente</p>
                          <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                            Puedes buscar por <span className="text-blue-600">título</span>, 
                            <span className="text-blue-600"> ciudad</span> o <span className="text-blue-600">país</span>.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  <Popover open={eventStatusPickerOpen} onOpenChange={setEventStatusPickerOpen}>
                    <PopoverTrigger render={
                      <Button variant="outline" className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, "w-40 justify-between px-4")}>
                        <span className="truncate">
                          {eventsStatusFilter === 'all' ? 'Todos los Estados' : 
                           eventsStatusFilter === 'active' ? 'Activos' : 'Inactivos'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    } />
                    <PopoverContent className="w-44 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden picker-anim" align="start">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => { setEventsStatusFilter("all"); setEventStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", eventsStatusFilter === "all" ? "opacity-100" : "opacity-0")} />
                              Todos los Estados
                            </CommandItem>
                            <CommandItem
                              value="active"
                              onSelect={() => { setEventsStatusFilter("active"); setEventStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", eventsStatusFilter === "active" ? "opacity-100" : "opacity-0")} />
                              Activos
                            </CommandItem>
                            <CommandItem
                              value="inactive"
                              onSelect={() => { setEventsStatusFilter("inactive"); setEventStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", eventsStatusFilter === "inactive" ? "opacity-100" : "opacity-0")} />
                              Inactivos
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Popover open={eventTabCatPickerOpen} onOpenChange={setEventTabCatPickerOpen}>
                    <PopoverTrigger render={
                      <Button variant="outline" className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, "w-44 justify-between px-4")}>
                        <span className="truncate">
                          {eventsCategoryFilter === 'all' ? 'Categorías' : categories.find(c => c.id.toString() === eventsCategoryFilter)?.name}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    } />
                    <PopoverContent className="w-56 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden picker-anim" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar categoría..." className="h-10 border-none focus:ring-0 text-xs" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-[10px] text-neutral-400 text-center">No hay resultados.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => { setEventsCategoryFilter("all"); setEventTabCatPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", eventsCategoryFilter === "all" ? "opacity-100" : "opacity-0")} />
                              Todas las Categorías
                            </CommandItem>
                            {categories.map((cat) => (
                              <CommandItem
                                key={cat.id}
                                value={cat.name}
                                onSelect={() => { setEventsCategoryFilter(cat.id.toString()); setEventTabCatPickerOpen(false); }}
                                className="cursor-pointer py-2 text-xs"
                              >
                                <Check className={cn("mr-2 h-3 w-3", eventsCategoryFilter === cat.id.toString() ? "opacity-100" : "opacity-0")} />
                                {cat.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <Button
                      onClick={handleNewEvent}
                      className="bg-[#3154DC] hover:bg-[#2845c4] text-white rounded-xl px-6 h-11 font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer border-none"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" />
                      <span className="hidden sm:inline">Crear Nuevo Evento</span>
                    </Button>
                    <DialogContent className="max-w-2xl rounded-[40px] p-0 overflow-hidden bg-white no-scrollbar border-none shadow-2xl">
                    <div className="p-10 max-h-[85vh] overflow-y-auto no-scrollbar dialog-content-anim">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900">{(newEvent as any).id ? "Editar Evento" : "Nuevo Evento"}</DialogTitle>
                        <DialogDescription>Completa todos los detalles para publicar el evento en el calendario.</DialogDescription>
                      </DialogHeader>

                      <form onSubmit={handleCreateEvent} className="grid grid-cols-2 gap-6 mt-8">
                        {/* Fila 1: Título */}
                        <div className="col-span-2 space-y-2">
                          <Label className="font-bold text-gray-700">Título del Evento</Label>
                          <Input required value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200 focus:bg-white transition-all" placeholder="Ej: Meetup: Lima" />
                        </div>

                        {/* Fila 2: Fecha y Hora */}
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Fecha</Label>
                          <Input type="date" required value={newEvent.start_date} onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Hora</Label>
                          <Input
                            type={newEvent.time === "Por confirmar" ? "text" : "time"}
                            required={newEvent.time !== "Por confirmar"}
                            value={newEvent.time}
                            onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                            className={cn(
                              "rounded-xl h-12 transition-all",
                              newEvent.time === "Por confirmar" ? "bg-neutral-100 text-neutral-400 opacity-50 border-dashed" : "bg-neutral-50/50 border-neutral-200"
                            )}
                            disabled={newEvent.time === "Por confirmar"}
                          />
                          <div className="flex items-center justify-end gap-2 px-1">
                            <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">¿Hora por confirmar?</span>
                            <Switch
                              checked={newEvent.time === "Por confirmar"}
                              onCheckedChange={(val) => setNewEvent({ ...newEvent, time: val ? "Por confirmar" : "19:00" })}
                              className="scale-[0.7] data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        </div>

                        {/* Fila 3: Ciudad y País */}
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Ciudad</Label>
                          <Input required value={newEvent.city} onChange={(e) => setNewEvent({ ...newEvent, city: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" placeholder="Lima" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">País</Label>
                          <Input required value={newEvent.country} onChange={(e) => setNewEvent({ ...newEvent, country: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" placeholder="Perú" />
                        </div>

                        {/* Fila 4: Ubicación y Duración */}
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Ubicación</Label>
                          <Input required value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" placeholder="Hotel Estelar" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Duración</Label>
                          <Input required value={newEvent.duration} onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" placeholder="2 horas" />
                        </div>

                        {/* Fila 5: Precio y Capacidad */}
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Precio</Label>
                          <Input required value={newEvent.price} onChange={(e) => setNewEvent({ ...newEvent, price: e.target.value })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" placeholder="30 USD" />
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Capacidad</Label>
                          <Input type="number" required value={newEvent.capacity} onChange={(e) => setNewEvent({ ...newEvent, capacity: parseInt(e.target.value) || 0 })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200" />
                        </div>

                        {/* Fila 6: Bandera y Color */}
                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Bandera (ISO)</Label>
                          <div className="flex gap-2">
                            <div className="size-12 rounded-xl bg-neutral-100 flex items-center justify-center border border-neutral-200 overflow-hidden shrink-0 p-2">
                              {(() => {
                                const FlagComp = newEvent.flag && (Flags as any)[newEvent.flag.toUpperCase()] ? (Flags as any)[newEvent.flag.toUpperCase()] : null;
                                return FlagComp ? <FlagComp className="w-full h-full object-contain" /> : <span className="text-xl">📍</span>;
                              })()}
                            </div>
                            <Input required value={newEvent.flag} onChange={(e) => setNewEvent({ ...newEvent, flag: e.target.value.toUpperCase() })} className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200 flex-1" placeholder="PE" />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label className="font-bold text-gray-700">Color de Fondo</Label>
                          <Select value={newEvent.bg_class} onValueChange={(val: string | null) => setNewEvent({ ...newEvent, bg_class: val || "" })}>
                            <SelectTrigger className="rounded-xl h-12 bg-neutral-50/50 border-neutral-200">
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

                        {/* Fila 7: Keap Tags (Two Columns) */}
                        <div className="col-span-2 grid grid-cols-2 gap-4 pt-2">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="font-bold text-gray-700">Tag: Pendiente</Label>
                              <Tooltip>
                                <TooltipTrigger render={<Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-blue-600 hover:bg-blue-50" onClick={fetchTags} disabled={isTagsLoading}><RefreshCw className={cn("h-3 w-3", isTagsLoading && "animate-spin")} /></Button>} />
                                <TooltipContent>Sincronizar tags</TooltipContent>
                              </Tooltip>
                            </div>
                            <Popover open={pendingTagPopoverOpen} onOpenChange={setPendingTagPopoverOpen}>
                              <PopoverTrigger render={<Button variant="outline" className="w-full justify-between rounded-xl h-12 font-normal bg-neutral-50/50 border-neutral-200 text-xs">{newEvent.keap_pending_tag_id ? keapTags.find(t => t.id === newEvent.keap_pending_tag_id)?.name : "Seleccionar..."}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button>} />
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-2xl border-neutral-200">
                                <Command className="rounded-xl">
                                  <CommandInput placeholder="Buscar tag..." className="h-11" />
                                  <CommandList className="max-h-[250px]">
                                    <CommandEmpty>No hay tags.</CommandEmpty>
                                    <CommandGroup>{keapTags.map(tag => (<CommandItem key={tag.id} onSelect={() => { setNewEvent({ ...newEvent, keap_pending_tag_id: tag.id }); setPendingTagPopoverOpen(false); }} className="cursor-pointer">{tag.name}</CommandItem>))}</CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label className="font-bold text-gray-700">Tag: Confirmado</Label>
                            </div>
                            <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                              <PopoverTrigger render={<Button variant="outline" className="w-full justify-between rounded-xl h-12 font-normal bg-neutral-50/50 border-neutral-200 text-xs">{newEvent.keap_tag_id ? keapTags.find(t => t.id === newEvent.keap_tag_id)?.name : "Seleccionar..."}<ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" /></Button>} />
                              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 rounded-xl shadow-2xl border-neutral-200">
                                <Command className="rounded-xl">
                                  <CommandInput placeholder="Buscar tag..." className="h-11" />
                                  <CommandList className="max-h-[250px]">
                                    <CommandEmpty>No hay tags.</CommandEmpty>
                                    <CommandGroup>{keapTags.map(tag => (<CommandItem key={tag.id} onSelect={() => { setNewEvent({ ...newEvent, keap_tag_id: tag.id }); setTagPopoverOpen(false); }} className="cursor-pointer">{tag.name}</CommandItem>))}</CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="col-span-2 flex items-center justify-between p-6 bg-blue-50/50 rounded-[28px] border border-blue-100/50 transition-all">
                          <div className="space-y-1">
                            <Label className="font-bold text-blue-900 text-base">¿Evento Activo?</Label>
                            <p className="text-xs text-blue-700/70">Si está apagado, el evento no aparecerá en la web principal.</p>
                          </div>
                          <Switch
                            checked={!!newEvent.active}
                            onCheckedChange={(val) => setNewEvent({ ...newEvent, active: val })}
                            className="data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-neutral-200"
                          />
                        </div>

                        <div className="col-span-2 pt-8 mt-4 border-t border-neutral-100 flex flex-col gap-3">
                          <Button
                            type="submit"
                            className="w-full bg-[#3154DC] hover:bg-[#2845c4] h-14 rounded-2xl font-bold text-white shadow-xl shadow-[#3154DC]/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer order-1"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <Check className="w-5 h-5 stroke-[3]" />
                            )}
                            {(newEvent as any).id ? "Actualizar Datos del Evento" : "Publicar Nuevo Evento"}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDialogOpen(false)}
                            className="w-full rounded-2xl h-14 font-bold text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-all cursor-pointer order-2"
                          >
                            Cancelar y Volver
                          </Button>
                        </div>
                      </form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

              <Card className="rounded-[32px] border-none shadow-sm overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-neutral-50">
                    <TableRow>
                      <TableHead className="font-bold py-5 px-6">Evento</TableHead>
                      <TableHead className="font-bold">Fecha</TableHead>
                      <TableHead className="font-bold text-center">Inscritos</TableHead>
                      <TableHead className="font-bold text-center">Activo</TableHead>
                      <TableHead className="text-right font-bold pr-6">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? [1, 2, 3].map(i => <TableRow key={i}><TableCell colSpan={5} className="p-6"><Skeleton className="h-16 w-full rounded-2xl" /></TableCell></TableRow>) :
                      events
                      .filter(e => {
                        const matchesSearch = e.title.toLowerCase().includes(eventsSearch.toLowerCase()) || 
                                           e.city.toLowerCase().includes(eventsSearch.toLowerCase()) ||
                                           e.country.toLowerCase().includes(eventsSearch.toLowerCase());
                        const matchesStatus = eventsStatusFilter === 'all' ? true :
                                           eventsStatusFilter === 'active' ? e.active : !e.active;
                        const matchesCategory = eventsCategoryFilter === 'all' ? true :
                                             e.category_id?.toString() === eventsCategoryFilter;
                        return matchesSearch && matchesStatus && matchesCategory;
                      })
                      .length > 0 ? events
                      .filter(e => {
                        const matchesSearch = e.title.toLowerCase().includes(eventsSearch.toLowerCase()) || 
                                           e.city.toLowerCase().includes(eventsSearch.toLowerCase()) ||
                                           e.country.toLowerCase().includes(eventsSearch.toLowerCase());
                        const matchesStatus = eventsStatusFilter === 'all' ? true :
                                           eventsStatusFilter === 'active' ? e.active : !e.active;
                        const matchesCategory = eventsCategoryFilter === 'all' ? true :
                                             e.category_id?.toString() === eventsCategoryFilter;
                        return matchesSearch && matchesStatus && matchesCategory;
                      })
                      .map((event) => {
                        const regCount = registrations.filter(r =>
                          r.selected_events?.includes(event.id) &&
                          (r.event_statuses?.[event.id] === 'confirmed')
                        ).length;
                        return (
                          <TableRow key={event.id} className="hover:bg-neutral-50/50 transition-colors group table-row-anim">
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
                      }) : <TableRow><TableCell colSpan={5} className="h-40 text-center text-neutral-400">No se encontraron eventos con esos filtros.</TableCell></TableRow>
                    }
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="registrations" className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Gestión de Usuarios</h2>
                  <p className="text-sm text-neutral-500">Administra todos los registrados en los eventos.</p>
                </div>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 min-w-[200px]">
                    <Tooltip>
                      <TooltipTrigger render={
                        <div className="relative">
                          <Input 
                            placeholder="Buscar por nombre, email o teléfono..." 
                            value={regsSearch}
                            onChange={(e) => setRegsSearch(e.target.value)}
                            className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, PLACEHOLDER_STYLE, "pl-10 w-full")}
                          />
                          <Search className={cn("absolute left-3 top-1/2 -translate-y-1/2", FILTER_ICON_CLASSES)} />
                        </div>
                      } />
                      <TooltipContent side="bottom" className="p-4 rounded-2xl shadow-2xl bg-white border border-neutral-200 max-w-xs z-[100]">
                        <div className="space-y-1">
                          <p className="font-black text-blue-700 text-sm">Búsqueda de Usuarios</p>
                          <p className="text-[11px] text-neutral-600 leading-relaxed font-medium">
                            Filtra por <span className="text-blue-600">nombre</span>, 
                            <span className="text-blue-600"> email</span> o 
                            <span className="text-blue-600"> teléfono</span>.
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  <Popover open={catPickerOpen} onOpenChange={setCatPickerOpen}>
                    <PopoverTrigger render={
                      <Button variant="outline" className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, "w-44 justify-between px-4")}>
                        <span className="truncate">
                          {regsCategoryFilter === 'all' ? 'Categorías' : categories.find(c => c.id.toString() === regsCategoryFilter)?.name}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    } />
                    <PopoverContent className="w-56 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden picker-anim" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar categoría..." className="h-10 border-none focus:ring-0 text-xs" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-[10px] text-neutral-400 text-center">No hay resultados.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => { setRegsCategoryFilter("all"); setCatPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", regsCategoryFilter === "all" ? "opacity-100" : "opacity-0")} />
                              Todas las Categorías
                            </CommandItem>
                            {categories.map((cat) => (
                              <CommandItem
                                key={cat.id}
                                value={cat.name}
                                onSelect={() => { setRegsCategoryFilter(cat.id.toString()); setCatPickerOpen(false); }}
                                className="cursor-pointer py-2 text-xs"
                              >
                                <Check className={cn("mr-2 h-3 w-3", regsCategoryFilter === cat.id.toString() ? "opacity-100" : "opacity-0")} />
                                {cat.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  
                  <Popover open={eventPickerOpen} onOpenChange={setEventPickerOpen}>
                    <PopoverTrigger render={
                      <Button variant="outline" className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, "min-w-[220px] justify-between px-4")}>
                        <span className="truncate">
                          {regsEventFilter === 'all' ? 'Todos los Eventos' : 
                            events.find(e => e.id.toString() === regsEventFilter) ? 
                            `${events.find(e => e.id.toString() === regsEventFilter).city} - ${events.find(e => e.id.toString() === regsEventFilter).categories?.name}` : 
                            'Evento no encontrado'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    } />
                    <PopoverContent className="w-64 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden picker-anim" align="start">
                      <Command>
                        <CommandInput placeholder="Buscar evento por ciudad..." className="h-10 border-none focus:ring-0 text-xs" />
                        <CommandList>
                          <CommandEmpty className="p-4 text-[10px] text-neutral-400 text-center">No hay resultados.</CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => { setRegsEventFilter("all"); setEventPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", regsEventFilter === "all" ? "opacity-100" : "opacity-0")} />
                              Todos los Eventos
                            </CommandItem>
                            {events.map((e) => (
                              <CommandItem
                                key={e.id}
                                value={`${e.city} ${e.categories?.name}`}
                                onSelect={() => { setRegsEventFilter(e.id.toString()); setEventPickerOpen(false); }}
                                className="cursor-pointer py-2 text-xs"
                              >
                                <Check className={cn("mr-2 h-3 w-3", regsEventFilter === e.id.toString() ? "opacity-100" : "opacity-0")} />
                                {e.city} - {e.categories?.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <Popover open={regStatusPickerOpen} onOpenChange={setRegStatusPickerOpen}>
                    <PopoverTrigger render={
                      <Button variant="outline" className={cn(FILTER_BASE_CLASSES, FILTER_TEXT_CLASSES, "w-40 justify-between px-4")}>
                        <span className="truncate">
                          {regsStatusFilter === 'all' ? 'Estados' : 
                           regsStatusFilter === 'pending' ? 'Pendientes' : 
                           regsStatusFilter === 'confirmed' ? 'Confirmados' : 'Cancelados'}
                        </span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50 shrink-0" />
                      </Button>
                    } />
                    <PopoverContent className="w-44 p-0 rounded-2xl shadow-2xl border-neutral-100 overflow-hidden picker-anim" align="start">
                      <Command>
                        <CommandList>
                          <CommandGroup>
                            <CommandItem
                              value="all"
                              onSelect={() => { setRegsStatusFilter("all"); setRegStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", regsStatusFilter === "all" ? "opacity-100" : "opacity-0")} />
                              Todos los Estados
                            </CommandItem>
                            <CommandItem
                              value="pending"
                              onSelect={() => { setRegsStatusFilter("pending"); setRegStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", regsStatusFilter === "pending" ? "opacity-100" : "opacity-0")} />
                              Pendientes
                            </CommandItem>
                            <CommandItem
                              value="confirmed"
                              onSelect={() => { setRegsStatusFilter("confirmed"); setRegStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", regsStatusFilter === "confirmed" ? "opacity-100" : "opacity-0")} />
                              Confirmados
                            </CommandItem>
                            <CommandItem
                              value="cancelled"
                              onSelect={() => { setRegsStatusFilter("cancelled"); setRegStatusPickerOpen(false); }}
                              className="cursor-pointer py-2 text-xs"
                            >
                              <Check className={cn("mr-2 h-3 w-3", regsStatusFilter === "cancelled" ? "opacity-100" : "opacity-0")} />
                              Cancelados
                            </CommandItem>
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
                <Dialog open={isRegDialogOpen} onOpenChange={setIsRegDialogOpen}>
                  <DialogContent className="max-w-[1100px] w-[95vw] p-0 overflow-hidden border-none rounded-[48px] shadow-2xl">
                    <div className="p-10 max-h-[85vh] overflow-y-auto no-scrollbar reg-dialog-anim">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-gray-900">Editar Inscripción</DialogTitle>
                        <DialogDescription>Modifica los datos del usuario o gestiona sus eventos seleccionados.</DialogDescription>
                      </DialogHeader>

                      {editingReg && (
                        <form onSubmit={handleUpdateReg} className="grid grid-cols-2 gap-6 mt-8">
                          <div className="space-y-2">
                            <Label className="font-bold">Nombre</Label>
                            <Input required value={editingReg.first_name} onChange={(e) => setEditingReg({ ...editingReg, first_name: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Apellido</Label>
                            <Input required value={editingReg.last_name} onChange={(e) => setEditingReg({ ...editingReg, last_name: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label className="font-bold">Email</Label>
                            <Input type="email" required value={editingReg.email} onChange={(e) => setEditingReg({ ...editingReg, email: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Cód. País</Label>
                            <Input required value={editingReg.phone_code} onChange={(e) => setEditingReg({ ...editingReg, phone_code: e.target.value })} className="rounded-xl h-12" placeholder="52" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">Teléfono</Label>
                            <Input required value={editingReg.phone} onChange={(e) => setEditingReg({ ...editingReg, phone: e.target.value })} className="rounded-xl h-12" />
                          </div>
                          <div className="space-y-2">
                            <Label className="font-bold">País de Residencia</Label>
                            <Input value={editingReg.residence_country || ""} onChange={(e) => setEditingReg({ ...editingReg, residence_country: e.target.value })} className="rounded-xl h-12" />
                          </div>

                          <div className="col-span-2 space-y-4">
                            <Label className="font-bold">Eventos y Estados</Label>
                            <div className="space-y-3">
                              {events.map((ev) => {
                                const isSelected = editingReg.selected_events?.includes(ev.id);
                                const currentStatus = editingReg.event_statuses?.[ev.id] || 'pending';

                                return (
                                  <div key={ev.id} className={cn(
                                    "flex flex-col p-4 rounded-2xl border transition-all gap-3",
                                    isSelected ? "bg-white border-blue-200 shadow-sm" : "bg-neutral-50 border-neutral-100 opacity-60"
                                  )}>
                                    <div className="flex items-center justify-between w-full">
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
                                        <div className="flex-1 max-w-[160px]">
                                          <Select
                                            value={currentStatus}
                                            onValueChange={(val: string | null) => updateRegEventStatus(ev.id, val || 'pending')}
                                          >
                                            <SelectTrigger className="w-full h-10 rounded-xl text-xs font-bold bg-white border-neutral-200 hover:border-blue-400 transition-all cursor-pointer flex items-center justify-center relative px-8">
                                              <SelectValue>
                                                {currentStatus === 'confirmed' ? 'Confirmado' :
                                                  currentStatus === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                              </SelectValue>
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl z-[9999]">
                                              <SelectItem value="pending" className="text-amber-600 font-bold">Pendiente</SelectItem>
                                              <SelectItem value="confirmed" className="text-green-600 font-bold">Confirmado</SelectItem>
                                              <SelectItem value="cancelled" className="text-red-600 font-bold">Cancelado</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      )}
                                    </div>

                                    {/* Event Data Snapshot Info (Editable) */}
                                    {isSelected && editingReg.event_data?.[ev.id] && (
                                      <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-[11px] space-y-2">
                                        <div className="font-bold text-neutral-400 uppercase mb-1">Datos capturados en registro:</div>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                          <div className="space-y-1">
                                            <span className="text-neutral-400">País:</span>
                                            <Input
                                              value={editingReg.event_data[ev.id].residence_country || ""}
                                              onChange={(e) => updateRegEventData(ev.id, 'residence_country', e.target.value)}
                                              className="h-7 text-[10px] bg-white rounded-lg border-neutral-200"
                                            />
                                          </div>
                                          <div className="space-y-1">
                                            <span className="text-neutral-400">Tel:</span>
                                            <div className="flex gap-1">
                                              <Input
                                                value={editingReg.event_data[ev.id].phone_code || ""}
                                                onChange={(e) => updateRegEventData(ev.id, 'phone_code', e.target.value)}
                                                className="h-7 w-12 text-[10px] bg-white rounded-lg border-neutral-200 px-1 text-center"
                                              />
                                              <Input
                                                value={editingReg.event_data[ev.id].phone || ""}
                                                onChange={(e) => updateRegEventData(ev.id, 'phone', e.target.value)}
                                                className="h-7 flex-1 text-[10px] bg-white rounded-lg border-neutral-200"
                                              />
                                            </div>
                                          </div>
                                          <div className="col-span-2 space-y-1">
                                            <span className="text-neutral-400">Nombre:</span>
                                            <div className="flex gap-2">
                                              <Input
                                                value={editingReg.event_data[ev.id].first_name || ""}
                                                onChange={(e) => updateRegEventData(ev.id, 'first_name', e.target.value)}
                                                className="h-7 flex-1 text-[10px] bg-white rounded-lg border-neutral-200"
                                              />
                                              <Input
                                                value={editingReg.event_data[ev.id].last_name || ""}
                                                onChange={(e) => updateRegEventData(ev.id, 'last_name', e.target.value)}
                                                className="h-7 flex-1 text-[10px] bg-white rounded-lg border-neutral-200"
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

                          {/* Survey Data Section */}
                          <div className="col-span-2 space-y-4 pt-6 border-t border-neutral-100">
                            <div className="flex items-center justify-between">
                              <Label className="font-bold flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                                Formulario General
                              </Label>
                              {editingReg.survey_data ? (
                                <Badge className="bg-green-50 text-green-700 border-green-100">Completado</Badge>
                              ) : (
                                <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Pendiente</Badge>
                              )}
                            </div>

                            {editingReg.survey_data ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 p-6 rounded-[24px] border border-neutral-100">
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Relación con el Club</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {editingReg.survey_data.relationship === 'nuevo' && 'Es mi primera vez con Hyenuk / El Club (Soy nuevo).'}
                                    {editingReg.survey_data.relationship === 'seguidor' && 'Sigo el contenido pero aún no soy alumno.'}
                                    {editingReg.survey_data.relationship === 'alumno' && 'Ya soy (o he sido) alumno de un taller o membresía.'}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Tema de Interés</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {editingReg.survey_data.topic === 'crecimiento' && 'Crecimiento personal: Mentalidad y hábitos para el éxito.'}
                                    {editingReg.survey_data.topic === 'inversiones' && 'Inversiones: Cómo poner a trabajar mi dinero a largo plazo.'}
                                    {editingReg.survey_data.topic === 'finanzas' && 'Finanzas: Cómo organizar mis cuentas y salir de deudas.'}
                                    {editingReg.survey_data.topic === 'trading' && 'Trading: Cómo entender los mercados.'}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Nivel de Experiencia</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {editingReg.survey_data.experience === 'nivel0' && 'Nivel 0: Solo tengo curiosidad, no he empezado.'}
                                    {editingReg.survey_data.experience === 'nivel1' && 'Nivel 1: He estudiado pero aún no he puesto mi capital en marcha.'}
                                    {editingReg.survey_data.experience === 'nivel2' && 'Nivel 2: Ya invierto de forma activa por mi cuenta.'}
                                  </div>
                                </div>
                                <div className="space-y-1">
                                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Punto de Dolor</div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {editingReg.survey_data.hurdle === 'dinero' && 'No tengo suficiente dinero para empezar'}
                                    {editingReg.survey_data.hurdle === 'guia' && 'No sé por dónde empezar'}
                                    {editingReg.survey_data.hurdle === 'miedo' && 'Me da miedo perder dinero'}
                                    {editingReg.survey_data.hurdle === 'constancia' && 'Me cuesta ser constante'}
                                    {editingReg.survey_data.hurdle === 'tiempo' && 'Tiempo'}
                                  </div>
                                </div>
                                <div className="col-span-2 space-y-1 pt-2 border-t border-neutral-200">
                                  <div className="text-[10px] font-bold text-neutral-400 uppercase">Pregunta para Hyenuk</div>
                                  <div className="text-sm italic text-gray-700 bg-white p-3 rounded-xl border border-neutral-100">
                                    "{editingReg.survey_data.question}"
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-amber-50/50 p-6 rounded-[24px] border border-dashed border-amber-200 text-center">
                                <p className="text-sm text-amber-700 font-medium italic">
                                  El usuario aún no ha respondido el formulario general.
                                </p>
                              </div>
                            )}
                          </div>

                          <div className="col-span-2 pt-8 mt-6 border-t border-neutral-100 flex flex-col gap-3">
                            <Button
                              type="submit"
                              className="w-full bg-[#3154DC] hover:bg-[#2845c4] h-14 rounded-2xl font-bold text-white shadow-xl shadow-[#3154DC]/20 transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer order-1"
                              disabled={isSubmitting}
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                              ) : (
                                <Check className="w-5 h-5 stroke-[3]" />
                              )}
                              Guardar Cambios
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              onClick={() => setIsRegDialogOpen(false)}
                              className="w-full rounded-2xl h-14 font-bold text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-all cursor-pointer order-2"
                            >
                              Cancelar y Cerrar
                            </Button>
                          </div>
                        </form>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

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
                    {registrations
                      .filter(reg => {
                        // 1. Search filter
                        const searchLower = regsSearch.toLowerCase();
                        const matchesSearch = 
                          (reg.first_name + " " + reg.last_name).toLowerCase().includes(searchLower) ||
                          reg.email.toLowerCase().includes(searchLower) ||
                          reg.phone?.includes(searchLower);

                        // 2. Event filter
                        const matchesEvent = regsEventFilter === 'all' ? true : 
                                          reg.selected_events?.includes(regsEventFilter);

                        // 3. Status filter
                        const statuses = Object.values(reg.event_statuses || {});
                        const matchesStatus = regsStatusFilter === 'all' ? true :
                                           statuses.includes(regsStatusFilter);

                        // 4. Category filter
                        const matchesCategory = regsCategoryFilter === 'all' ? true :
                                             reg.selected_events?.some((eId: string) => {
                                               const ev = events.find(e => e.id === eId);
                                               return ev?.category_id?.toString() === regsCategoryFilter;
                                             });

                        return matchesSearch && matchesEvent && matchesStatus && matchesCategory;
                      })
                      .length > 0 ? registrations
                      .filter(reg => {
                        const searchLower = regsSearch.toLowerCase();
                        const matchesSearch = 
                          (reg.first_name + " " + reg.last_name).toLowerCase().includes(searchLower) ||
                          reg.email.toLowerCase().includes(searchLower) ||
                          reg.phone?.includes(searchLower);
                        const matchesEvent = regsEventFilter === 'all' ? true : 
                                          reg.selected_events?.includes(regsEventFilter);
                        const statuses = Object.values(reg.event_statuses || {});
                        const matchesStatus = regsStatusFilter === 'all' ? true :
                                           statuses.includes(regsStatusFilter);
                        const matchesCategory = regsCategoryFilter === 'all' ? true :
                                             reg.selected_events?.some((eId: string) => {
                                               const ev = events.find(e => e.id === eId);
                                               return ev?.category_id?.toString() === regsCategoryFilter;
                                             });
                        return matchesSearch && matchesEvent && matchesStatus && matchesCategory;
                      })
                      .map((reg) => (
                      <TableRow key={reg.id} className="hover:bg-neutral-50/50 transition-colors table-row-anim">
                        <TableCell className="py-5 px-6 font-bold">{reg.first_name} {reg.last_name}</TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-gray-900">{reg.email}</div>
                          <div className="text-xs text-neutral-500">{reg.phone_code} {reg.phone}</div>
                          {reg.residence_country && (
                            <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" /> {reg.residence_country}
                            </div>
                          )}
                          {reg.survey_data ? (
                            <Badge variant="outline" className="mt-2 text-[9px] bg-blue-50 text-blue-700 border-blue-100 uppercase font-black px-1.5 h-5">
                              Formulario Recibido
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="mt-2 text-[9px] bg-neutral-50 text-neutral-400 border-neutral-100 uppercase font-black px-1.5 h-5">
                              Sin Encuesta
                            </Badge>
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
                                      {ev?.city || 'Evento'}
                                      {reg.event_data?.[eId] && <Info className="w-2.5 h-2.5 ml-1 opacity-50" />}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent className="max-w-xs p-3">
                                    <div className="space-y-1">
                                      <p className="font-bold uppercase text-[10px] border-b pb-1 mb-1">
                                        {status === 'confirmed' ? 'Confirmado' : status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                                      </p>
                                      {reg.event_data?.[eId] ? (
                                        <div className="text-[10px] space-y-0.5">
                                          <p><span className="opacity-50">País:</span> {reg.event_data[eId].residence_country || "N/A"}</p>
                                          <p><span className="opacity-50">Tel:</span> {reg.event_data[eId].phone_code} {reg.event_data[eId].phone}</p>
                                          <p><span className="opacity-50">Nombre:</span> {reg.event_data[eId].first_name} {reg.event_data[eId].last_name}</p>
                                        </div>
                                      ) : (
                                        <p className="text-[10px] italic opacity-50 text-center">Usando datos generales</p>
                                      )}
                                    </div>
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
                              <TooltipTrigger render={<Button variant="ghost" size="icon" onClick={() => window.open(`https://wa.me/${(reg.phone_code + reg.phone).replace(/\D/g, '')}`)} className="text-green-600 hover:bg-green-50 rounded-xl"><MessageCircle className="w-4 h-4" /></Button>} />
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

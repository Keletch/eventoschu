import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getKeapTags } from "@/app/actions/keap";
import { updateRegistration } from "@/app/actions/admin-registration";
import { useNotifications } from "./use-notifications";
import { useRealtimeSync } from "./use-realtime-sync";

export function useAdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keapTags, setKeapTags] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);

  // Notification Management
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    handleMarkAsRead, 
    handleMarkAllRead, 
    addNotificationLocally 
  } = useNotifications(true);

  // Filters State
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventTabCatFilter, setEventTabCatFilter] = useState("all");
  const [eventTabStatusFilter, setEventTabStatusFilter] = useState("all");

  const [regsSearch, setRegsSearch] = useState("");
  const [regsCategoryFilter, setRegsCategoryFilter] = useState("all");
  const [regsEventFilter, setRegsEventFilter] = useState("all");
  const [regsStatusFilter, setRegsStatusFilter] = useState("all");

  // Dialogs State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<any>(null);
  const [newEvent, setNewEvent] = useState<any>({
    title: "", city: "", country: "", category_id: "", start_date: "",
    time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
    price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true
  });

  const fetchData = useCallback(async () => {
    // Only show loading spinner on first load to keep realtime updates seamless
    if (events.length === 0) setIsLoading(true);
    
    try {
      const { data: eventsData } = await supabase
        .from("events")
        .select("*, categories(name)")
        .order("start_date", { ascending: true });
      
      const { data: regsData } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });

      const { data: catsData } = await supabase
        .from("categories")
        .select("*")
        .order("name");

      if (eventsData) setEvents(eventsData);
      if (regsData) setRegistrations(regsData);
      if (catsData) setCategories(catsData);
    } catch (error) {
      toast.error("Error al sincronizar datos");
    } finally {
      setIsLoading(false);
    }
  }, [events.length]);

  // Realtime Sync Engine
  useRealtimeSync({
    isAdmin: true,
    onNewNotification: addNotificationLocally,
    onDataChange: fetchData
  });

  const fetchTags = async () => {
    setIsTagsLoading(true);
    try {
      const result = await getKeapTags();
      if (result.success) setKeapTags(result.tags || []);
    } catch (error) {
      toast.error("Error al cargar tags de Keap");
    } finally {
      setIsTagsLoading(false);
    }
  };

  useEffect(() => {
    // Initial Data Fetch
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
  }, []);

  // Handlers
  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (newEvent.id) {
        const { error } = await supabase.from("events").update(newEvent).eq("id", newEvent.id);
        if (error) throw error;
        toast.success("Evento actualizado");
      } else {
        const { error } = await supabase.from("events").insert([newEvent]);
        if (error) throw error;
        toast.success("Evento creado");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este evento?")) return;
    try {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
      toast.success("Evento eliminado");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDuplicateEvent = (event: any) => {
    const { id, created_at, ...rest } = event;
    setNewEvent({ ...rest, title: `${rest.title} (Copia)`, active: false });
    setIsDialogOpen(true);
  };

  const toggleEventStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("events").update({ active: !currentStatus }).eq("id", id);
      if (error) throw error;
      toast.success(`Evento ${!currentStatus ? 'activado' : 'desactivado'}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleUpdateReg = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateRegistration(editingReg.id, editingReg);
      if (!result.success) throw new Error(result.error);
      toast.success("Registro actualizado");
      setIsRegDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReg = async (id: string) => {
    if (!confirm("¿Seguro que deseas eliminar este registro?")) return;
    try {
      const { error } = await supabase.from("registrations").delete().eq("id", id);
      if (error) throw error;
      toast.success("Registro eliminado");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleEditEvent = (event: any) => {
    setNewEvent(event);
    setIsDialogOpen(true);
  };

  const handleEditReg = (reg: any) => {
    setEditingReg(reg);
    setIsRegDialogOpen(true);
  };

  const handleNewEvent = () => {
    setNewEvent({
      title: "", city: "", country: "", category_id: "", start_date: "",
      time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
      price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true
    });
    setIsDialogOpen(true);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/admin/login");
      toast.success("Sesión cerrada correctamente");
    } catch (error: any) {
      toast.error("Error al cerrar sesión");
    }
  };

  // Derived State (Calculations)
  const totalInscriptions = registrations.reduce((acc, r) => acc + (r.selected_events?.length || 0), 0);
  const pendingCount = registrations.reduce((acc, r) => {
    return acc + Object.values(r.event_statuses || {}).filter(s => s === 'pending').length;
  }, 0);
  const approvedCount = registrations.reduce((acc, r) => {
    return acc + Object.values(r.event_statuses || {}).filter(s => s === 'confirmed').length;
  }, 0);

  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(eventsSearch.toLowerCase()) || 
                       e.city.toLowerCase().includes(eventsSearch.toLowerCase()) ||
                       e.country.toLowerCase().includes(eventsSearch.toLowerCase());
    const matchesStatus = eventTabStatusFilter === 'all' ? true :
                       eventTabStatusFilter === 'active' ? e.active : !e.active;
    const matchesCategory = eventTabCatFilter === 'all' ? true :
                         e.category_id?.toString() === eventTabCatFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const filteredRegs = registrations.filter(reg => {
    const searchLower = regsSearch.toLowerCase();
    const matchesSearch = 
      (reg.event_data && Object.values(reg.event_data as any).some((d: any) => 
        (d.first_name + " " + d.last_name).toLowerCase().includes(searchLower)
      )) ||
      reg.email.toLowerCase().includes(searchLower) ||
      reg.phone?.includes(searchLower);

    const matchesEvent = regsEventFilter === 'all' ? true : reg.selected_events?.includes(regsEventFilter);
    const statuses = Object.values(reg.event_statuses || {});
    const matchesStatus = regsStatusFilter === 'all' ? true : statuses.includes(regsStatusFilter);
    const matchesCategory = regsCategoryFilter === 'all' ? true :
                         reg.selected_events?.some((eId: string) => {
                           const ev = events.find(e => e.id === eId);
                           return ev?.category_id?.toString() === regsCategoryFilter;
                         });

    return matchesSearch && matchesEvent && matchesStatus && matchesCategory;
  });

  const formatSafeDate = (dateStr: any) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  return {
    events,
    registrations,
    categories,
    isLoading,
    isSubmitting,
    keapTags,
    isTagsLoading,
    eventsSearch,
    setEventsSearch,
    eventTabCatFilter,
    setEventTabCatFilter,
    eventTabStatusFilter,
    setEventTabStatusFilter,
    regsSearch,
    setRegsSearch,
    regsCategoryFilter,
    setRegsCategoryFilter,
    regsEventFilter,
    setRegsEventFilter,
    regsStatusFilter,
    setRegsStatusFilter,
    isDialogOpen,
    setIsDialogOpen,
    isRegDialogOpen,
    setIsRegDialogOpen,
    editingReg,
    setEditingReg,
    newEvent,
    setNewEvent,
    fetchTags,
    handleCreateEvent,
    handleDeleteEvent,
    handleDuplicateEvent,
    toggleEventStatus,
    handleUpdateReg,
    handleDeleteReg,
    handleEditEvent,
    handleEditReg,
    handleNewEvent,
    handleLogout,
    totalInscriptions,
    pendingCount,
    approvedCount,
    filteredEvents,
    filteredRegs,
    formatSafeDate,
    // Notification Exports
    notifications,
    unreadCount,
    handleMarkAsRead,
    handleMarkAllRead,
    isNotifOpen,
    setIsNotifOpen
  };
}

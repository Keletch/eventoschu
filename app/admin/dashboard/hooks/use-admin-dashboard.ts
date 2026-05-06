"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { getKeapTags } from "@/app/actions/keap";
import { updateRegistration, getRegistrations } from "@/app/actions/admin-registration";
import { clearEventsCache } from "@/app/actions/events";
import { syncMassTagsByEvent, migrateEventTags, purgeEvent, deleteRegistration } from "@/app/actions/admin-mass-ops";
import { notifyAdminEventStatusChanged, notifyAdminTagsMigrated } from "@/app/actions/admin-notifications";
import { useNotifications } from "./use-notifications";
import { useAdminRealtime } from "./use-realtime-sync";
import { useDashboardFilters } from "./use-dashboard-filters";
import { formatDateForInput } from "@/lib/date-utils";


export function useAdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCacheRefreshing, setIsCacheRefreshing] = useState(false);
  const [keapTags, setKeapTags] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);

  // Dialogs & UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<any>(null);
  const [purgingReg, setPurgingReg] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [togglingEvent, setTogglingEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState<any>({
    title: "", city: "", country: "", category_id: "", start_date: "",
    time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
    price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true,
    initial_status: "confirmed"
  });

  // Notification Management
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const { 
    notifications, 
    unreadCount, 
    handleMarkAsRead, 
    handleMarkAllRead, 
    handleDeleteNotification,
    addNotificationLocally 
  } = useNotifications(true);

  // Modular Filters Logic
  const filters = useDashboardFilters(events, registrations);

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (events.length === 0) setIsLoading(true);
    try {
      const [{ data: eventsData }, { data: catsData }, regsResult] = await Promise.all([
        supabase.from("events").select("*, categories:category_id(name)").order("start_date", { ascending: true }),
        supabase.from("categories").select("*").order("name"),
        getRegistrations()
      ]);

      if (eventsData) setEvents(eventsData);
      if (catsData) setCategories(catsData);
      if (regsResult.success && regsResult.data) {
        setRegistrations(regsResult.data);
      }
    } catch (error) {
      toast.error("Error al sincronizar datos");
    } finally {
      setIsLoading(false);
    }
  }, [events.length]);

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

  // Realtime Sync Engine (Arquitectura SOLID)
  useAdminRealtime({
    onRefresh: fetchData,
    onNewNotification: addNotificationLocally
  });

  useEffect(() => {
    if (editingReg && registrations.length > 0) {
      const updated = registrations.find(r => r.id === editingReg.id);
      if (updated) {
        // Solo actualizamos si realmente hay un cambio en eventos o estados para evitar loops
        if (JSON.stringify(updated.selected_events) !== JSON.stringify(editingReg.selected_events) ||
            JSON.stringify(updated.event_statuses) !== JSON.stringify(editingReg.event_statuses)) {
          setEditingReg(updated);
        }
      }
    }
  }, [registrations, editingReg?.id]);

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
  }, [fetchData, router]);

  // --- Handlers ---
  const handleClearCache = async () => {
    setIsCacheRefreshing(true);
    try {
      const result = await clearEventsCache();
      if (result.success) {
        toast.success("Caché de Redis limpiada. Web pública actualizada.");
      } else {
        throw new Error("No se pudo limpiar la caché");
      }
    } catch (error) {
      toast.error("Error al limpiar caché de Redis");
    } finally {
      setIsCacheRefreshing(false);
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const isUpdating = !!newEvent.id;
      let tagsChanged = false;
      let oldTags = { pending: "", confirmed: "" };

      // 1. Si es actualización, verificar si cambiaron los tags
      if (isUpdating) {
        const original = events.find(ev => ev.id === newEvent.id);
        if (original) {
          oldTags = { pending: original.keap_pending_tag_id, confirmed: original.keap_tag_id };
          if (original.keap_tag_id !== newEvent.keap_tag_id || original.keap_pending_tag_id !== newEvent.keap_pending_tag_id) {
            tagsChanged = true;
          }
        }
      }

      // 2. Limpiamos el objeto para que no lleve la relación "categories" virtual que da error
      const adminEmail = session?.user?.email || "un administrador";
      const { categories: _, ...eventToSave } = newEvent;
      const { error } = eventToSave.id 
        ? await supabase.from("events").update(eventToSave).eq("id", eventToSave.id)
        : await supabase.from("events").insert([eventToSave]);
      
      if (error) throw error;

      // 3. Si los tags cambiaron, migrar usuarios en Keap
      if (isUpdating && tagsChanged) {
        const migration = await migrateEventTags({
          eventId: eventToSave.id,
          oldTags,
          newTags: { pending: newEvent.keap_pending_tag_id, confirmed: newEvent.keap_tag_id },
          adminEmail: session?.user?.email || "Admin",
          eventTitle: eventToSave.title
        });

        if (migration.success && migration.count && migration.count > 0) {
          await notifyAdminTagsMigrated({
            adminEmail,
            eventTitle: eventToSave.title,
            count: migration.count,
            oldTags,
            newTags: { pending: newEvent.keap_pending_tag_id, confirmed: newEvent.keap_tag_id }
          });
          toast.success(`Sincronizados ${migration.count} usuarios en Keap`);
        }
      }

      await clearEventsCache(); // Invalida caché de Redis
      toast.success(eventToSave.id ? "Evento actualizado" : "Evento creado");
      setIsDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!togglingEvent) return;
    setIsSubmitting(true);
    try {
      const newStatus = !togglingEvent.active;
      const syncResult = await syncMassTagsByEvent(togglingEvent.id, newStatus ? 'activate' : 'deactivate');
      if (!syncResult.success) throw new Error(syncResult.error);

      const { error } = await supabase.from("events").update({ active: newStatus }).eq("id", togglingEvent.id);
      if (error) throw error;

      await clearEventsCache(); // Invalida caché de Redis

      const adminEmail = session?.user?.email || "Un administrador";
      await notifyAdminEventStatusChanged(adminEmail, togglingEvent, newStatus);

      toast.success(`Evento ${newStatus ? 'activado' : 'desactivado'} y tags sincronizados`);
      setIsToggleDialogOpen(false);
      setTogglingEvent(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = (event: any) => {
    setDeletingEvent(event);
    setIsDeleteEventDialogOpen(true);
  };

  const handleConfirmEventPurge = async () => {
    if (!deletingEvent) return;
    setIsSubmitting(true);
    try {
      const result = await purgeEvent(deletingEvent.id);
      if (!result.success) throw new Error(result.error);
      await clearEventsCache();
      toast.success("Evento y datos relacionados purgados");
      setIsDeleteEventDialogOpen(false);
      setDeletingEvent(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleEventStatus = (event: any) => {
    setTogglingEvent(event);
    setIsToggleDialogOpen(true);
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

  const handleDeleteReg = (reg: any) => {
    setPurgingReg(reg);
    setIsPurgeDialogOpen(true);
  };

  const handleConfirmPurge = async () => {
    if (!purgingReg) return;
    setIsSubmitting(true);
    try {
      const result = await deleteRegistration(purgingReg.id);
      if (!result.success) throw new Error(result.error);
      toast.success("Usuario purgado correctamente");
      setIsPurgeDialogOpen(false);
      setPurgingReg(null);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Derived Stats ---
  const totalInscriptions = registrations.reduce((acc, reg) => acc + (reg.selected_events?.length || 0), 0);
  const pendingCount = registrations.filter(r => Object.values(r.event_statuses || {}).includes('pending')).length;
  const approvedCount = registrations.filter(r => Object.values(r.event_statuses || {}).includes('confirmed')).length;

  return {
    // Data
    events, registrations, categories, isLoading, isSubmitting, isCacheRefreshing,
    keapTags, isTagsLoading, totalInscriptions, pendingCount, approvedCount,
    
    // Filters sub-hook
    ...filters,

    // Dialogs & UI State
    isDialogOpen, setIsDialogOpen, isRegDialogOpen, setIsRegDialogOpen,
    isPurgeDialogOpen, setIsPurgeDialogOpen, isDeleteEventDialogOpen, setIsDeleteEventDialogOpen,
    isToggleDialogOpen, setIsToggleDialogOpen, editingReg, setEditingReg, 
    purgingReg, setPurgingReg, deletingEvent, setDeletingEvent, togglingEvent,
    newEvent, setNewEvent, notifications, unreadCount, isNotifOpen, setIsNotifOpen,

    // Handlers
    fetchData, fetchTags, handleClearCache, handleCreateEvent, handleDeleteEvent, handleConfirmEventPurge,
    toggleEventStatus, handleConfirmToggleStatus, handleUpdateReg, handleDeleteReg, handleConfirmPurge,
    handleEditEvent: (event: any) => { 
      setNewEvent({
        ...event,
        start_date: formatDateForInput(event.start_date)
      }); 
      setIsDialogOpen(true); 
    },
    handleEditReg: (reg: any) => { setEditingReg(reg); setIsRegDialogOpen(true); },
    handleNewEvent: () => {
      setNewEvent({
        title: "", city: "", country: "", category_id: "", start_date: "",
        time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
        price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: "", flag: "PE", bg_class: "bg-sky-100", active: true,
        initial_status: "confirmed"
      });
      setIsDialogOpen(true);
    },
    handleDuplicateEvent: async (event: any) => {
      const { id, created_at, categories, ...rest } = event;
      setNewEvent({ 
        ...rest, 
        title: `${rest.title} (Copia)`, 
        active: false,
        start_date: formatDateForInput(rest.start_date)
      });
      setIsDialogOpen(true);
    },
    handleLogout: async () => { await supabase.auth.signOut(); router.push("/admin/login"); },
    handleMarkAsRead, handleMarkAllRead, handleDeleteNotification
  };
}

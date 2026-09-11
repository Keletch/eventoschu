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
  const [systemTags, setSystemTags] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCacheRefreshing, setIsCacheRefreshing] = useState(false);
  const [keapTags, setKeapTags] = useState<any[]>([]);
  const [isTagsLoading, setIsTagsLoading] = useState(false);
  const [eventClicks, setEventClicks] = useState<any[]>([]);

  // Dialogs & UI State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isRegDialogOpen, setIsRegDialogOpen] = useState(false);
  const [isPurgeDialogOpen, setIsPurgeDialogOpen] = useState(false);
  const [isDeleteEventDialogOpen, setIsDeleteEventDialogOpen] = useState(false);
  const [isToggleDialogOpen, setIsToggleDialogOpen] = useState(false);
  const [isCategoriesDialogOpen, setIsCategoriesDialogOpen] = useState(false);
  const [editingReg, setEditingReg] = useState<any>(null);
  const [purgingReg, setPurgingReg] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [togglingEvent, setTogglingEvent] = useState<any>(null);
  const [newEvent, setNewEvent] = useState<any>({
    title: "", city: "", country: "", category_id: "", start_date: "", end_date: null,
    time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
    price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: null, flag: "PE", bg_class: "bg-sky-100", active: true,
    external_url: "", external_button_text: "", description: "", info_url: "", tag_ids: [], paid_links: []
  });
  
  // Toggles para acciones destructivas en Keap
  const [removeKeapTagsOnToggle, setRemoveKeapTagsOnToggle] = useState(false); // Por defecto NO quitar tags en Keap al pausar
  const [removeKeapTagsOnPurge, setRemoveKeapTagsOnPurge] = useState(false); // Por defecto conservamos el historial al purgar

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

  // Progress tracking state for long Keap operations
  const [progressState, setProgressState] = useState<{
    isOpen: boolean;
    current: number;
    total: number;
    message: string;
    title: string;
  }>({
    isOpen: false,
    current: 0,
    total: 100,
    message: "",
    title: "",
  });

  const runWithProgress = async (
    title: string,
    operation: (operationId: string) => Promise<any>
  ) => {
    const opId = typeof crypto?.randomUUID === "function" 
      ? crypto.randomUUID() 
      : Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    setProgressState({
      isOpen: true,
      current: 0,
      total: 100,
      message: "Estableciendo conexión con el servidor...",
      title,
    });

    const channel = supabase
      .channel(`op-progress:${opId}`)
      .on("broadcast", { event: "progress-update" }, (payload) => {
        const data = payload.payload;
        if (data) {
          setProgressState((prev) => ({
            ...prev,
            current: data.current,
            total: data.total,
            message: data.message,
          }));
        }
      })
      .subscribe();

    try {
      const result = await operation(opId);
      return result;
    } finally {
      supabase.removeChannel(channel);
      setProgressState({
        isOpen: false,
        current: 0,
        total: 100,
        message: "",
        title: "",
      });
    }
  };

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (events.length === 0) setIsLoading(true);
    try {
      const [{ data: eventsData }, { data: catsData }, { data: tagsData }, regsResult, { data: clicksData }] = await Promise.all([
        supabase.from("events").select("*, categories:category_id(*, parent_category:parent_category_id(id, name, icon)), event_tags(tags(*))").order("start_date", { ascending: true }),
        supabase.from("categories").select("*").order("name"),
        supabase.from("tags").select("*").order("name"),
        getRegistrations(),
        supabase.from("event_clicks").select("*")
      ]);

      if (eventsData) setEvents(eventsData);
      if (catsData) setCategories(catsData);
      if (tagsData) setSystemTags(tagsData);
      if (regsResult.success && regsResult.data) {
        setRegistrations(regsResult.data);
      }
      if (clicksData) setEventClicks(clicksData);
    } catch (_error) {
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
    } catch (_error) {
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
          setTimeout(() => {
            setEditingReg(updated);
          }, 0);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [registrations, editingReg?.id]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        router.push("/admin/login");
        setIsLoading(false);
        return;
      }

      // 🛡️ Doble Verificación: Comprobar si sigue siendo Admin en la tabla
      const { data: adminCheck } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email?.toLowerCase().trim())
        .single();

      if (!adminCheck) {
        await supabase.auth.signOut();
        router.push("/admin/login");
        toast.error("Sesión invalidada: No tienes permisos.");
        setIsLoading(false);
        return;
      }

      setSession(session);
      fetchData();
      fetchTags();
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
    } catch (_error) {
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

      // 2. Limpiamos el objeto para que no lleve relaciones virtuales que den error
      const adminEmail = session?.user?.email || "un administrador";
      const { categories: _, event_tags: __, tag_ids: rawTagIds, ...eventToSave } = newEvent;
      
      // 🛡️ Regla estricta: Cerrado solo acepta pago_cupo (nunca pago). Abierto solo acepta pago (nunca pago_cupo).
      const isClosedMode = eventToSave.initial_status === "pending";
      const pagoTagObj = systemTags.find((t: any) => t.slug === "pago");
      const pagoCupoTagObj = systemTags.find((t: any) => t.slug === "pago_cupo");
      
      const tagIdsToSave = (rawTagIds || []).filter((tid: string) => {
        if (isClosedMode && pagoTagObj && tid === pagoTagObj.id) return false;
        if (!isClosedMode && pagoCupoTagObj && tid === pagoCupoTagObj.id) return false;
        return true;
      });

      const { data: savedData, error } = eventToSave.id 
        ? await supabase.from("events").update(eventToSave).eq("id", eventToSave.id).select()
        : await supabase.from("events").insert([eventToSave]).select();
      
      if (error) throw error;

      const eventId = eventToSave.id || (savedData && savedData[0]?.id);
      if (!eventId) throw new Error("No se pudo obtener el ID del evento");

      // Sincronizar tabla event_tags
      await supabase.from("event_tags").delete().eq("event_id", eventId);
      if (tagIdsToSave && tagIdsToSave.length > 0) {
        const relations = tagIdsToSave.map((tid: string) => ({ event_id: eventId, tag_id: tid }));
        const { error: tagsInsertError } = await supabase.from("event_tags").insert(relations);
        if (tagsInsertError) throw tagsInsertError;
      }

      // 3. Si los tags cambiaron, migrar usuarios en Keap
      if (isUpdating && tagsChanged) {
        const totalUsers = registrations.filter(r => r.selected_events?.includes(eventToSave.id)).length;
        
        let migration: { success: boolean; count?: number; error?: any } = { success: true, count: 0 };
        if (totalUsers > 0) {
          migration = await runWithProgress("Migrando Etiquetas en Keap CRM", (opId) =>
            migrateEventTags({
              eventId: eventToSave.id,
              oldTags,
              newTags: { pending: newEvent.keap_pending_tag_id, confirmed: newEvent.keap_tag_id },
              adminEmail: session?.user?.email || "Admin",
              eventTitle: eventToSave.title,
              operationId: opId
            })
          );
        } else {
          migration = await migrateEventTags({
            eventId: eventToSave.id,
            oldTags,
            newTags: { pending: newEvent.keap_pending_tag_id, confirmed: newEvent.keap_tag_id },
            adminEmail: session?.user?.email || "Admin",
            eventTitle: eventToSave.title
          });
        }

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

      // 🎯 Solo refrescar la whitelist de tags en Redis si este evento involucra 'Pago con cupo'
      const pagoCupoTag = systemTags.find(t => t.slug === "pago_cupo");
      const hasPagoCupo = pagoCupoTag && (tagIdsToSave || []).includes(pagoCupoTag.id);
      const hadPagoCupo = isUpdating && pagoCupoTag && (events.find(ev => ev.id === eventToSave.id)?.event_tags || []).some((et: any) => et.tags?.slug === "pago_cupo");
      const shouldRefreshWhitelist = !!(hasPagoCupo || hadPagoCupo);

      await clearEventsCache(shouldRefreshWhitelist); // Invalida caché de Redis
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
      const totalUsers = registrations.filter(r => r.selected_events?.includes(togglingEvent.id)).length;
      
      let syncResult;
      const affectsKeap = newStatus || removeKeapTagsOnToggle;
      if (totalUsers > 0 && affectsKeap) {
        syncResult = await runWithProgress(
          newStatus ? "Activando Evento y Sincronizando Keap" : "Desactivando Evento y Pausando Keap",
          (opId) => syncMassTagsByEvent(togglingEvent.id, newStatus ? 'activate' : 'deactivate', removeKeapTagsOnToggle, opId)
        );
      } else {
        syncResult = await syncMassTagsByEvent(togglingEvent.id, newStatus ? 'activate' : 'deactivate', removeKeapTagsOnToggle);
      }

      if (!syncResult.success) throw new Error(syncResult.error);

      const { error } = await supabase.from("events").update({ active: newStatus }).eq("id", togglingEvent.id);
      if (error) throw error;

      // 🎯 Solo refrescar whitelist en Redis si el evento desactivado/activado tiene 'Pago con cupo'
      const isPagoCupo = (togglingEvent.event_tags || []).some((et: any) => et.tags?.slug === "pago_cupo");
      await clearEventsCache(isPagoCupo); // Invalida caché de Redis

      const adminEmail = session?.user?.email || "Un administrador";
      await notifyAdminEventStatusChanged(adminEmail, togglingEvent, newStatus, removeKeapTagsOnToggle);

      if (newStatus) {
        toast.success(`Evento activado (tags en Keap restaurados)`);
      } else {
        toast.success(removeKeapTagsOnToggle 
          ? `Evento desactivado (Keap pausado)` 
          : `Evento desactivado (Keap continúa activo)`);
      }
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
      const totalUsers = registrations.filter(r => r.selected_events?.includes(deletingEvent.id)).length;
      
      let result;
      if (totalUsers > 0 && removeKeapTagsOnPurge) {
        result = await runWithProgress(
          "Purgando Evento y Limpiando Keap CRM",
          (opId) => purgeEvent(deletingEvent.id, removeKeapTagsOnPurge, opId)
        );
      } else {
        result = await purgeEvent(deletingEvent.id, removeKeapTagsOnPurge);
      }

      if (!result.success) throw new Error(result.error);
      
      // 🎯 Solo refrescar whitelist en Redis si el evento purgado tenía 'Pago con cupo'
      const isPagoCupo = (deletingEvent.event_tags || []).some((et: any) => et.tags?.slug === "pago_cupo");
      await clearEventsCache(isPagoCupo);
      
      toast.success(removeKeapTagsOnPurge 
        ? "Evento y datos relacionados purgados (BD y Keap)" 
        : "Evento purgado (Limpieza Local, Keap intacto)");
        
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
  const pendingCount = registrations.reduce((acc, r) => acc + Object.values(r.event_statuses || {}).filter(s => s === 'pending').length, 0);
  const approvedCount = registrations.reduce((acc, r) => acc + Object.values(r.event_statuses || {}).filter(s => s === 'confirmed').length, 0);
  const cancelledCount = registrations.reduce((acc, r) => acc + Object.values(r.event_statuses || {}).filter(s => s === 'cancelled').length, 0);

  return {
    // Data
    events, registrations, categories, systemTags, isLoading, isSubmitting, isCacheRefreshing,
    keapTags, isTagsLoading, totalInscriptions, pendingCount, approvedCount, cancelledCount,
    eventClicks,
    
    // Filters sub-hook
    ...filters,

    // Dialogs & UI State
    isDialogOpen, setIsDialogOpen, isRegDialogOpen, setIsRegDialogOpen,
    isPurgeDialogOpen, setIsPurgeDialogOpen, isDeleteEventDialogOpen, setIsDeleteEventDialogOpen,
    isToggleDialogOpen, setIsToggleDialogOpen,
    isCategoriesDialogOpen, setIsCategoriesDialogOpen,
    editingReg, setEditingReg, 
    purgingReg, setPurgingReg, deletingEvent, setDeletingEvent, togglingEvent,
    newEvent, setNewEvent, notifications, unreadCount, isNotifOpen, setIsNotifOpen,
    removeKeapTagsOnToggle, setRemoveKeapTagsOnToggle,
    removeKeapTagsOnPurge, setRemoveKeapTagsOnPurge,
    progressState,

    // Handlers
    fetchData, fetchTags, handleClearCache, handleCreateEvent, handleDeleteEvent, handleConfirmEventPurge,
    toggleEventStatus, handleConfirmToggleStatus, handleUpdateReg, handleDeleteReg, handleConfirmPurge,
    handleEditEvent: (event: any) => { 
      setNewEvent({
        ...event,
        start_date: formatDateForInput(event.start_date),
        external_url: event.external_url || "",
        external_button_text: event.external_button_text || "",
        description: event.description || "",
        info_url: event.info_url || "",
        paid_links: event.paid_links || [],
        tag_ids: event.event_tags?.map((et: any) => et.tags?.id).filter(Boolean) || []
      }); 
      setIsDialogOpen(true); 
    },
    handleEditReg: (reg: any) => { setEditingReg(reg); setIsRegDialogOpen(true); },
    handleNewEvent: () => {
      setNewEvent({
        title: "", city: "", country: "", category_id: "", start_date: "",
        time: "19:00", duration: "Aproximadamente 2 horas", location: "Por definir",
        price: "30 USD", capacity: 50, keap_tag_id: "", keap_pending_tag_id: null, flag: "PE", bg_class: "bg-sky-100", active: true,
        initial_status: "confirmed",
        external_url: "",
        external_button_text: "",
        description: "",
        info_url: "",
        tag_ids: [],
        paid_links: []
      });
      setIsDialogOpen(true);
    },
    handleDuplicateEvent: async (event: any) => {
      const { id: _id, created_at: _created_at, categories: _categories, event_tags: _event_tags, ...rest } = event;
      setNewEvent({ 
        ...rest, 
        title: `${rest.title} (Copia)`, 
        active: false,
        start_date: formatDateForInput(rest.start_date),
        external_url: rest.external_url || "",
        external_button_text: rest.external_button_text || "",
        description: rest.description || "",
        info_url: rest.info_url || "",
        paid_links: event.paid_links || [],
        tag_ids: event.event_tags?.map((et: any) => et.tags?.id).filter(Boolean) || []
      });
      setIsDialogOpen(true);
    },
    handleLogout: async () => { await supabase.auth.signOut(); router.push("/admin/login"); },
    handleMarkAsRead, handleMarkAllRead, handleDeleteNotification
  };
}

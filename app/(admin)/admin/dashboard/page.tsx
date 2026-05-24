"use client";

import React, { useEffect, useRef } from "react";
import { Plus, LogOut, Loader2, Users, CheckCircle2, RefreshCw, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TooltipProvider } from "@/components/ui/tooltip";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import gsap from "gsap";

// Modular Components
import { Logo } from "@/components/header/logo";
import { StatsGrid } from "./components/stats/stats-grid";
import { SearchInput } from "./components/filters/search-input";
import { SearchablePicker } from "./components/filters/searchable-picker";
import { EventsTable } from "./components/tables/events-table";
import { RegistrationsTable } from "./components/tables/registrations-table";
import { MetricsView } from "./components/metrics/metrics-view";
import { EventDialog } from "./components/forms/event-dialog";
import { RegistrationDialog } from "./components/forms/registration-dialog";
import { PurgeUserDialog } from "./components/forms/purge-user-dialog";
import { DeleteEventDialog } from "./components/forms/delete-event-dialog";
import { ToggleEventDialog } from "./components/forms/toggle-event-dialog";
import { ManageCategoriesDialog } from "./components/forms/manage-categories-dialog";
import { OperationProgressDialog } from "./components/forms/operation-progress-dialog";

// Hooks
import { useAdminDashboard } from "./hooks/use-admin-dashboard";

export default function AdminDashboard() {
  const {
    events, registrations, categories, systemTags, isLoading: isDataLoading, isSubmitting,
    eventsSearch, setEventsSearch, eventTabCatFilter, setEventTabCatFilter,
    eventTabStatusFilter, setEventTabStatusFilter, eventTabTagFilter, setEventTabTagFilter,
    regsSearch, setRegsSearch,
    regsCategoryFilter, setRegsCategoryFilter, regsEventFilter, setRegsEventFilter,
    regsStatusFilter, setRegsStatusFilter, regsCountryFilter, setRegsCountryFilter,
    regsSurveyFilter, setRegsSurveyFilter,
    regsLoyaltyFilter, setRegsLoyaltyFilter,
    regsSurveyCompleteFilter, setRegsSurveyCompleteFilter,
    regsTodayFilter, setRegsTodayFilter,
    regsClerkFilter, setRegsClerkFilter,
    currentPage, setCurrentPage, pageSize, setPageSize, totalPages, paginatedRegs, filteredRegs,
    isDialogOpen, setIsDialogOpen,
    isRegDialogOpen, setIsRegDialogOpen, isPurgeDialogOpen, setIsPurgeDialogOpen,
    isDeleteEventDialogOpen, setIsDeleteEventDialogOpen,
    isToggleDialogOpen, setIsToggleDialogOpen,
    isCategoriesDialogOpen, setIsCategoriesDialogOpen,
    editingReg, setEditingReg, purgingReg,
    deletingEvent, togglingEvent,
    newEvent, setNewEvent, keapTags, isTagsLoading, fetchTags,
    handleCreateEvent, handleDeleteEvent, handleConfirmEventPurge, handleDuplicateEvent,
    toggleEventStatus, handleConfirmToggleStatus, handleClearCache, isCacheRefreshing,
    handleUpdateReg, handleDeleteReg, handleConfirmPurge, 
    handleEditEvent, handleEditReg, handleNewEvent, handleLogout,
    pendingCount, approvedCount, cancelledCount, filteredEvents,
    notifications, unreadCount, handleMarkAsRead,
    handleMarkAllRead, handleDeleteNotification, isNotifOpen, setIsNotifOpen, fetchData, resetRegsFilters, resetEventsFilters,
    removeKeapTagsOnToggle, setRemoveKeapTagsOnToggle, removeKeapTagsOnPurge, setRemoveKeapTagsOnPurge,
    progressState
  } = useAdminDashboard();

  const categoryOptions = React.useMemo(() => {
    const parents = categories.filter((c: any) => !c.parent_category_id);
    const options = [{ id: 'all', label: 'Categorías' }];
    parents.forEach((parent: any) => {
      options.push({ id: parent.id.toString(), label: parent.name });
      const children = categories.filter((c: any) => c.parent_category_id === parent.id);
      children.forEach((child: any) => {
        // Usa un espacio en blanco especial y una flecha para sangrar la subcategoría
        options.push({ id: child.id.toString(), label: `  ↳ ${child.name}` });
      });
    });
    return options;
  }, [categories]);

  const tagOptions = React.useMemo(() => {
    return [
      { id: 'all', label: 'Etiquetas' },
      ...systemTags.map((tag: any) => ({ id: tag.id.toString(), label: tag.name }))
    ];
  }, [systemTags]);

  const [isActuallyReady, setIsActuallyReady] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("events");
  const headerRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // If data is ready, wait a bit more to ensure smooth transition
    if (!isDataLoading) {
      const timer = setTimeout(() => {
        setIsActuallyReady(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isDataLoading]);

  useEffect(() => {
    if (isActuallyReady) {
      const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: 0.8 } });
      
      tl.fromTo(headerRef.current, { y: -20, opacity: 0 }, { y: 0, opacity: 1 })
        .fromTo(".animate-stat", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, stagger: 0.1 }, "-=0.4")
        .fromTo(".animate-content", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 1 }, "-=0.6");
    }
  }, [isActuallyReady]);

  // Handle Tab Transitions
  useEffect(() => {
    if (isActuallyReady) {
      gsap.fromTo(".tab-content-anim", 
        { y: 15, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.05, delay: 0.05 }
      );
    }
  }, [activeTab, isActuallyReady]);

  if (!isActuallyReady) {
    return (
      <div className="h-screen overflow-y-auto no-scrollbar bg-background pb-20 font-sans overflow-x-hidden transition-colors duration-300">
        <style jsx global>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
          }
          .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }
        `}</style>
        {/* Skeleton Header - Precise pt-10 pb-10 mb-8 */}
        <div className="bg-card border-b border-border pt-10 pb-10 mb-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              {/* Logo h-10 */}
              <div className="h-10 w-36 bg-muted rounded-lg animate-pulse" />
              <div className="h-10 w-px bg-border" />
              <div className="space-y-2">
                <div className="h-7 w-48 bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-64 bg-muted/50 rounded-md animate-pulse" />
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end space-y-1">
                <div className="h-2.5 w-24 bg-primary/10 rounded animate-pulse" />
                <div className="h-4 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex gap-3">
                <div className="size-11 bg-muted rounded-xl animate-pulse" />
                <div className="h-11 w-32 bg-muted rounded-xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Skeleton Stats - Precise grid-cols-2/3/5 gap-4 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-card py-3 px-4 rounded-3xl border border-border shadow-sm h-[76px] animate-pulse flex justify-between items-center">
                <div className="space-y-2">
                  <div className="h-2.5 w-16 bg-muted rounded uppercase tracking-wider" />
                  <div className="h-7 w-12 bg-muted rounded mt-0.5" />
                </div>
                <div className="p-2 size-8 bg-muted/50 rounded-xl" />
              </div>
            ))}
          </div>

          <div className="space-y-6">
            {/* Skeleton Tabs - Precise p-1.5 rounded-2xl */}
            <div className="h-14 w-[410px] bg-card p-1.5 border border-border rounded-2xl animate-pulse shadow-sm" />
            
            {/* Skeleton Filter Bar - Precise p-4 rounded-3xl h-20 */}
            <div className="bg-card p-4 rounded-3xl border border-border shadow-sm flex gap-4 h-[78px] items-center">
              <div className="h-11 w-64 bg-muted/50 rounded-xl animate-pulse" />
              <div className="h-11 w-44 bg-muted/50 rounded-xl animate-pulse" />
              <div className="h-11 w-40 bg-muted/50 rounded-xl animate-pulse" />
              <div className="ml-auto h-11 w-40 bg-primary/10 rounded-xl animate-pulse" />
            </div>
 
            {/* Skeleton Table Rows - Precise py-4 avatar-10x10 */}
            <div className="bg-card rounded-[40px] border border-border overflow-hidden shadow-sm">
              {/* Header row */}
              <div className="px-6 h-[45px] border-b border-border bg-muted/30 animate-pulse" />
              
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="px-6 py-4 border-b border-muted flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-muted rounded-xl animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-40 bg-neutral-100 rounded animate-pulse" />
                      <div className="h-3 w-24 bg-neutral-50 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-24 bg-neutral-50 rounded animate-pulse ml-12" />
                  <div className="h-6 w-16 bg-blue-50 rounded-full animate-pulse ml-auto" />
                  <div className="h-6 w-10 bg-neutral-50 rounded-full animate-pulse mx-12" />
                  <div className="flex gap-2">
                    <div className="size-9 bg-neutral-50 rounded-xl animate-pulse" />
                    <div className="size-9 bg-neutral-100 rounded-xl animate-pulse" />
                    <div className="size-9 bg-neutral-50 rounded-xl animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-y-auto no-scrollbar bg-background pb-20 font-sans overflow-x-hidden selection:bg-primary/20">
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none !important;
        }
        .no-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <TooltipProvider>
        <div ref={headerRef} className="bg-card border-b border-border pt-10 pb-10 mb-8 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <Logo />
              <div className="h-10 w-px bg-border" />
              <div>
                <h1 className="text-2xl font-black text-foreground tracking-tight">Panel de Gestión</h1>
                <p className="text-muted-foreground font-medium mt-1">Control centralizado de eventos e inscripciones.</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Estado del Sistema</p>
                <p className="text-sm font-bold text-foreground flex items-center gap-2">
                  <span className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                  Operativo (Realtime)
                </p>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="flex items-center gap-3">
                <ThemeToggle />
                <NotificationBell 
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAllAsRead={handleMarkAllRead}
                  onDeleteNotification={handleDeleteNotification}
                  isOpen={isNotifOpen}
                  setIsOpen={setIsNotifOpen}
                />
                <Button 
                  variant="ghost" 
                  onClick={handleLogout}
                  className="rounded-xl h-11 px-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 font-bold transition-all gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="hidden sm:inline">Cerrar Sesión</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <main ref={mainRef} className="max-w-7xl mx-auto px-6 space-y-8">
          {/* Metrics Section */}
          <div className="animate-stat">
            <StatsGrid
              registrationsCount={registrations.length}
              cancelledCount={cancelledCount}
              pendingCount={pendingCount}
              approvedCount={approvedCount}
              activeEventsCount={events.filter(e => e.active).length}
              onEventsClick={() => setActiveTab("events")}
              onUsersClick={() => {
                setRegsStatusFilter("all");
                setRegsEventFilter("all");
                setRegsCountryFilter("all");
                setRegsSearch("");
                setActiveTab("registrations");
              }}
              onApprovedClick={() => {
                setRegsStatusFilter("confirmed");
                setRegsEventFilter("all");
                setRegsCountryFilter("all");
                setActiveTab("registrations");
              }}
              onPendingClick={() => {
                setRegsStatusFilter("pending");
                setRegsEventFilter("all");
                setRegsCountryFilter("all");
                setActiveTab("registrations");
              }}
              onCancelledClick={() => {
                setRegsStatusFilter("cancelled");
                setRegsEventFilter("all");
                setRegsCountryFilter("all");
                setActiveTab("registrations");
              }}
            />
          </div>

          <Tabs 
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6 animate-content"
          >
            <TabsList className="bg-muted/30 p-1.5 rounded-2xl border border-border h-auto shadow-sm">
              <TabsTrigger value="events" className="rounded-xl px-8 py-2.5 font-bold data-active:bg-primary/10 data-active:text-primary data-active:shadow-none transition-all">Gestión de Eventos</TabsTrigger>
              <TabsTrigger value="registrations" className="rounded-xl px-8 py-2.5 font-bold data-active:bg-primary/10 data-active:text-primary data-active:shadow-none transition-all">Usuarios Registrados</TabsTrigger>
              <TabsTrigger value="metrics" className="rounded-xl px-8 py-2.5 font-bold data-active:bg-primary/10 data-active:text-primary data-active:shadow-none transition-all">Inteligencia y Métricas</TabsTrigger>
            </TabsList>

            {/* TAB: EVENTS */}
            <TabsContent value="events" className="space-y-6 outline-none">
              <div className="tab-content-anim relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <SearchInput
                    placeholder="Buscar evento..."
                    value={eventsSearch}
                    onChange={setEventsSearch}
                    tooltipTitle="Búsqueda de Eventos"
                    tooltipDescription="Filtra por título, ciudad o país."
                  />
                  <SearchablePicker
                    value={eventTabCatFilter}
                    onSelect={setEventTabCatFilter}
                    options={categoryOptions}
                    placeholder="Categorías"
                    triggerClassName="w-44"
                  />
                  <SearchablePicker
                    value={eventTabStatusFilter}
                    onSelect={setEventTabStatusFilter}
                    options={[{ id: 'all', label: 'Estados' }, { id: 'active', label: 'Activos' }, { id: 'inactive', label: 'Inactivos' }]}
                    placeholder="Estados"
                    triggerClassName="w-40"
                  />
                  <SearchablePicker
                    value={eventTabTagFilter}
                    onSelect={setEventTabTagFilter}
                    options={tagOptions}
                    placeholder="Etiquetas"
                    triggerClassName="w-40"
                  />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCategoriesDialogOpen(true)} 
                    className="rounded-xl h-11 px-4 text-muted-foreground hover:text-primary border-border bg-card gap-2 font-bold"
                    title="Gestionar Categorías"
                  >
                    <Users className="w-4 h-4" /> {/* Reuse Users or use FolderTree if imported */}
                    <span className="hidden lg:inline">Categorías</span>
                  </Button>
                  <Button onClick={handleNewEvent} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 px-6 font-bold shadow-lg shadow-primary/20 transition-all gap-2 border-none">
                    <Plus className="w-5 h-5" /> Nuevo Evento
                  </Button>
                </div>
              </div>

              {/* Contenedor de Filtros Activos y Acciones */}
              <div className="tab-content-anim flex flex-col sm:flex-row justify-between items-start gap-4 mt-3 mb-4 w-full">
                {/* Izquierda: Chips Activos */}
                <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                  {eventTabCatFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-sky-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Categoría:</span>
                      <span className="text-[11px] font-bold">
                        {categories.find((c: any) => c.id.toString() === eventTabCatFilter.toString())?.name || eventTabCatFilter}
                      </span>
                      <button 
                        onClick={() => setEventTabCatFilter("all")}
                        className="p-0.5 hover:bg-sky-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {eventTabStatusFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-emerald-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Estado:</span>
                      <span className="text-[11px] font-bold">
                        {eventTabStatusFilter === "active" ? "Activo" : "Inactivo"}
                      </span>
                      <button 
                        onClick={() => setEventTabStatusFilter("all")}
                        className="p-0.5 hover:bg-emerald-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {eventTabTagFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-rose-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Etiqueta:</span>
                      <span className="text-[11px] font-bold">
                        {systemTags.find((t: any) => t.id.toString() === eventTabTagFilter.toString())?.name || eventTabTagFilter}
                      </span>
                      <button 
                        onClick={() => setEventTabTagFilter("all")}
                        className="p-0.5 hover:bg-rose-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Derecha: Acciones (Resetear y Refrescar Web) */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center ml-auto sm:ml-0">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetEventsFilters}
                    className="h-6 px-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-all gap-1.5 cursor-pointer"
                    title="Limpiar todos los filtros"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resetear Filtros
                  </Button>

                  <div className="w-px h-3 bg-border" />

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={handleClearCache}
                    disabled={isCacheRefreshing}
                    className="h-6 px-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-primary transition-all gap-1.5 cursor-pointer"
                    title="Limpiar Caché de Redis"
                  >
                    {isCacheRefreshing ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Refrescar Web
                  </Button>
                </div>
              </div>

              <div className="tab-content-anim pt-2">
                <EventsTable
                  events={filteredEvents}
                  isLoading={isDataLoading}
                  registrations={registrations}
                  toggleEventStatus={toggleEventStatus}
                  handleDuplicateEvent={handleDuplicateEvent}
                  handleEditEvent={handleEditEvent}
                  handleDeleteEvent={handleDeleteEvent}
                />
              </div>
            </TabsContent>

            <TabsContent value="registrations" className="space-y-6 outline-none">
              <div className="tab-content-anim relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card p-4 rounded-3xl border border-border shadow-sm">
                <div className="flex flex-wrap items-center gap-3 w-full">
                  <SearchInput
                    placeholder="Buscar usuario..."
                    value={regsSearch}
                    onChange={setRegsSearch}
                    tooltipTitle="Búsqueda de Usuarios"
                    tooltipDescription="Busca por nombre, email o teléfono."
                  />
                  <SearchablePicker
                    value={regsCategoryFilter}
                    onSelect={setRegsCategoryFilter}
                    options={categoryOptions}
                    placeholder="Categorías"
                    triggerClassName="w-44"
                  />
                  <SearchablePicker
                    value={regsEventFilter}
                    onSelect={setRegsEventFilter}
                    options={[{ id: 'all', label: 'Todos los Eventos' }, ...events.map(e => ({ id: e.id.toString(), label: e.title }))]}
                    placeholder="Todos los Eventos"
                    triggerClassName="min-w-[200px]"
                  />
                  <SearchablePicker
                    value={regsStatusFilter}
                    onSelect={setRegsStatusFilter}
                    options={[{ id: 'all', label: 'Estados' }, { id: 'pending', label: 'Pendientes' }, { id: 'confirmed', label: 'Confirmados' }, { id: 'cancelled', label: 'Cancelados' }]}
                    placeholder="Estados"
                    triggerClassName="w-40"
                  />
                  <SearchablePicker
                    value={regsCountryFilter}
                    onSelect={setRegsCountryFilter}
                    options={[
                      { id: 'all', label: 'Todos los Países' },
                      { id: 'unspecified', label: 'No especificado' },
                      ...Array.from(new Set(registrations.map(r => r.residence_country).filter(Boolean))).sort().map(c => ({ id: c, label: c }))
                    ]}
                    placeholder="Países"
                    triggerClassName="w-44"
                  />
                  <SearchablePicker
                    value={regsSurveyCompleteFilter}
                    onSelect={setRegsSurveyCompleteFilter}
                    options={[
                      { id: 'all', label: 'Perfil / Formulario' },
                      { id: 'completed', label: 'Con Formulario' },
                      { id: 'pending', label: 'Sin Formulario' }
                    ]}
                    placeholder="Formulario"
                    triggerClassName="w-44"
                  />
                </div>
              </div>

              {/* Contenedor de Filtros Activos y Acciones */}
              <div className="tab-content-anim flex flex-col sm:flex-row justify-between items-start gap-4 mt-3 mb-4 w-full">
                {/* Izquierda: Chips Activos */}
                <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
                  {regsSurveyFilter && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-blue-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Filtrando por:</span>
                      <span className="text-[11px] font-bold">{regsSurveyFilter.a}</span>
                      <button 
                        onClick={() => setRegsSurveyFilter(null)}
                        className="p-0.5 hover:bg-blue-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsLoyaltyFilter && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-violet-500/10 border border-violet-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-violet-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Segmento:</span>
                      <span className="text-[11px] font-bold">Fidelidad (Multi-evento)</span>
                      <button 
                        onClick={() => setRegsLoyaltyFilter(false)}
                        className="p-0.5 hover:bg-violet-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsCategoryFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-sky-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Categoría:</span>
                      <span className="text-[11px] font-bold">
                        {categories.find((c: any) => c.id.toString() === regsCategoryFilter.toString())?.name || regsCategoryFilter}
                      </span>
                      <button 
                        onClick={() => setRegsCategoryFilter("all")}
                        className="p-0.5 hover:bg-sky-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsEventFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-rose-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Evento:</span>
                      <span className="text-[11px] font-bold">
                        {events.find((e: any) => e.id.toString() === regsEventFilter.toString())?.title || regsEventFilter}
                      </span>
                      <button 
                        onClick={() => setRegsEventFilter("all")}
                        className="p-0.5 hover:bg-rose-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsStatusFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-emerald-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Estado:</span>
                      <span className="text-[11px] font-bold">
                        {regsStatusFilter === "confirmed" ? "Confirmado" : regsStatusFilter === "pending" ? "Pendiente" : "Cancelado"}
                      </span>
                      <button 
                        onClick={() => setRegsStatusFilter("all")}
                        className="p-0.5 hover:bg-emerald-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsCountryFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-500/10 border border-teal-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-teal-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">País:</span>
                      <span className="text-[11px] font-bold">
                        {regsCountryFilter === "unspecified" ? "No especificado" : regsCountryFilter}
                      </span>
                      <button 
                        onClick={() => setRegsCountryFilter("all")}
                        className="p-0.5 hover:bg-teal-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsSurveyCompleteFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-indigo-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Formulario:</span>
                      <span className="text-[11px] font-bold">{regsSurveyCompleteFilter === "completed" ? "Perfil Completo" : "Perfil Incompleto"}</span>
                      <button 
                        onClick={() => setRegsSurveyCompleteFilter("all")}
                        className="p-0.5 hover:bg-indigo-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsClerkFilter !== "all" && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-fuchsia-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Clerk:</span>
                      <span className="text-[11px] font-bold">{regsClerkFilter === "registered" ? "Registrado" : "No Registrado"}</span>
                      <button 
                        onClick={() => setRegsClerkFilter("all")}
                        className="p-0.5 hover:bg-fuchsia-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}

                  {regsTodayFilter && (
                    <div className="flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-full w-fit animate-in fade-in slide-in-from-left-4 text-amber-500">
                      <span className="text-[9px] font-black uppercase tracking-wider opacity-60">Fecha:</span>
                      <span className="text-[11px] font-bold">Registrados Hoy</span>
                      <button 
                        onClick={() => setRegsTodayFilter(false)}
                        className="p-0.5 hover:bg-amber-500/20 rounded-md transition-colors"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Derecha: Acciones (Solo Clerk y Resetear Filtros) */}
                <div className="flex items-center gap-3 shrink-0 self-end sm:self-center ml-auto sm:ml-0">
                  <button
                    onClick={() => setRegsClerkFilter(prev => prev === "registered" ? "all" : "registered")}
                    className={cn(
                      "h-6 px-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all gap-1 flex items-center border cursor-pointer select-none",
                      regsClerkFilter === "registered"
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-sm"
                        : "text-muted-foreground/60 hover:text-muted-foreground border-transparent bg-transparent"
                    )}
                    title="Filtrar solo usuarios registrados en Clerk"
                  >
                    <CheckCircle2 className={cn("w-3.5 h-3.5", regsClerkFilter === "registered" ? "text-emerald-500" : "text-muted-foreground/40")} />
                    <span>Solo Clerk</span>
                  </button>

                  <div className="w-px h-3 bg-border" />

                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={resetRegsFilters}
                    className="h-6 px-2 text-[10px] font-black uppercase tracking-widest text-neutral-400 hover:text-red-500 transition-all gap-1.5 cursor-pointer"
                    title="Limpiar todos los filtros"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Resetear Filtros
                  </Button>
                </div>
              </div>

              <div className="tab-content-anim space-y-4">
                {/* 🔢 Paginación Premium */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-4">
                    <div className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">
                      Mostrar
                    </div>
                    <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border">
                      {[10, 20, 50, 100].map((size) => (
                        <button
                          key={size}
                          onClick={() => setPageSize(size)}
                          className={cn(
                            "px-3 py-1.5 text-xs font-black rounded-lg transition-all",
                            pageSize === size 
                              ? "bg-background text-primary shadow-sm" 
                              : "text-muted-foreground/60 hover:text-muted-foreground"
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
 
                  <div className="flex items-center gap-6 ml-auto">
                    <div className="text-[11px] font-black text-muted-foreground/60 uppercase tracking-widest">
                      Mostrando <span className="text-foreground font-black">{Math.min((currentPage - 1) * pageSize + 1, filteredRegs.length)}</span> - <span className="text-foreground font-black">{Math.min(currentPage * pageSize, filteredRegs.length)}</span> de <span className="text-foreground font-black">{filteredRegs.length}</span>
                    </div>
 
                    <div className="flex items-center gap-2">
                      <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <ChevronLeft className="size-4" />
                      </button>
                      
                      <div className="flex items-center gap-1 bg-muted px-2 py-1.5 rounded-xl border border-border">
                        <span className="text-xs font-black text-primary px-2">{currentPage}</span>
                        <span className="text-xs font-bold text-muted-foreground/30">/</span>
                        <span className="text-xs font-bold text-muted-foreground/60 px-2">{totalPages || 1}</span>
                      </div>
 
                      <button
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground disabled:opacity-20 disabled:cursor-not-allowed transition-all shadow-sm"
                      >
                        <ChevronRight className="size-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <RegistrationsTable
                  registrations={paginatedRegs}
                  isLoading={isDataLoading}
                  events={events}
                  handleEditReg={handleEditReg}
                  handleDeleteReg={handleDeleteReg}
                />
              </div>
            </TabsContent>

            <TabsContent value="metrics" className="tab-content-anim outline-none">
              <MetricsView 
                registrations={registrations}
                events={events}
                onCountryClick={(country) => {
                  setRegsCountryFilter(country);
                  setActiveTab("registrations");
                }}
                onEventClick={(eventId) => {
                  setRegsEventFilter(eventId);
                  setActiveTab("registrations");
                }}
                onSurveyClick={(q, a) => {
                  setRegsSurveyFilter({ q, a });
                  setActiveTab("registrations");
                }}
                onLoyaltyClick={() => {
                  setRegsLoyaltyFilter(true);
                  setActiveTab("registrations");
                }}
                onSurveyCompleteClick={() => {
                  setRegsSurveyCompleteFilter("completed");
                  setActiveTab("registrations");
                }}
                onTodayClick={() => {
                  setRegsTodayFilter(true);
                  setActiveTab("registrations");
                }}
              />
            </TabsContent>
          </Tabs>

          {/* Global Dialogs */}
          <EventDialog
            isOpen={isDialogOpen}
            setIsOpen={setIsDialogOpen}
            event={newEvent}
            setEvent={setNewEvent}
            categories={categories}
            systemTags={systemTags}
            keapTags={keapTags}
            isTagsLoading={isTagsLoading}
            onRefreshTags={fetchTags}
            isSubmitting={isSubmitting}
            onSubmit={handleCreateEvent}
          />

          <RegistrationDialog
            isOpen={isRegDialogOpen}
            onOpenChange={setIsRegDialogOpen}
            reg={editingReg}
            setReg={setEditingReg}
            events={events}
            onUpdate={handleUpdateReg}
            isSubmitting={isSubmitting}
            onRefresh={fetchData}
          />

          <PurgeUserDialog 
            isOpen={isPurgeDialogOpen}
            onOpenChange={setIsPurgeDialogOpen}
            userEmail={purgingReg?.email || ""}
            onConfirm={handleConfirmPurge}
            isSubmitting={isSubmitting}
          />

          <DeleteEventDialog
            isOpen={isDeleteEventDialogOpen}
            onOpenChange={isDeleteEventDialogOpen ? setIsDeleteEventDialogOpen : () => {}}
            eventTitle={deletingEvent?.title || ""}
            registrationsCount={registrations.filter(r => r.selected_events?.includes(deletingEvent?.id)).length}
            onConfirm={handleConfirmEventPurge}
            isSubmitting={isSubmitting}
            removeKeapTags={removeKeapTagsOnPurge}
            setRemoveKeapTags={setRemoveKeapTagsOnPurge}
          />

          <ToggleEventDialog
            isOpen={isToggleDialogOpen}
            onOpenChange={setIsToggleDialogOpen}
            eventTitle={togglingEvent?.title || ""}
            isActive={togglingEvent?.active || false}
            onConfirm={handleConfirmToggleStatus}
            isSubmitting={isSubmitting}
            removeKeapTags={removeKeapTagsOnToggle}
            setRemoveKeapTags={setRemoveKeapTagsOnToggle}
          />
          
          <OperationProgressDialog
            isOpen={progressState.isOpen}
            current={progressState.current}
            total={progressState.total}
            message={progressState.message}
            title={progressState.title}
          />
        </main>
        <ManageCategoriesDialog
          isOpen={isCategoriesDialogOpen}
          setIsOpen={setIsCategoriesDialogOpen}
          categories={categories}
          onCategoryAdded={fetchData}
        />
      </TooltipProvider>
    </div>
  );
}


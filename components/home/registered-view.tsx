"use client";

import React, { useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { RegistrationTopBar } from "@/components/home/registration-top-bar";
import { RegistrationHero } from "@/components/home/registration-hero";
import { CitySelector } from "@/components/home/city-selector";
import { UserDataCard } from "@/components/home/user-data-card";
import { NextStepsPanel } from "@/components/home/next-steps-panel";
import { ShareSection } from "@/components/home/share-section";
import { ContactFooterCard } from "@/components/home/contact-footer-card";
import { SocialMediaPanel } from "@/components/home/social-media-panel";
import { getEventUIConfig, getRegistrationStatusCopy } from "@/lib/event-config";

interface RegisteredViewProps {
  userData: any;
  displayData: any;
  eventStatuses: Record<string, string>;
  selectedCityId: string;
  setSelectedCityId: (id: string | ((prev: string) => string)) => void;
  events: any[];
  isLoadingEvents: boolean;
  startNewRegistration: () => void;
  eventDataMap: Record<string, any>;
  isEditing: boolean;
  editFormData: any;
  handleEditChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setIsEditing: (val: boolean) => void;
  setEditFormData: (val: any) => void;
  isSubmitting: boolean;
  handleUpdateRegistration: () => Promise<void>;
  isSignedIn: boolean | undefined;
  revalidateStatus: (email: string) => Promise<void>;
  setIsSurveyOpen: (val: boolean) => void;
  surveyData: any;
  eventCounts?: Record<string, number>;
}

export function RegisteredView({
  userData,
  displayData,
  eventStatuses,
  selectedCityId,
  setSelectedCityId,
  events,
  isLoadingEvents,
  startNewRegistration,
  isEditing,
  editFormData,
  handleEditChange,
  setIsEditing,
  setEditFormData,
  isSubmitting,
  handleUpdateRegistration,
  isSignedIn,
  setIsSurveyOpen,
  surveyData,
  eventCounts = {},
}: RegisteredViewProps) {
  // Validar eventos registrados
  const registeredEvents = events.filter((e) =>
    Object.keys(eventStatuses).includes(e.id)
  );
  const hasNoEvents = registeredEvents.length === 0;

  // Si hay eventos registrados pero ninguno seleccionado (o ID inválido), auto-seleccionar el primero de inmediato
  useEffect(() => {
    if (registeredEvents.length > 0 && !registeredEvents.some(e => e.id === selectedCityId)) {
      setSelectedCityId(registeredEvents[0].id);
    }
  }, [selectedCityId, registeredEvents, setSelectedCityId]);

  const effectiveCityId = (selectedCityId && registeredEvents.some(e => e.id === selectedCityId))
    ? selectedCityId
    : (registeredEvents[0]?.id || "");
  const currentEvent = events.find(e => e.id === effectiveCityId);
  const currentStatus = (effectiveCityId && eventStatuses[effectiveCityId]) || "pending";
  const _isSurveyMissing = !surveyData || Object.keys(surveyData).length === 0;

  // 🎊 Confeti al ver un registro confirmado: una ráfaga corta, una vez por evento en esta visita,
  // y nada si el sistema pide reducir movimiento. (Antes: 7 s de ráfagas que se reiniciaban con cada refresco de datos.)
  const celebratedRef = useRef<Set<string>>(new Set());
  const hasCurrentEvent = !!currentEvent;
  useEffect(() => {
    if (hasNoEvents || !hasCurrentEvent || currentStatus !== "confirmed" || !effectiveCityId) return;
    if (celebratedRef.current.has(effectiveCityId)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    celebratedRef.current.add(effectiveCityId);

    const colors = ["#3154DC", "#0F9700", "#FFD700", "#FF0000", "#00FF00", "#FFFFFF"];
    const fire = (x: number, angle: number) =>
      confetti({ particleCount: 80, angle, spread: 55, origin: { x, y: 0.75 }, startVelocity: 65, gravity: 0.8, ticks: 300, colors, zIndex: 100 });
    const timers = [
      setTimeout(() => { fire(0, 55); fire(1, 125); }, 400),
      setTimeout(() => fire(0, 60), 1100),
      setTimeout(() => fire(1, 120), 1500),
    ];
    return () => timers.forEach(clearTimeout);
  }, [effectiveCityId, currentStatus, hasNoEvents, hasCurrentEvent]);


  // 🧠 Configuración centralizada del evento actual
  const eventConfig = getEventUIConfig(currentEvent);

  const isClosed = currentEvent?.initial_status === 'pending';
  const eventTags = currentEvent?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
  const isPagoCupo = isClosed && eventTags.some((t: any) => t.slug === 'pago_cupo');
  const confirmedCount = currentEvent?.id ? (eventCounts[currentEvent.id] || 0) : 0;
  const capacity = currentEvent?.capacity || 50;
  const isFull = confirmedCount >= capacity;

  // Textos de estado según estado + tipo de evento (misma fuente para título, barra superior y tarjeta)
  const statusCopy = getRegistrationStatusCopy(currentStatus, { isClosed, isPagoCupo, isFull });
  // Mientras se busca el registro no afirmamos "No estás registrado" (se veía unos segundos antes de encontrarlo)
  const isSearching = hasNoEvents && isLoadingEvents;
  const heroTitle = isSearching ? "Buscando\ntu registro…" : hasNoEvents ? "No estás registrado\nen ningún evento" : statusCopy.title;
  const heroDescription = isSearching
    ? "Un momento, estamos consultando tus eventos."
    : hasNoEvents
      ? "Regístrate en alguno de nuestros eventos disponibles para que aparezca aquí tu información."
      : statusCopy.heroDescription;

  return (
    <div className="step-2 bg-transparent text-foreground space-y-12 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 antialiased">

      {/* ── Barra superior: estado + botón salir ───────── */}
      <RegistrationTopBar
        status={currentStatus}
        startNewRegistration={startNewRegistration}
        hasNoEvents={hasNoEvents}
        statusLabel={statusCopy.badge}
      />

      {/* ── Título principal ────────────────────────────── */}
      {(() => {
        const waConfig = (currentEvent?.paid_links || []).find((l: any) => l.type === "whatsapp_config");
        const waUrl = currentEvent?.whatsapp_url || waConfig?.whatsapp_url || null;
        const waBtnText = currentEvent?.whatsapp_button_text || waConfig?.whatsapp_button_text || "Unirme a la comunidad de WhatsApp";

        return (
          <RegistrationHero 
            title={heroTitle}
            description={heroDescription}
            whatsappUrl={waUrl}
            whatsappButtonText={waBtnText}
          />
        );
      })()}

      {/* ── Selector de ciudades inscritas ─────────────── */}
      <CitySelector
        events={events}
        eventStatuses={eventStatuses}
        selectedCityId={effectiveCityId}
        setSelectedCityId={setSelectedCityId}
        isLoadingEvents={isLoadingEvents}
        onBrowseEvents={startNewRegistration}
      />

      {/* ── Tarjeta de datos del usuario ───────────────── */}
      <UserDataCard
        displayData={displayData}
        status={currentStatus}
        eventTitle={currentEvent?.title || "Evento"}
        eventCity={currentEvent?.city || ""}
        eventCountry={currentEvent?.country || ""}
        isLoadingEvents={isLoadingEvents}
        isEditing={isEditing}
        editFormData={editFormData}
        handleEditChange={handleEditChange}
        setIsEditing={setIsEditing}
        setEditFormData={setEditFormData}
        isSubmitting={isSubmitting}
        handleUpdateRegistration={handleUpdateRegistration}
        isSignedIn={isSignedIn}
        eventConfig={eventConfig}
        currentEvent={currentEvent}
        eventCounts={eventCounts}
        statusCopy={statusCopy}
      />

      {/* ── ¿Qué sigue? ────────────────────────────────── */}
      <NextStepsPanel
        surveyData={surveyData}
        setIsSurveyOpen={setIsSurveyOpen}
        currentEvent={currentEvent}
      />

      {/* ── Compartir link ──────────────────────────────── */}
      <ShareSection
        selectedCityId={effectiveCityId}
        eventTitle={currentEvent?.title || "Gira de HyenUk Chu"}
        userId={userData?.user_id || userData?.id}
        userName={displayData.firstName ? `${displayData.firstName}${displayData.lastName ? ` ${displayData.lastName}` : ''}` : ""}
      />

      {/* ── Contacto de soporte ─────────────────────────── */}
      <ContactFooterCard />

      {/* ── Redes Sociales ──────────────────────────────── */}
      <SocialMediaPanel />
    </div>
  );
}

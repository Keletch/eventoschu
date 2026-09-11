"use client";

import React, { useEffect } from "react";
import confetti from "canvas-confetti";
import { RegistrationTopBar } from "@/components/home/registration-top-bar";
import { RegistrationHero } from "@/components/home/registration-hero";
import { CitySelector } from "@/components/home/city-selector";
import { UserDataCard } from "@/components/home/user-data-card";
import { NextStepsPanel } from "@/components/home/next-steps-panel";
import { ShareSection } from "@/components/home/share-section";
import { ContactFooterCard } from "@/components/home/contact-footer-card";
import { SocialMediaPanel } from "@/components/home/social-media-panel";
import { getEventUIConfig } from "@/lib/event-config";

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
  const cityName = displayData.city || currentEvent?.city || "";
  const _isSurveyMissing = !surveyData || Object.keys(surveyData).length === 0;

  // 🎊 Efecto de Confetti elegante (solo si hay evento confirmado real y seleccionado)
  useEffect(() => {
    if (!hasNoEvents && currentEvent && currentStatus === "confirmed") {
      let timeoutId: any;
      let isActive = true;

      const fireBurst = () => {
        if (!isActive) return;

        const isLeft = Math.random() > 0.5;
        
        confetti({
          particleCount: 80,
          angle: isLeft ? 55 : 125, // Ángulo potente hacia el centro
          spread: 50,
          origin: { x: isLeft ? 0 : 1, y: 0.75 },
          startVelocity: 70, // Muy fuerte para cruzar la pantalla
          gravity: 0.8, // Caída un poco más lenta y elegante
          ticks: 400, // Más tiempo en pantalla
          colors: ["#3154DC", "#0F9700", "#FFD700", "#FF0000", "#00FF00", "#FFFFFF"],
          zIndex: 100,
        });

        // Programar el siguiente disparo en ~1.5 segundos
        const nextDelay = 1200 + Math.random() * 800;
        timeoutId = setTimeout(fireBurst, nextDelay);
      };

      // Iniciar después de un pequeño delay inicial
      timeoutId = setTimeout(fireBurst, 500);

      // Detener el ciclo después de 7 segundos para que no sea infinito
      const stopTimer = setTimeout(() => {
        isActive = false;
        clearTimeout(timeoutId);
      }, 7000);

      return () => {
        isActive = false;
        clearTimeout(timeoutId);
        clearTimeout(stopTimer);
      };
    }
  }, [effectiveCityId, currentStatus, hasNoEvents, Boolean(currentEvent)]);

  // 🧠 Obtener configuración centralizada para el evento actual
  const eventConfig = getEventUIConfig(currentEvent);

  const heroTitle = hasNoEvents 
    ? "No estás registrado\nen ningún evento"
    : eventConfig.hero.title;

  const heroDescription = hasNoEvents
    ? "Regístrate en alguno de nuestros eventos disponibles para que aparezca aquí tu información."
    : eventConfig.hero.description;

  const isClosed = currentEvent?.initial_status === 'pending';
  const eventTags = currentEvent?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
  const isPagoCupo = isClosed && eventTags.some((t: any) => t.slug === 'pago_cupo');
  const confirmedCount = currentEvent?.id ? (eventCounts[currentEvent.id] || 0) : 0;
  const capacity = currentEvent?.capacity || 50;
  const isFull = confirmedCount >= capacity;

  return (
    <div className="step-2 bg-transparent text-foreground space-y-12 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 antialiased">

      {/* ── Barra superior: estado + botón salir ───────── */}
      <RegistrationTopBar
        status={currentStatus}
        startNewRegistration={startNewRegistration}
        eventConfig={eventConfig}
        hasNoEvents={hasNoEvents}
        isPagoCupo={isPagoCupo}
        isFull={isFull}
      />

      {/* ── Título principal ────────────────────────────── */}
      <RegistrationHero 
        title={heroTitle}
        description={heroDescription}
      />

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
      />

      {/* ── ¿Qué sigue? ────────────────────────────────── */}
      <NextStepsPanel
        surveyData={surveyData}
        setIsSurveyOpen={setIsSurveyOpen}
      />

      {/* ── Compartir link ──────────────────────────────── */}
      <ShareSection
        selectedCityId={effectiveCityId}
        cityName={cityName}
        userId={userData?.user_id || userData?.id}
      />

      {/* ── Contacto de soporte ─────────────────────────── */}
      <ContactFooterCard />

      {/* ── Redes Sociales ──────────────────────────────── */}
      <SocialMediaPanel />
    </div>
  );
}

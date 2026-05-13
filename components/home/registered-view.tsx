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
  eventDataMap,
  isEditing,
  editFormData,
  handleEditChange,
  setIsEditing,
  setEditFormData,
  isSubmitting,
  handleUpdateRegistration,
  isSignedIn,
  revalidateStatus,
  setIsSurveyOpen,
  surveyData,
}: RegisteredViewProps) {
  const currentStatus = eventStatuses[selectedCityId] || "pending";
  const cityName = displayData.city || "";
  const isSurveyMissing = !surveyData || Object.keys(surveyData).length === 0;

  // 🎊 Efecto de Confetti elegante (cañones laterales potentes)
  useEffect(() => {
    if (currentStatus === "confirmed") {
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
  }, [selectedCityId, currentStatus]);

  // 🧠 Obtener configuración centralizada para el evento actual
  const currentEvent = events.find(e => e.id === selectedCityId);
  const eventConfig = getEventUIConfig(currentEvent);

  return (
    <div className="step-2 bg-transparent text-foreground space-y-12 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 antialiased">

      {/* ── Barra superior: estado + botón salir ───────── */}
      <RegistrationTopBar
        status={currentStatus}
        startNewRegistration={startNewRegistration}
        eventConfig={eventConfig}
      />

      {/* ── Título principal ────────────────────────────── */}
      <RegistrationHero 
        title={eventConfig.hero.title}
        description={eventConfig.hero.description}
      />

      {/* ── Selector de ciudades inscritas ─────────────── */}
      <CitySelector
        events={events}
        eventStatuses={eventStatuses}
        selectedCityId={selectedCityId}
        setSelectedCityId={setSelectedCityId}
        isLoadingEvents={isLoadingEvents}
      />

      {/* ── Tarjeta de datos del usuario ───────────────── */}
      <UserDataCard
        displayData={displayData}
        status={currentStatus}
        eventTitle={events.find(e => e.id === selectedCityId)?.title || "Evento"}
        eventCity={events.find(e => e.id === selectedCityId)?.city || ""}
        eventCountry={events.find(e => e.id === selectedCityId)?.country || ""}
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
      />

      {/* ── ¿Qué sigue? ────────────────────────────────── */}
      <NextStepsPanel
        surveyData={surveyData}
        setIsSurveyOpen={setIsSurveyOpen}
      />

      {/* ── Compartir link ──────────────────────────────── */}
      <ShareSection
        selectedCityId={selectedCityId}
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

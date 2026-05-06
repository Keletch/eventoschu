"use client";

import React from "react";
import { RegistrationTopBar } from "@/components/home/registration-top-bar";
import { RegistrationHero } from "@/components/home/registration-hero";
import { CitySelector } from "@/components/home/city-selector";
import { UserDataCard } from "@/components/home/user-data-card";
import { NextStepsPanel } from "@/components/home/next-steps-panel";
import { ShareSection } from "@/components/home/share-section";
import { ContactFooterCard } from "@/components/home/contact-footer-card";
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

  // 🧠 Obtener configuración centralizada para el evento actual
  const currentEvent = events.find(e => e.id === selectedCityId);
  const eventConfig = getEventUIConfig(currentEvent);

  return (
    <div className="step-2 space-y-12 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

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
    </div>
  );
}

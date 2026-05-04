"use client";

import React from "react";
import { RegistrationTopBar } from "@/components/home/registration-top-bar";
import { RegistrationHero } from "@/components/home/registration-hero";
import { CitySelector } from "@/components/home/city-selector";
import { UserDataCard } from "@/components/home/user-data-card";
import { NextStepsPanel } from "@/components/home/next-steps-panel";
import { ShareSection } from "@/components/home/share-section";
import { ContactFooterCard } from "@/components/home/contact-footer-card";

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

  return (
    <div className="step-2 space-y-12 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* ── Barra superior: estado + botón salir ───────── */}
      <RegistrationTopBar
        status={currentStatus}
        startNewRegistration={startNewRegistration}
      />

      {/* ── Título principal ────────────────────────────── */}
      <RegistrationHero />

      {/* ── Banner de Acción: Formulario Pendiente ──────── */}
      {isSurveyMissing && (
        <div className="max-w-4xl mx-auto px-4 animate-in zoom-in fade-in duration-500">
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            <div className="flex items-center gap-5 text-center md:text-left">
              <div className="size-14 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
                <svg className="size-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div className="space-y-1">
                <h4 className="text-xl font-bold text-amber-900 leading-none">Acción requerida: Formulario pendiente</h4>
                <p className="text-amber-700/80 font-medium">Este requisito es obligatorio para confirmar tu cupo.</p>
              </div>
            </div>
            <button 
              onClick={() => setIsSurveyOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 shadow-lg shadow-amber-600/20 whitespace-nowrap"
            >
              Completar ahora
            </button>
          </div>
        </div>
      )}

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
        isLoadingEvents={isLoadingEvents}
        isEditing={isEditing}
        editFormData={editFormData}
        handleEditChange={handleEditChange}
        setIsEditing={setIsEditing}
        setEditFormData={setEditFormData}
        isSubmitting={isSubmitting}
        handleUpdateRegistration={handleUpdateRegistration}
        isSignedIn={isSignedIn}
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
      />

      {/* ── Contacto de soporte ─────────────────────────── */}
      <ContactFooterCard />
    </div>
  );
}

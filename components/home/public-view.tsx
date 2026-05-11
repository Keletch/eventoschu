"use client";

import React from "react";
import dynamic from "next/dynamic";
const RegistrationForm = dynamic(() => import("@/components/registration-form").then(mod => mod.RegistrationForm), { ssr: false });
import { HeroSection } from "@/components/home/hero-section";
import { CheckRegistrationPanel } from "@/components/home/check-registration-panel";
import { MonthTabs } from "@/components/home/month-tabs";
import { EventsCarousel } from "@/components/home/events-carousel";
import { CategoryTabs } from "./category-tabs";
import { useClerk } from "@clerk/nextjs";

interface PublicViewProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  scrollContainerRef: React.RefObject<HTMLDivElement | null>;
  isPageReady: boolean;
  isRegistered: boolean;
  isSignedIn: boolean | undefined;
  user: any;
  revalidateStatus: (email: string) => Promise<void>;
  isCheckMode: boolean;
  setIsCheckMode: (val: boolean) => void;
  isChecking: boolean;
  handleCheckRegistration: (email: string) => Promise<void>;
  availableMonths: string[];
  activeMonth: string;
  handleMonthChange: (month: string) => void;
  events: any[]; // Todos los eventos
  filteredEvents: any[]; // Eventos filtrados por categoría
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  availableCategories: string[];
  selectedEvents: string[];
  handleSelectEvent: (id: string) => void;
  isLoadingEvents: boolean;
  eventCounts: Record<string, number>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleRegistration: (data: any, turnstileToken: string) => Promise<{ success: boolean }>;
  isSubmitting: boolean;
  formatSafeDate: (dateStr: string) => Date | null;
  isTransitioning: boolean;
}

export function PublicView({
  containerRef,
  scrollContainerRef,
  isPageReady,
  isRegistered,
  isSignedIn,
  user,
  revalidateStatus,
  isCheckMode,
  setIsCheckMode,
  isChecking,
  handleCheckRegistration,
  availableMonths,
  activeMonth,
  handleMonthChange,
  events,
  filteredEvents,
  activeCategory,
  setActiveCategory,
  availableCategories,
  selectedEvents,
  handleSelectEvent,
  isLoadingEvents,
  eventCounts,
  handleScroll,
  handleRegistration,
  isSubmitting,
  formatSafeDate,
  isTransitioning,
}: PublicViewProps) {
  const { openSignIn } = useClerk();

  return (
    <div className="step-1 space-y-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 antialiased">
      {/* ── Sección Hero ─────────────────────────────────── */}
      <HeroSection
        isSignedIn={isSignedIn}
        user={user}
        isCheckMode={isCheckMode}
        revalidateStatus={revalidateStatus}
        setIsCheckMode={setIsCheckMode}
      />

      {/* ── Contenido principal ─────────────────────────────────── */}
      <div className="pt-[140px]">
        {/* ── Tabs de Categoría + Tabs de mes + Carrusel de eventos + Formulario */}
        <div className="flex flex-col">
          <div className="relative z-30 mb-2"> {/* Categorías */}
            <CategoryTabs
              availableCategories={availableCategories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>

          <div className="relative z-20"> {/* Meses */}
            <MonthTabs
              availableMonths={availableMonths}
              activeMonth={activeMonth}
              handleMonthChange={handleMonthChange}
              events={events}
              selectedEvents={selectedEvents}
            />
          </div>

          <div className="events-section relative z-10 bg-[#F5F6F9] rounded-[48px] rounded-tl-none rounded-tr-none md:rounded-tr-[48px] p-10 md:p-16 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-16 mt-[-1px]">
            {/* Carrusel de eventos (Usa solo los eventos filtrados por categoría) */}
            <EventsCarousel
              scrollContainerRef={scrollContainerRef}
              events={filteredEvents}
              activeMonth={activeMonth}
              selectedEvents={selectedEvents}
              handleSelectEvent={handleSelectEvent}
              isLoadingEvents={isLoadingEvents}
              eventCounts={eventCounts}
              handleScroll={handleScroll}
              availableMonths={availableMonths}
              handleMonthChange={handleMonthChange}
              formatSafeDate={formatSafeDate}
            />

            {/* ── Formulario de registro ──────────────────── */}
            <div className="registration-form-container animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 space-y-8 -mt-0">
              <h2 className="text-[20px] font-medium text-[#00030C] pl-2 md:pl-6">Registro</h2>
              <div className="bg-[#FFFFFF] rounded-[32px] p-8 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white">
                <RegistrationForm
                  onSubmit={handleRegistration}
                  isLoading={isSubmitting}
                  onCheckRegistration={revalidateStatus}
                />
              </div>

              {!isSignedIn && (
                <div className="flex flex-col items-center gap-2 relative z-[100] mt-8">
                  <button
                    type="button"
                    onClick={() => openSignIn({})}
                    className="group flex items-center gap-2 text-[#007AFF] font-bold hover:opacity-80 transition-all p-2 text-center"
                  >
                    <span className="underline text-lg leading-tight font-bold">
                      ¡Hazlo más fácil! Inicia sesión para autocompletar tus datos y asegurar tu lugar en segundos
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Modal de consulta de registro ─────────────── */}
      <CheckRegistrationPanel
        isOpen={isCheckMode}
        isChecking={isChecking}
        handleCheckRegistration={handleCheckRegistration}
        setIsCheckMode={setIsCheckMode}
      />

    </div>
  );
}

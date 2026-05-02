"use client";

import React from "react";
import { RegistrationForm } from "@/components/registration-form";
import { HeroSection } from "@/components/home/hero-section";
import { CheckRegistrationPanel } from "@/components/home/check-registration-panel";
import { MonthTabs } from "@/components/home/month-tabs";
import { EventsCarousel } from "@/components/home/events-carousel";

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
  events: any[];
  selectedEvents: string[];
  handleSelectEvent: (id: string) => void;
  isLoadingEvents: boolean;
  eventCounts: Record<string, number>;
  scrollProgress: number;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleRegistration: (data: any, turnstileToken: string) => Promise<void>;
  isSubmitting: boolean;
  formatSafeDate: (dateStr: string) => Date | null;
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
  selectedEvents,
  handleSelectEvent,
  isLoadingEvents,
  eventCounts,
  scrollProgress,
  handleScroll,
  handleRegistration,
  isSubmitting,
  formatSafeDate,
}: PublicViewProps) {
  return (
    <div className="step-1 space-y-8 py-8 md:py-12">
      {/* ── Sección Hero ─────────────────────────────────── */}
      <HeroSection
        isSignedIn={isSignedIn}
        user={user}
        isCheckMode={isCheckMode}
        revalidateStatus={revalidateStatus}
        setIsCheckMode={setIsCheckMode}
      />

      {/* ── Contenido principal (check mode | eventos + form) */}
      <div className="pt-4">
        {isCheckMode ? (
          /* ── Panel de consulta de registro ─────────────── */
          <CheckRegistrationPanel
            isChecking={isChecking}
            handleCheckRegistration={handleCheckRegistration}
            setIsCheckMode={setIsCheckMode}
          />
        ) : (
          /* ── Tabs de mes + Carrusel de eventos + Formulario */
          <div className="flex flex-col">
            <MonthTabs
              availableMonths={availableMonths}
              activeMonth={activeMonth}
              handleMonthChange={handleMonthChange}
              events={events}
              selectedEvents={selectedEvents}
            />

            <div className="events-section opacity-0 translate-y-8 bg-white rounded-[48px] rounded-tl-none p-10 md:p-16 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-16 relative z-0 mt-[-1px]">
              {/* Carrusel de eventos */}
              <EventsCarousel
                scrollContainerRef={scrollContainerRef}
                events={events}
                activeMonth={activeMonth}
                selectedEvents={selectedEvents}
                handleSelectEvent={handleSelectEvent}
                isLoadingEvents={isLoadingEvents}
                eventCounts={eventCounts}
                scrollProgress={scrollProgress}
                handleScroll={handleScroll}
                availableMonths={availableMonths}
                handleMonthChange={handleMonthChange}
                formatSafeDate={formatSafeDate}
              />

              {/* ── Formulario de registro ──────────────────── */}
              <div className="registration-form-container opacity-0 translate-y-8 space-y-10 pt-10 border-t border-neutral-200">
                <h2 className="text-2xl md:text-3xl font-medium text-gray-950">Registro</h2>
                <div className="bg-white rounded-[32px] p-8 md:p-16 shadow-lg">
                  <RegistrationForm
                    onSubmit={handleRegistration}
                    isLoading={isSubmitting}
                    onCheckRegistration={() => {
                      // La revalidación la maneja el padre (page.tsx)
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

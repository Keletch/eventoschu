"use client";

import React from "react";
import dynamic from "next/dynamic";
const RegistrationForm = dynamic(() => import("@/components/registration/registration-form").then(mod => mod.RegistrationForm), { ssr: false });
import { HeroSection } from "@/components/home/hero-section";
import { CheckRegistrationPanel } from "@/components/home/check-registration-panel";
import { EventsFilterBar } from "./events-filter-bar";

const EventsCarousel = dynamic(() => import("@/components/home/events-carousel").then(mod => mod.EventsCarousel), { 
  ssr: false
});

import { useClerk } from "@clerk/nextjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { REVEAL_CONFIG } from "@/lib/animations";
import { trackGTMEvent } from "@/lib/gtm-utils";

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
  filteredEvents: any[];
  activeCategory: string;
  setActiveCategory: (cat: string) => void;
  availableCategories: string[];
  availableCategoryIcons?: Record<string, string>;
  activeSubcategory?: string;
  setActiveSubcategory?: (cat: string) => void;
  availableSubcategories?: string[];
  selectedEvents: string[];
  handleSelectEvent: (id: string) => void;
  isLoadingEvents: boolean;
  eventCounts: Record<string, number>;
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  handleRegistration: (data: any, turnstileToken: string) => Promise<{ success: boolean }>;
  isSubmitting: boolean;
  formatSafeDate: (dateStr: string) => Date | null;
  isTransitioning: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  resetAllFilters: () => void;
  activeTag?: string;
  setActiveTag?: (tag: string) => void;
  availableTags?: any[];
  userKeapTags?: string[];
  onVerifySuccess?: (tags: string[]) => void;
  onOpenSSOOnboarding?: () => void;
}

export function PublicView({
  containerRef,
  scrollContainerRef,
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
  filteredEvents,
  activeCategory,
  setActiveCategory,
  availableCategories,
  activeSubcategory,
  setActiveSubcategory,
  availableSubcategories,
  selectedEvents,
  handleSelectEvent,
  isLoadingEvents,
  eventCounts,
  handleScroll,
  handleRegistration,
  isSubmitting,
  formatSafeDate,
  searchQuery,
  setSearchQuery,
  resetAllFilters,
  activeTag,
  setActiveTag,
  availableTags,
  userKeapTags = [],
  onVerifySuccess,
  onOpenSSOOnboarding,
}: PublicViewProps) {
  const { openSignIn } = useClerk();

  const filterBarWrapperRef = React.useRef<HTMLDivElement>(null);
  const hasInteractedRef = React.useRef(false);

  const handleFilterBarInteraction = React.useCallback(() => {
    if (hasInteractedRef.current) return;
    hasInteractedRef.current = true;

    if (window.scrollY < 200 && filterBarWrapperRef.current) {
      const rect = filterBarWrapperRef.current.getBoundingClientRect();
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const targetScrollY = rect.top + scrollTop - 96;

      window.scrollTo({
        top: targetScrollY,
        behavior: "smooth"
      });
    }
  }, []);

  useGSAP((context: any, contextSafe: any) => {
    const tl = gsap.timeline({
      delay: 0.1,
      onComplete: contextSafe ? contextSafe(() => {
        const items = context.selector?.(".reveal-item");
        if (items) items.forEach((el: any) => el.classList.remove("reveal-item"));
      }) : undefined
    });

    tl.to(".reveal-item", REVEAL_CONFIG.to);
  }, { scope: containerRef });

  return (
    <div className="step-1 space-y-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 antialiased" ref={containerRef}>
      {/* ── Sección Hero ─────────────────────────────────── */}
      <div className="reveal-item">
        <HeroSection
          isSignedIn={isSignedIn}
          user={user}
          isCheckMode={isCheckMode}
          revalidateStatus={revalidateStatus}
          setIsCheckMode={setIsCheckMode}
        />
      </div>

      {/* ── Contenido principal ─────────────────────────────────── */}
      <div className="pt-[90px]">
        {/* ── Tabs de Categoría + Tabs de mes + Carrusel de eventos + Formulario */}
        <div className="flex flex-col">
          <div 
            ref={filterBarWrapperRef}
            className="relative z-30 mb-6 reveal-item"
            onClickCapture={handleFilterBarInteraction}
            onFocusCapture={handleFilterBarInteraction}
          >
            <EventsFilterBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              availableCategories={availableCategories}
              activeSubcategory={activeSubcategory || "Todos"}
              setActiveSubcategory={setActiveSubcategory || (() => {})}
              availableSubcategories={availableSubcategories || []}
              activeMonth={activeMonth}
              setActiveMonth={handleMonthChange}
              availableMonths={availableMonths}
              resetAllFilters={resetAllFilters}
              activeTag={activeTag || "Todos"}
              setActiveTag={setActiveTag || (() => {})}
              availableTags={availableTags || []}
            />
          </div>

          <div className="events-section relative z-10 bg-surface rounded-[48px] px-4 py-10 md:p-16 border border-surface-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-16 mt-[-1px] reveal-item overflow-hidden">
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
              userKeapTags={userKeapTags}
              isSignedIn={isSignedIn}
              onVerifySuccess={onVerifySuccess}
              onOpenSSOOnboarding={onOpenSSOOnboarding}
            />

            {/* ── Formulario de registro ──────────────────── */}
            {activeCategory !== "Pago" ? (
              <div className="registration-form-container animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 space-y-8 -mt-0">
                <h2 className="text-[20px] font-medium text-foreground pl-2 md:pl-6">Registro</h2>
                <div className="bg-form-card-bg rounded-[32px] p-6 md:p-16 shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-form-card-border">
                  {(() => {
                    const selectedEv = selectedEvents.length > 0
                      ? filteredEvents.find(e => e.id === selectedEvents[0])
                      : null;
                    const isClosed = selectedEv?.initial_status === "pending";
                    const isPagoCupo = isClosed && (selectedEv?.event_tags || []).some((et: any) => et.tags?.slug === "pago_cupo");
                    const config = (selectedEv?.paid_links || []).find((l: any) => l.type === "pago_cupo_config");
                    const confirmedCount = selectedEv ? (eventCounts[selectedEv.id] || 0) : 0;
                    const capacity = selectedEv?.capacity || 50;
                    const isFull = confirmedCount >= capacity;

                    let dynamicBtnText = "¡Registrarme ahora!";
                    if (isPagoCupo) {
                      if (isFull) {
                        dynamicBtnText = config?.waitlist_button_text || "Únete a la lista de espera";
                      } else {
                        dynamicBtnText = config?.checkout_button_text || "¡Registrarme ahora!";
                      }
                    }

                    return (
                      <RegistrationForm
                        onSubmit={handleRegistration}
                        isLoading={isSubmitting}
                        onCheckRegistration={revalidateStatus}
                        submitButtonText={dynamicBtnText}
                      />
                    );
                  })()}
                </div>

                {!isSignedIn && (
                  <div className="flex flex-col items-center gap-2 relative z-[100] mt-8">
                    <button
                      type="button"
                      onClick={() => {
                        trackGTMEvent("clerk_auth_initiated");
                        openSignIn({});
                      }}
                      className="group flex items-center gap-2 text-secondary font-bold hover:opacity-80 transition-all p-2 text-center"
                    >
                      <span className="underline text-lg leading-tight font-bold">
                        ¡Hazlo más fácil! Inicia sesión para autocompletar tus datos y asegurar tu lugar en segundos
                      </span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="registration-form-container animate-in fade-in slide-in-from-bottom-8 duration-500 space-y-4 text-center py-10 px-6 bg-primary/5 rounded-[32px] border border-primary/10 max-w-2xl mx-auto">
                <p className="text-foreground font-bold text-lg">Adquiere tu entrada directamente</p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Para participar en nuestros eventos de pago, haz clic en el botón de compra de la tarjeta correspondiente para ser redirigido a la plataforma de pago oficial.
                </p>
              </div>
            )}
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

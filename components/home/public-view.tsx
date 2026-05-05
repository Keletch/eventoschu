"use client";

import React from "react";
import { RegistrationForm } from "@/components/registration-form";
import { HeroSection } from "@/components/home/hero-section";
import { CheckRegistrationPanel } from "@/components/home/check-registration-panel";
import { MonthTabs } from "@/components/home/month-tabs";
import { EventsCarousel } from "@/components/home/events-carousel";

import { CategoryTabs } from "./category-tabs";
 
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
   handleRegistration: (data: any, turnstileToken: string) => Promise<void>;
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
   return (
     <div className="step-1 space-y-8 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
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
            /* ── Tabs de Categoría + Tabs de mes + Carrusel de eventos + Formulario */
           <div className="flex flex-col">
              <div className="mb-10 relative z-20"> {/* Categorías arriba de todo */}
                <CategoryTabs 
                  availableCategories={availableCategories}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                />
              </div>
                
              <div className="relative z-0 overflow-hidden pt-4 -mt-4"> {/* Meses detrás del cuadro con clipping */}
                <MonthTabs
                  availableMonths={availableMonths}
                  activeMonth={activeMonth}
                  handleMonthChange={handleMonthChange}
                  events={filteredEvents}
                  selectedEvents={selectedEvents}
                />
              </div>
 
             <div className="events-section relative z-10 bg-white rounded-[48px] rounded-tl-none p-10 md:p-16 border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-16 mt-[-1px]">
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
               <div className="registration-form-container animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 space-y-10 pt-10 border-t border-neutral-200">
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

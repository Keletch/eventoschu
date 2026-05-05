"use client";

import { useRef, useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getEvents } from "@/app/actions/events";
import { getRegistrationsCount } from "@/app/actions/admin-registration";
import { formatSafeDate } from "@/lib/date-utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SurveyModal } from "@/components/survey-modal";
import { getEventUIConfig } from "@/lib/event-config";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";

import { PublicView } from "@/components/home/public-view";
import { RegisteredView } from "@/components/home/registered-view";
import { useHomeSync } from "@/hooks/home/use-home-sync";
import { useHomeLogic } from "@/hooks/home/use-home-logic";
import { Sidebar } from "@/components/header/sidebar";
import { cn } from "@/lib/utils";
import { EventJsonLd } from "@/components/seo/event-json-ld";
import { ANIM_CONFIG, ANIM_SELECTORS } from "@/lib/animations";


export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Custom Logic Hook (SOLID: Single Responsibility)
  const home = useHomeLogic();

  // Orquestador de animaciones seguro
  const { contextSafe } = useGSAP({ scope: containerRef });

  // 2. Realtime Synchronizer
  useHomeSync({
    isPageReady: home.isPageReady,
    onEventsUpdate: () => {
      getEvents().then(res => { if (res?.success) home.setEvents(res.data || []); });
    },
    onCountsUpdate: () => {
      getRegistrationsCount().then(res => { if (res?.success && res.data) home.setEventCounts(res.data); });
    },
    onPersonalUpdate: (payload) => {
      const newEmail = payload.new.email?.toLowerCase().trim();
      const currentEmail = home.userData?.email?.toLowerCase().trim();
      const currentClerkId = home.user?.id;
      const isMyRecord = (currentClerkId && payload.new.clerk_id === currentClerkId) || (currentEmail && newEmail === currentEmail);
      
      if (isMyRecord) {
        const newStatuses = payload.new.event_statuses || {};
        const newEventData = payload.new.event_data || {};
        if (JSON.stringify(newStatuses) !== JSON.stringify(home.eventStatusesRef.current)) home.setEventStatuses(newStatuses);
        if (JSON.stringify(newEventData) !== JSON.stringify(home.eventDataMapRef.current)) home.setEventDataMap(newEventData);
        
        const newlyConfirmedId = Object.keys(newStatuses).find(id => newStatuses[id] === 'confirmed' && home.eventStatusesRef.current[id] !== 'confirmed');
        if (newlyConfirmedId) {
          // 🧠 Consultar al orquestador si este tipo de evento debe mostrar toast de confirmación
          const eventInfo = home.events.find(e => e.id === newlyConfirmedId);
          const eventConfig = getEventUIConfig(eventInfo);

          if (eventConfig.showSyncConfirmationToast) {
            toast.success(`¡Buenas noticias, ${payload.new.first_name}!`, {
              description: `Tu cupo para un evento ha sido confirmado.`,
              duration: 6000
            });
          }
        }
      }
    }
  });

  const handleRegistrationSubmit = contextSafe(async (data: any, token: string) => {
    const res = await home.handleRegistration(data, token);
    if (res.success) {
      gsap.to(ANIM_SELECTORS.step1, { 
        opacity: 0, 
        y: -ANIM_CONFIG.offset.sweep, 
        duration: ANIM_CONFIG.duration.normal, 
        onComplete: () => {
          home.setStep(2);
          window.scrollTo(0, 0);
          setTimeout(() => { 
            gsap.fromTo(ANIM_SELECTORS.step2, 
              { opacity: 0, y: ANIM_CONFIG.offset.sweep }, 
              { opacity: 1, y: 0, duration: ANIM_CONFIG.duration.slow }
            ); 
          }, 50);
        }
      });
    }
  });

  const handleBackToStep1 = contextSafe(() => {
    gsap.to(ANIM_SELECTORS.step2, { 
      opacity: 0, 
      y: ANIM_CONFIG.offset.sweep, 
      duration: ANIM_CONFIG.duration.normal, 
      onComplete: () => {
        home.startNewRegistration();
        window.scrollTo(0, 0);
        setTimeout(() => {
          gsap.fromTo(ANIM_SELECTORS.step1, 
            { opacity: 0, y: ANIM_CONFIG.offset.sweep }, 
            { opacity: 1, y: 0, duration: ANIM_CONFIG.duration.slow, ease: ANIM_CONFIG.ease.out }
          );
        }, 50);
      }
    });
  });

  const handleMonthChange = contextSafe((month: string) => {
    if (month !== home.activeMonth && !home.isTransitioning) {
      home.setIsTransitioning(true);
      
      gsap.to(ANIM_SELECTORS.card, { 
        opacity: 0, 
        x: -ANIM_CONFIG.offset.sweep, 
        duration: ANIM_CONFIG.duration.normal, 
        stagger: ANIM_CONFIG.offset.stagger,
        ease: ANIM_CONFIG.ease.in,
        onComplete: () => {
          home.setActiveMonth(month);
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
            gsap.set('.scroll-progress-fill', { width: '0%' });
          }
          setTimeout(() => home.setIsTransitioning(false), 400);
        }
      });
    }
  });

  const handleCategoryChange = contextSafe((category: string) => {
    if (category !== home.activeCategory && !home.isTransitioning) {
      home.setIsTransitioning(true);
      
      const tl = gsap.timeline({
        onComplete: () => {
          home.setActiveCategory(category);
          setTimeout(() => home.setIsTransitioning(false), 150);
        }
      });

      tl.to(ANIM_SELECTORS.card, { 
        opacity: 0, 
        x: -ANIM_CONFIG.offset.sweep, 
        duration: ANIM_CONFIG.duration.fast, 
        ease: ANIM_CONFIG.ease.in
      }, 0);

      tl.to(ANIM_SELECTORS.monthTab, { 
        opacity: 0,
        duration: ANIM_CONFIG.duration.fast, 
        ease: "none"
      }, 0);
    }
  });

  // 🔄 Manejador de scroll de alto rendimiento (0 re-renders)
  const handleScroll = contextSafe((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollWidth - target.clientWidth;
    if (maxScroll <= 0) return;

    const scrollPercent = (target.scrollLeft / maxScroll) * 100;
    
    // 🚀 Animación ultra-fluida con GSAP (0 re-renders de React)
    gsap.to('.scroll-progress-fill', { 
      width: `${scrollPercent}%`,
      duration: 0.1,
      ease: "none",
      overwrite: "auto"
    });
  });

  const isSurveyMissing = (home.step === 2 || home.isSignedIn) && 
    home.isLoaded && 
    (!home.surveyData || Object.keys(home.surveyData).length === 0);

  return (
    <main ref={containerRef} className="min-h-screen bg-[#F8F9FA] relative selection:bg-[#3154DC]/10">
      <EventJsonLd events={home.events} />
      <TooltipProvider>
        <Header 
          registrationId={home.userData?.id} 
          step={home.step} 
          isSidebarOpen={isSidebarOpen}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          isSurveyMissing={isSurveyMissing}
          setIsSurveyOpen={home.setIsSurveyOpen}
        />
        
        <div className="flex pt-20">
          <Sidebar isOpen={isSidebarOpen} />
          
          <div className={cn(
            "flex-1 transition-all duration-300 min-w-0",
            isSidebarOpen ? "lg:pl-72" : "pl-0"
          )}>
            <div className="max-w-[1512px] mx-auto px-4 md:px-8 lg:px-12 min-h-[800px]">
              {!home.isLoaded || home.step === null || home.events.length === 0 ? (
                <div className="flex-1 min-h-[800px]" />
              ) : home.step === 1 ? (
                <div className="step-1 pt-8">
                  <PublicView 
                    containerRef={containerRef}
                    scrollContainerRef={scrollContainerRef}
                    isPageReady={home.isPageReady}
                    isRegistered={home.isRegistered}
                    isSignedIn={home.isSignedIn}
                    user={home.user}
                    revalidateStatus={home.revalidateStatus}
                    isCheckMode={home.isCheckMode}
                    setIsCheckMode={home.setIsCheckMode}
                    isChecking={home.isChecking}
                    handleCheckRegistration={home.handleCheckRegistration}
                    availableMonths={home.availableMonths}
                    activeMonth={home.activeMonth}
                    handleMonthChange={handleMonthChange}
                    events={home.events}
                    filteredEvents={home.filteredEvents}
                    activeCategory={home.activeCategory}
                    setActiveCategory={handleCategoryChange}
                    availableCategories={home.availableCategories}
                    selectedEvents={home.selectedEvents}
                    handleSelectEvent={(id) => home.setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])}
                    isLoadingEvents={home.isLoadingEvents}
                    eventCounts={home.eventCounts}
                    handleScroll={handleScroll}
                    handleRegistration={handleRegistrationSubmit}
                    isSubmitting={home.isSubmitting}
                    formatSafeDate={formatSafeDate}
                    isTransitioning={home.isTransitioning}
                  />
                </div>
              ) : (
                <div className="step-2 pt-8">
                  <RegisteredView 
                    userData={home.userData}
                    displayData={home.displayData}
                    eventStatuses={home.eventStatuses}
                    selectedCityId={home.selectedCityId}
                    setSelectedCityId={home.setSelectedCityId}
                    events={home.events}
                    isLoadingEvents={home.isLoadingEvents}
                    startNewRegistration={handleBackToStep1}
                    eventDataMap={home.eventDataMap}
                    isEditing={home.isEditing}
                    editFormData={home.editFormData}
                    handleEditChange={(e) => home.setEditFormData((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))}
                    setIsEditing={home.setIsEditing}
                    setEditFormData={home.setEditFormData}
                    isSubmitting={home.isSubmitting}
                    handleUpdateRegistration={home.handleUpdateRegistration}
                    isSignedIn={home.isSignedIn}
                    revalidateStatus={home.revalidateStatus}
                    setIsSurveyOpen={home.setIsSurveyOpen}
                    surveyData={home.surveyData}
                  />
                </div>
              )}
            </div>
            
            <Footer />
          </div>
        </div>

        {home.isLoaded && (
          <SurveyModal
            isOpen={home.isSurveyOpen}
            onOpenChange={home.setIsSurveyOpen}
            email={home.userData?.email || home.user?.primaryEmailAddress?.emailAddress || ""}
            onSuccess={() => {
              const email = home.userData?.email || home.user?.primaryEmailAddress?.emailAddress;
              if (email) home.revalidateStatus(email);
            }}
          />
        )}
      </TooltipProvider>
    </main>
  );
}

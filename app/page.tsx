"use client";

import { useRef } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getEvents } from "@/app/actions/events";
import { getRegistrationsCount } from "@/app/actions/admin-registration";
import { formatSafeDate } from "@/lib/date-utils";
import { SurveyModal } from "@/components/survey-modal";
import { TooltipProvider } from "@/components/ui/tooltip";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";

import { PublicView } from "@/components/home/public-view";
import { RegisteredView } from "@/components/home/registered-view";
import { HomeSkeleton } from "@/components/home/home-skeleton";
import { useHomeSync } from "@/hooks/home/use-home-sync";
import { useHomeLogic } from "@/hooks/home/use-home-logic";


export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Custom Logic Hook (SOLID: Single Responsibility)
  // Encapsulates state, persistence, fetching and handlers.
  const home = useHomeLogic();

  // 1. Events & Month Tabs Entrance
  useGSAP(() => {
    if (!home.isLoadingEvents && home.isPageReady && home.events.length > 0 && home.step === 1 && !home.isCheckMode) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      gsap.set(".month-tabs button, .events-section, .event-card-wrapper, .registration-form-container, .hero-check", { opacity: 0, y: 30 });
      tl.to(".hero-check", { opacity: 1, y: 0, duration: 0.6 })
        .to(".month-tabs button", { opacity: 1, y: 0, x: 0, stagger: 0.05, duration: 0.6 }, "-=0.4")
        .to(".events-section", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(".event-card-wrapper", { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 }, "-=0.6")
        .to(".registration-form-container", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");
    }
  }, { scope: containerRef, dependencies: [home.isLoadingEvents, home.isPageReady, home.events.length, home.step, home.isCheckMode] });

  // 3. Realtime Synchronizer
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
          toast.success(`¡Buenas noticias, ${payload.new.first_name}!`, {
            description: `Tu cupo para un evento ha sido confirmado.`,
            duration: 6000
          });
        }
      }
    }
  });

  const handleRegistrationSubmit = async (data: any, token: string) => {
    const res = await home.handleRegistration(data, token);
    if (res.success) {
      const tl = gsap.timeline();
      tl.to(".step-1", { opacity: 0, y: -30, duration: 0.5, onComplete: () => {
        home.setStep(2);
        window.scrollTo(0, 0);
        setTimeout(() => { gsap.fromTo(".step-2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 }); }, 50);
      }});
    }
  };

  const handleMonthChange = (month: string) => {
    if (month !== home.activeMonth && !home.isTransitioning) {
      home.setIsTransitioning(true);
      home.setActiveMonth(month);
      home.setScrollProgress(0);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
      setTimeout(() => home.setIsTransitioning(false), 600);
    }
  };

  return (
    <main ref={containerRef} className="min-h-screen bg-[#F8F9FA] relative selection:bg-[#3154DC]/10">
      <TooltipProvider>
        <Header registrationId={home.userData?.id} step={home.step} />
        
        {/* Progress Bar Loader (Thin, minimal) */}
        {home.step === null && (
          <div className="fixed bottom-0 left-0 right-0 z-50 h-1 bg-gray-100 overflow-hidden">
            <div className="h-full bg-blue-600 animate-[loading-bar_1.5s_infinite_ease-in-out]"></div>
          </div>
        )}

        <div className="max-w-[1512px] mx-auto px-6 min-h-[80vh]">
          {!home.isPageReady || home.step === null ? (
            <HomeSkeleton />
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
                selectedEvents={home.selectedEvents}
                handleSelectEvent={(id) => home.setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id])}
                isLoadingEvents={home.isLoadingEvents}
                eventCounts={home.eventCounts}
                scrollProgress={home.scrollProgress}
                handleScroll={(e) => {
                  const target = e.currentTarget;
                  const scrollPercent = (target.scrollLeft / (target.scrollWidth - target.clientWidth)) * 100;
                  home.setScrollProgress(scrollPercent);
                }}
                handleRegistration={handleRegistrationSubmit}
                isSubmitting={home.isSubmitting}
                formatSafeDate={formatSafeDate}
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
                startNewRegistration={home.startNewRegistration}
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

        <SurveyModal
          isOpen={home.isSurveyOpen}
          onOpenChange={home.setIsSurveyOpen}
          email={home.userData?.email || ""}
          onSuccess={() => home.userData?.email && home.revalidateStatus(home.userData.email)}
        />
        <Footer />
      </TooltipProvider>
    </main>
  );
}

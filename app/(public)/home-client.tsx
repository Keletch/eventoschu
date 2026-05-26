"use client";

import { useRef, useState, useEffect } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getRegistrationsCount } from "@/app/actions/admin-registration";
import { getEvents, Event } from "@/app/actions/events";
import { formatSafeDate } from "@/lib/date-utils";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SurveyModal } from "@/components/registration/survey-modal";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import dynamic from "next/dynamic";

import { PublicView } from "@/components/home/public-view";
const RegisteredView = dynamic(() => import("@/components/home/registered-view").then(mod => mod.RegisteredView), { ssr: false });
import { usePublicRealtime } from "@/hooks/realtime/use-public-realtime";
import { usePersonalRealtime } from "@/hooks/realtime/use-personal-realtime";
import { useHomeLogic } from "@/hooks/home/use-home-logic";
import { Sidebar } from "@/components/header/sidebar";
import { cn } from "@/lib/utils";
import { ANIM_CONFIG, ANIM_SELECTORS } from "@/lib/animations";

interface HomeClientProps {
  initialEvents: Event[];
}

export function HomeClient({ initialEvents }: HomeClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Custom Logic Hook con datos iniciales del servidor
  const home = useHomeLogic(initialEvents);

  const { contextSafe } = useGSAP({ scope: containerRef });

  // Sincronización en tiempo real
  usePublicRealtime(() => {
    getRegistrationsCount().then(res => { 
      if (res?.success && res.data) home.setEventCounts(res.data); 
    });
    getEvents().then(res => { 
      if (res?.success) home.setEvents(res.data || []); 
    });
  });

  const userIds = [home.userData?.id, home.user?.id, home.userData?.email].filter(Boolean) as string[];

  usePersonalRealtime({
    userId: userIds,
    onUpdate: (payload: any) => {
      if (!payload) return;
      home.syncRegistrationData(payload);
    },
    onNotification: (notif: any) => {
      if (!notif) return;
      home.syncRegistrationData(notif);
      if (notif.selected_events && notif.selected_events.length === 0) {
        home.setStep(1);
      }
      if (notif.is_notification || notif.title) {
        const toastFn = (toast as any)[notif.type] || toast.success;
        toastFn(notif.title || "Notificación", {
          id: notif.id ? `notif-${notif.id}` : undefined,
          description: notif.message,
          duration: 8000,
        });
      }
    }
  });

  useEffect(() => {
    if (home.step === 1) {
      const step1 = document.querySelector(ANIM_SELECTORS.step1);
      const step2 = document.querySelector(ANIM_SELECTORS.step2);
      if (step2) gsap.to(step2, { opacity: 0, duration: 0.3 });
      if (step1) gsap.to(step1, { opacity: 1, duration: 0.3 });
    }
  }, [home.step]);

  // 🎭 Footer Reveal Orchestration
  useGSAP(() => {
    if (home.isLoaded) {
      gsap.to(".footer-reveal", {
        opacity: 1,
        y: 0,
        duration: 1,
        delay: 1.5, // Le damos tiempo al contenido para asentarse
        ease: "power2.out"
      });
    }
  }, [home.isLoaded, home.step]);

  const handleRegistrationSubmit = async (data: any, token: string) => {
    return contextSafe(async () => {
      const res = await home.handleRegistration(data, token);
      if (res.success) {
        if (!home.isSignedIn) {
          toast.success("¡Registro Exitoso!", {
            description: "Tu solicitud ha sido recibida correctamente.",
            duration: 8000,
          });
        }

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
      return res;
    })();
  };

  const handleBackToStep1 = () => {
    contextSafe(() => {
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
    })();
  };

  // 🛠️ Orquestador Maestro de Transiciones (DRY)
  const animateCardsTransition = (stateUpdater: () => void, animateMonths: boolean = false) => {
    contextSafe(() => {
      if (home.isTransitioning) return;
      home.setIsTransitioning(true);
      
      const isMobile = window.innerWidth < 768;
      const xOffset = isMobile ? 0 : ANIM_CONFIG.offset.sweep;
      
      const tl = gsap.timeline({
        onComplete: () => {
          // 1. Aplicamos el cambio de estado (React re-renderiza)
          stateUpdater();
          
          // 2. Reseteamos la barra de scroll al inicio
          if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
            gsap.set('.scroll-progress-fill', { width: '0%' });
          }
          
          // 3. Animación de Entrada
          setTimeout(() => {
            gsap.fromTo(ANIM_SELECTORS.card, 
              { opacity: 0, x: xOffset }, 
              { 
                opacity: 1, 
                x: 0, 
                duration: ANIM_CONFIG.duration.normal, 
                stagger: ANIM_CONFIG.offset.stagger,
                ease: ANIM_CONFIG.ease.out,
                onComplete: () => home.setIsTransitioning(false)
              }
            );
            
            if (animateMonths) {
              gsap.to(ANIM_SELECTORS.monthTab, { opacity: 1, duration: ANIM_CONFIG.duration.normal });
            }
          }, 50);
        }
      });

      // Animación de Salida
      tl.to(ANIM_SELECTORS.card, { 
        opacity: 0, 
        x: -xOffset, 
        duration: ANIM_CONFIG.duration.normal, 
        stagger: ANIM_CONFIG.offset.stagger,
        ease: ANIM_CONFIG.ease.in
      }, 0);

      if (animateMonths) {
        tl.to(ANIM_SELECTORS.monthTab, { opacity: 0, duration: ANIM_CONFIG.duration.fast, ease: "none" }, 0);
      }
    })();
  };

  const handleMonthChange = (month: string) => {
    if (month !== home.activeMonth) animateCardsTransition(() => home.setActiveMonth(month), false);
  };

  const handleCategoryChange = (category: string) => {
    if (category !== home.activeCategory) animateCardsTransition(() => home.setActiveCategory(category), true);
  };

  const handleSubcategoryChange = (sub: string) => {
    if (sub !== home.activeSubcategory) animateCardsTransition(() => home.setActiveSubcategory(sub), false);
  };

  const handleTagChange = (tag: string) => {
    if (tag !== home.activeTag) animateCardsTransition(() => home.setActiveTag(tag), false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    contextSafe(() => {
      const target = e.currentTarget;
      const maxScroll = target.scrollWidth - target.clientWidth;
      if (maxScroll <= 0) return;
      const scrollPercent = (target.scrollLeft / maxScroll) * 100;
      gsap.to('.scroll-progress-fill', { 
        width: `${scrollPercent}%`,
        duration: 0.1,
        ease: "none",
        overwrite: "auto"
      });
    })();
  };

  const isSurveyMissing = (home.step === 2 || home.isSignedIn) && 
    home.isLoaded && 
    (!home.surveyData || Object.keys(home.surveyData).length === 0);

  return (
    <main ref={containerRef} className="min-h-screen bg-background relative selection:bg-primary/10">
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
            "flex-1 transition-all duration-300 min-w-0 flex flex-col min-h-[calc(100vh-80px)]",
            isSidebarOpen ? "lg:pl-72" : "pl-0"
          )}>
            {/* Contenedor con flex-1 para empujar el footer */}
            <div className="max-w-[1512px] w-full mx-auto px-4 md:px-8 lg:px-12 flex-1 flex flex-col">
              {!home.isLoaded || home.step === null ? (
                <div className="flex-1" />
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
                    filteredEvents={home.filteredEvents}
                    activeCategory={home.activeCategory}
                    setActiveCategory={handleCategoryChange}
                    availableCategories={home.availableCategories}
                    activeSubcategory={home.activeSubcategory}
                    setActiveSubcategory={handleSubcategoryChange}
                    availableSubcategories={home.availableSubcategories}
                    selectedEvents={home.selectedEvents}
                    handleSelectEvent={(id) => {
                      const ev = home.events.find(e => e.id === id);
                      const tagsList = ev?.event_tags?.map((et: any) => et.tags).filter(Boolean) || [];
                      const isPaid = tagsList.some((t: any) => t.slug === 'pago');
                      if (isPaid) return;
                      home.setSelectedEvents(prev => prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]);
                    }}
                    isLoadingEvents={home.isLoadingEvents}
                    eventCounts={home.eventCounts}
                    handleScroll={handleScroll}
                    handleRegistration={handleRegistrationSubmit}
                    isSubmitting={home.isSubmitting}
                    formatSafeDate={formatSafeDate}
                    isTransitioning={home.isTransitioning}
                    searchQuery={home.searchQuery}
                    setSearchQuery={home.setSearchQuery}
                    resetAllFilters={home.resetAllFilters}
                    activeTag={home.activeTag}
                    setActiveTag={handleTagChange}
                    availableTags={home.availableTags}
                  />
                </div>
              ) : (
                <div className="step-2 pt-8 min-h-[120vh]">
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
            
            {home.isLoaded && (
              <div className="footer-reveal opacity-0 translate-y-10 relative z-[100]">
                <Footer />
              </div>
            )}
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

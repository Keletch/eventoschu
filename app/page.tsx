"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { Header } from "@/components/header";
import { EventCard } from "@/components/event-card";
import { RegistrationForm } from "@/components/registration-form";
import { Check, Loader2, Edit3 } from "lucide-react";
import { getEvents } from "@/app/actions/events";
import { registerInKeap } from "@/app/actions/keap";
import { createRegistration, checkRegistration } from "@/app/actions/registrations";
import { validateTurnstileToken } from "@/app/actions/turnstile";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import * as Flags from 'country-flag-icons/react/3x2';

// Helper to fix date timezone issues
// Helper to get flag code based on city/country name
const getFlagCode = (title: string) => {
  const t = (title || "").toLowerCase();
  if (t.includes('lima') || t.includes(' pe')) return 'PE';
  if (t.includes('medellin') || t.includes('medellín') || t.includes(' co')) return 'CO';
  if (t.includes('méxico') || t.includes('mexico') || t.includes(' mx')) return 'MX';
  if (t.includes('madrid') || t.includes('españa') || t.includes('espana')) return 'ES';
  if (t.includes('miami') || t.includes(' usa')) return 'US';
  return '';
};

const FlagIcon = ({ code, className }: { code: string; className?: string }) => {
  if (!code) return null;
  const Flag = (Flags as any)[code.toUpperCase()];
  if (!Flag) return null;
  return <Flag className={className} />;
};

const formatSafeDate = (dateStr: string) => {
  if (!dateStr) return null;
  try {
    const baseDate = dateStr.split("T")[0];
    const parts = baseDate.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch (e) {
    return null;
  }
};

const EventSkeleton = () => (
  <div className="space-y-8 p-8 border border-neutral-200 bg-white rounded-[32px] animate-pulse">
    <div className="flex items-center gap-4">
      <Skeleton className="size-12 rounded-xl bg-neutral-100" />
      <Skeleton className="h-8 w-48 bg-neutral-100" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-5 w-full bg-neutral-100" />
      <Skeleton className="h-5 w-3/4 bg-neutral-100" />
      <Skeleton className="h-5 w-2/3 bg-neutral-100" />
    </div>
  </div>
);

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(1);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeMonth, setActiveMonth] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [eventStatuses, setEventStatuses] = useState<Record<string, string>>({});
  const [selectedCityId, setSelectedCityId] = useState<string>("");

  // 1. Initial Load & Data Fetching
  useEffect(() => {
    // Set page as ready immediately to trigger static animations
    setIsPageReady(true);

    const fetchData = async () => {
      try {
        // Fetch events in background
        const result = await getEvents();
        if (result.success && result.data) {
          setEvents(result.data);
          if (result.data.length > 0) {
            const firstDate = new Date(result.data[0].start_date);
            const firstMonth = firstDate.toLocaleDateString('es-ES', { month: 'long' });
            setActiveMonth(firstMonth.charAt(0).toUpperCase() + firstMonth.slice(1));
          }
        }

        // Check local storage & Silent re-validation
        const saved = localStorage.getItem('chu_registration');
        if (saved) {
          const { userData: savedData } = JSON.parse(saved);
          if (savedData?.email) {
            const revalidation = await checkRegistration(savedData.email);
            if (revalidation.success) {
              setUserData(revalidation.data);
              setSelectedEvents(revalidation.selectedEvents);
              setEventStatuses((revalidation as any).eventStatuses || {});
              if (revalidation.selectedEvents?.length > 0) {
                setSelectedCityId(revalidation.selectedEvents[0]);
              }
              setStep(2);
            }
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchData();
  }, []); 

  // Stabilized Month Calculation
  const availableMonths = useMemo(() => {
    const months = events.map(e => {
      const d = new Date(e.start_date);
      const m = d.toLocaleDateString('es-ES', { month: 'long' });
      return m.charAt(0).toUpperCase() + m.slice(1);
    });
    return Array.from(new Set(months));
  }, [events]);

  // 1. Hero & Header Animation + Word Rotator
  useGSAP(() => {
    if (isPageReady) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      tl.to(".hero-badge", { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: "back.out(1.7)" })
        .to(".hero-title", { opacity: 1, y: 0, duration: 1.2 }, "-=0.6")
        .to(".hero-desc", { opacity: 1, y: 0, duration: 1 }, "-=1")
        .to(".hero-check", { opacity: 1, y: 0, duration: 1 }, "-=1");

      // Word Rotator Logic
      const words = ["Giras", "Eventos", "Talleres", "Reuniones"];
      let currentIndex = 0;
      const rotator = document.querySelector(".word-rotator");

      if (rotator) {
        const rotate = () => {
          const nextIndex = (currentIndex + 1) % words.length;
          const nextWord = words[nextIndex];

          const tlRotator = gsap.timeline({
            onComplete: () => {
              currentIndex = nextIndex;
              setTimeout(rotate, 1200); // Faster cycle
            }
          });

          // Slide current word out to bottom with blur
          tlRotator.to(rotator, {
            y: 120,
            opacity: 0,
            filter: "blur(10px)",
            duration: 0.25,
            ease: "power2.in",
            onComplete: () => {
              rotator.textContent = nextWord;
              gsap.set(rotator, { y: -120, filter: "blur(10px)" });
            }
          })
          // Slide next word in from top with blur cleanup
          .to(rotator, {
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            duration: 0.35,
            ease: "back.out(1.2)"
          });
        };

        // Start rotation after initial entrance
        setTimeout(rotate, 3000);
      }
    }
  }, { scope: containerRef, dependencies: [isPageReady, step] });

  // 2. Events & Month Tabs Entrance (When data is ready)
  useGSAP(() => {
    if (!isLoadingEvents && isPageReady && events.length > 0 && step === 1 && !isCheckMode) {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      
      // Reset states briefly to ensure animation triggers
      gsap.set(".month-tabs button, .events-section, .event-card-wrapper, .registration-form-container, .hero-check", { 
        opacity: 0, 
        y: 30 
      });

      tl.to(".hero-check", { opacity: 1, y: 0, duration: 0.6 })
        .to(".month-tabs button", { opacity: 1, y: 0, x: 0, stagger: 0.05, duration: 0.6 }, "-=0.4")
        .to(".events-section", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4")
        .to(".event-card-wrapper", { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 }, "-=0.6")
        .to(".registration-form-container", { opacity: 1, y: 0, duration: 0.8 }, "-=0.4");
    }
  }, { scope: containerRef, dependencies: [isLoadingEvents, isPageReady, events.length, step, isCheckMode] });
  
  // Persistence: Check and RE-VALIDATE existing registration on mount
  useEffect(() => {
    const saved = localStorage.getItem('chu_registration');
    if (saved) {
      try {
        const { userData: savedData, selectedEvents: savedEvents, eventStatuses: savedStatuses } = JSON.parse(saved);
        
        // 1. Immediate load from cache for speed
        setUserData(savedData);
        setSelectedEvents(savedEvents);
        if (savedStatuses) setEventStatuses(savedStatuses);
        if (savedEvents && savedEvents.length > 0) setSelectedCityId(savedEvents[0]);
        setStep(2);

        // 2. Silent background re-validation to get fresh data from Supabase
        if (savedData?.email) {
          checkRegistration(savedData.email).then(result => {
            if (result.success) {
              setUserData(result.data);
              setSelectedEvents(result.selectedEvents);
              const freshStatuses = (result as any).eventStatuses || {};
              setEventStatuses(freshStatuses);
              
              // Update cache with the freshest data
              localStorage.setItem('chu_registration', JSON.stringify({ 
                userData: result.data, 
                selectedEvents: result.selectedEvents,
                eventStatuses: freshStatuses
              }));
            } else {
              // If user no longer exists (e.g. deleted by admin)
              localStorage.removeItem('chu_registration');
              setStep(1);
              setUserData(null);
              setSelectedEvents([]);
              toast.error(result.error || "Tu registro ya no está disponible.");
            }
          });
        }
      } catch (e) {
        console.error("Error parsing saved registration:", e);
      }
    }
  }, []);

  // 3. Individual Cards Animation (When activeMonth changes or events load)
  useGSAP(() => {
    if (!isLoadingEvents && activeMonth && isPageReady) {
      gsap.fromTo(".event-card-wrapper", 
        { opacity: 0, y: 20, scale: 0.98 }, 
        { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.05, ease: "power2.out" }
      );
    }
  }, { scope: containerRef, dependencies: [activeMonth, isLoadingEvents, isPageReady] });

  // Cleanup: Remove complex gesture logic, keep only indicator updates
  useEffect(() => {
    if (!isPageReady || isLoadingEvents || events.length === 0) return;
    const container = scrollContainerRef.current;
    if (!container) return;

    // Reset container position just in case
    gsap.set(container, { x: 0 });
    
    // We only keep the scroll handler for the progress bar (handled via onScroll in JSX)
  }, [activeMonth, isPageReady, isLoadingEvents]);

  const handleSelectEvent = (id: string) => {
    setSelectedEvents(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleMonthChange = (month: string) => {
    if (month !== activeMonth && !isTransitioning) {
      setIsTransitioning(true);
      setActiveMonth(month);
      setScrollProgress(0);
      if (scrollContainerRef.current) scrollContainerRef.current.scrollLeft = 0;
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const maxScroll = target.scrollWidth - target.clientWidth;
    const scrollPercent = maxScroll > 0 ? (target.scrollLeft / maxScroll) * 100 : 100;
    setScrollProgress(scrollPercent);
  };

  const handleRegistration = async (data: any, turnstileToken: string) => {
    if (selectedEvents.length === 0) {
      toast.error("Por favor selecciona al menos una gira.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const selectedEventData = events.filter(e => selectedEvents.includes(e.id));
      const tagIds = selectedEventData.map(e => e.keap_tag_id).filter(Boolean);

      // 1. Save in Database (Essential + Bot Protection inside)
      const { success: regSuccess, error: regError, isUpdate, mergedEvents, eventStatuses: regStatuses } = await createRegistration({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        phone_code: data.phoneCode,
        residence_country: data.country,
        selected_events: selectedEvents,
      }, turnstileToken);

      if (!regSuccess) throw new Error(regError || "Error al guardar el registro");

      const finalSelectedEvents = (isUpdate && mergedEvents) ? mergedEvents : selectedEvents;
      const finalStatuses = (regStatuses as any) || {};

      if (isUpdate) {
        toast.success("¡Bienvenido de nuevo! Hemos actualizado tu registro con las nuevas giras.");
        setSelectedEvents(finalSelectedEvents);
      } else {
        toast.success("¡Registro completado con éxito!");
      }

      // 2. Prepare for Success UI
      setUserData(data);
      setEventStatuses(finalStatuses);
      if (finalSelectedEvents.length > 0) setSelectedCityId(finalSelectedEvents[0]);
      
      // 3. Persist in LocalStorage
      localStorage.setItem('chu_registration', JSON.stringify({ 
        userData: data, 
        selectedEvents: finalSelectedEvents,
        eventStatuses: finalStatuses
      }));

      // 4. Start Transition Immediately
      const tl = gsap.timeline();
      tl.to(".step-1", { opacity: 0, y: -30, duration: 0.5, onComplete: () => {
        setStep(2);
        window.scrollTo(0, 0);
        setTimeout(() => {
          gsap.fromTo(".step-2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8 });
        }, 50);
      }});

      // 5. Run Keap in background (Non-blocking)
      registerInKeap(data, tagIds).catch(err => {
        console.error("Delayed Keap Error:", err);
      });

    } catch (error: any) {
      toast.error(error.message || "Error al procesar el registro");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckRegistration = async (email: string) => {
    if (!email) {
      toast.error("Por favor ingresa tu correo.");
      return;
    }
    
    setIsChecking(true);
    try {
      const result = await checkRegistration(email);
      if (result.success) {
        setUserData(result.data);
        setSelectedEvents(result.selectedEvents);
        const statuses = (result as any).eventStatuses || {};
        setEventStatuses(statuses);
        if (result.selectedEvents && result.selectedEvents.length > 0) {
          setSelectedCityId(result.selectedEvents[0]);
        }
        
        // Persist locally for future refreshes
        localStorage.setItem('chu_registration', JSON.stringify({ 
          userData: result.data, 
          selectedEvents: result.selectedEvents,
          eventStatuses: statuses
        }));

        setStep(2);
        toast.success("Registro encontrado");
      } else {
        toast.error(result.error || "No se encontró registro.");
      }
    } catch (error: any) {
      toast.error("Error al consultar el registro.");
    } finally {
      setIsChecking(false);
    }
  };

  const startNewRegistration = () => {
    localStorage.removeItem('chu_registration');
    setUserData(null);
    setSelectedEvents([]);
    setEventStatuses({});
    setSelectedCityId("");
    setStep(1);
    setIsCheckMode(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-white font-['Raleway'] text-gray-950 overflow-x-hidden">
      <TooltipProvider>
        <Toaster position="top-right" richColors />
        <Header />

        <main className="max-w-[1512px] mx-auto px-6">
          {step === 1 ? (
            <div className="step-1 space-y-8 py-16 md:py-24">
              <div className="max-w-5xl mx-auto text-center space-y-8">
                <Tooltip>
                  <TooltipTrigger>
                    <div className="hero-badge opacity-0 translate-y-8 inline-flex items-center gap-3 px-6 py-2 bg-[#3154DC]/10 rounded-full border border-[#3154DC]/20 cursor-help transition-colors hover:bg-[#3154DC]/20">
                      <div className="w-2 h-2 bg-[#3154DC] rounded-full animate-pulse" />
                      <span className="text-[#3154DC] font-semibold text-base">Lista de espera para reservar cupo</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[250px] p-4 rounded-xl text-center">
                    El registro no garantiza el acceso inmediato, pero asegura tu lugar en la fila.
                  </TooltipContent>
                </Tooltip>
                
                <h1 className="hero-title opacity-0 translate-y-8 font-extrabold tracking-tight leading-[0.9] text-black text-center flex flex-col items-center">
                  <div className="h-[70px] sm:h-[100px] lg:h-[150px] overflow-hidden flex items-center justify-center mask-fade-vertical">
                    <span className="word-rotator block text-5xl sm:text-7xl lg:text-[120px] text-black leading-none">Giras</span>
                  </div>
                  <div className="text-4xl sm:text-6xl lg:text-[88px] -mt-2 sm:-mt-4 lg:-mt-6 whitespace-nowrap">
                    HyenUk Chu
                  </div>
                </h1>
                
                <p className="hero-desc opacity-0 translate-y-8 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-600 font-medium leading-relaxed px-4">
                  Espacio relajado con Hyenuk Chu para compartir, conocernos mejor y fortalecer conexiones auténticas.
                </p>

                <div className="hero-check opacity-0 translate-y-8 flex justify-center gap-4 pt-4">
                  {!isCheckMode && (
                    <Button 
                      onClick={() => setIsCheckMode(true)}
                      variant="link" 
                      className="text-[#3154DC] font-bold text-lg hover:no-underline hover:text-[#3154DC]/80"
                    >
                      ¿Ya te registraste? Consulta tu estado
                    </Button>
                  )}
                </div>
              </div>

              <div className="pt-4">
                {isCheckMode ? (
                  <div className="max-w-xl mx-auto bg-white rounded-[40px] p-10 md:p-16 border border-neutral-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.08)] space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="space-y-4 text-center">
                      <div className="inline-flex items-center justify-center size-16 bg-[#3154DC]/10 rounded-2xl text-[#3154DC] mb-2">
                        <Check className="size-8" />
                      </div>
                      <h3 className="text-3xl font-extrabold text-black tracking-tight">Consulta tu registro</h3>
                      <p className="text-lg text-gray-500 font-medium leading-relaxed">Ingresa el correo con el que te registraste para ver tu confirmación.</p>
                    </div>
                    
                    <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-sm font-bold uppercase text-slate-400 tracking-[0.1em] ml-1">Correo electrónico</label>
                        <input 
                          type="email"
                          id="check-email"
                          placeholder="ejemplo@correo.com"
                          className="w-full h-16 px-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:border-[#3154DC] focus:ring-4 focus:ring-[#3154DC]/10 transition-all outline-none text-xl font-medium"
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <Button 
                          onClick={() => {
                            const email = (document.getElementById('check-email') as HTMLInputElement).value;
                            handleCheckRegistration(email);
                          }}
                          disabled={isChecking}
                          className="w-full h-16 bg-[#3154DC] hover:bg-[#3154DC]/90 text-white font-bold rounded-2xl text-xl flex items-center justify-center gap-3 shadow-xl shadow-[#3154DC]/20 transition-all active:scale-[0.98]"
                        >
                          {isChecking ? <Loader2 className="size-7 animate-spin" /> : "Consultar ahora"}
                        </Button>
                        
                        <button 
                          onClick={() => setIsCheckMode(false)}
                          className="group flex items-center gap-2 text-[#3154DC] font-bold text-lg hover:opacity-80 transition-opacity"
                        >
                          Regresar al formulario
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <div className="month-tabs flex gap-2 overflow-x-auto overflow-y-hidden no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                      {availableMonths.map((month) => {
                        const selectedCount = events.filter(e => {
                          const d = new Date(e.start_date);
                          const m = d.toLocaleDateString('es-ES', { month: 'long' });
                          const cap = m.charAt(0).toUpperCase() + m.slice(1);
                          return cap === month && selectedEvents.includes(e.id);
                        }).length;

                        return (
                          <button
                            key={month}
                            onClick={() => handleMonthChange(month)}
                            className={cn(
                              "px-10 py-5 !rounded-b-none rounded-t-[32px] font-bold text-lg transition-all duration-500 relative flex items-center gap-0 shrink-0 opacity-0 translate-y-8 overflow-hidden cursor-pointer",
                              activeMonth === month 
                                ? "bg-[#3154DC] text-white shadow-[-10px_0_20px_rgba(0,0,0,0.05)] z-10" 
                                : "bg-neutral-100 text-zinc-400 hover:bg-neutral-200"
                            )}
                            style={{
                              transitionProperty: "all",
                              transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)"
                            }}
                          >
                            <span className="relative z-10">{month}</span>
                            <div 
                              className={cn(
                                "overflow-hidden transition-all duration-300 ease-in-out flex items-center justify-center",
                                selectedCount > 0 ? "w-8 ml-3 opacity-100" : "w-0 ml-0 opacity-0"
                              )}
                            >
                              <span className={cn(
                                "flex items-center justify-center size-6 rounded-full text-[12px] font-black transition-opacity duration-300",
                                activeMonth === month ? "bg-white text-[#3154DC]" : "bg-[#3154DC] text-white"
                              )}>
                                {selectedCount}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    <div className="events-section opacity-0 translate-y-8 bg-[#f8f9fa] rounded-[48px] rounded-tl-none p-10 md:p-16 border border-neutral-200/50 shadow-sm space-y-16 relative z-0 mt-[-1px]">
                      <div className="space-y-12">
                        <h2 className="text-2xl md:text-3xl font-medium text-gray-950">
                          Elige el país en el que te gustaría asistir
                        </h2>

                        {isLoadingEvents ? (
                          <div className="flex gap-8 overflow-hidden pb-4">
                            {[1,2,3].map(i => <div key={i} className="min-w-[320px] md:min-w-[420px]"><EventSkeleton /></div>)}
                          </div>
                        ) : (
                          <div className="relative group">
                            <div 
                              ref={scrollContainerRef}
                              className="flex gap-8 overflow-x-auto overflow-y-hidden py-10 px-4 -mx-4 scroll-smooth snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hide-scrollbar"
                              onScroll={handleScroll}
                            >
                              {events.filter(e => {
                                const m = new Date(e.start_date).toLocaleDateString('es-ES', { month: 'long' });
                                return (m.charAt(0).toUpperCase() + m.slice(1)) === activeMonth;
                              }).map((event) => (
                                <div key={event.id} className="event-card-wrapper min-w-[320px] md:min-w-[420px] snap-center">
                                  <EventCard 
                                    id={event.id}
                                    city={event.city}
                                    country={event.country}
                                    flag={event.flag}
                                    date={formatSafeDate(event.start_date)?.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }) || ""}
                                    time={event.time}
                                    duration={event.duration}
                                    location={event.location}
                                    price={event.price}
                                    bgClass={event.bg_class}
                                    selected={selectedEvents.includes(event.id)}
                                    onSelect={handleSelectEvent}
                                  />
                                </div>
                              ))}
                            </div>

                            <div className="mt-8 flex items-center gap-4 px-4">
                              <div className="h-[2px] flex-1 bg-neutral-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-[#3154DC] transition-all duration-300 ease-out rounded-full"
                                  style={{ width: `${scrollProgress}%` }}
                                />
                              </div>
                              <div className="flex gap-2.5 items-center">
                                 {availableMonths.map((month, idx) => (
                                   <button 
                                     key={idx} 
                                     onClick={() => handleMonthChange(month)}
                                     className={cn(
                                       "size-1.5 rounded-full transition-all duration-300 hover:bg-[#3154DC]/50 cursor-pointer", 
                                       activeMonth === month ? "bg-[#3154DC] scale-125 shadow-sm" : "bg-neutral-300 scale-100"
                                     )} 
                                     aria-label={`Ir a ${month}`}
                                   />
                                 ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="registration-form-container opacity-0 translate-y-8 space-y-10 pt-10 border-t border-neutral-200">
                        <h2 className="text-2xl md:text-3xl font-medium text-gray-950">Registro</h2>
                        <div className="bg-white rounded-[32px] p-8 md:p-16 shadow-lg">
                          <RegistrationForm onSubmit={handleRegistration} isLoading={isSubmitting} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="step-2 space-y-12 py-16 md:py-24 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              {/* Status Badge */}
              <div className="flex justify-center city-status-badge">
                {(() => {
                  const status = (eventStatuses[selectedCityId] || 'pending') as 'confirmed' | 'cancelled' | 'pending';
                  const configs = {
                    confirmed: { bg: 'bg-emerald-50', border: 'border-emerald-100', dot: 'bg-green-600', text: 'text-green-700', label: 'Registro confirmado' },
                    cancelled: { bg: 'bg-rose-50', border: 'border-rose-100', dot: 'bg-rose-600', text: 'text-rose-700', label: 'Registro cancelado' },
                    pending: { bg: 'bg-amber-50', border: 'border-amber-100', dot: 'bg-amber-600', text: 'text-amber-700', label: 'Revisando cupo' }
                  };
                  const config = configs[status];

                  return (
                    <div className={cn("inline-flex items-center gap-3 px-6 py-2 rounded-full border transition-all duration-500", config.bg, config.border)}>
                      <div className={cn("size-2 rounded-full", config.dot)} />
                      <span className={cn("font-semibold text-base", config.text)}>{config.label}</span>
                    </div>
                  );
                })()}
              </div>

              {/* Title & Main Message */}
              <div className="max-w-[1372px] mx-auto text-center space-y-10">
                <h2 className="text-4xl sm:text-6xl lg:text-[88px] font-extrabold tracking-tighter leading-[0.95] text-black">
                  ¡Ya estás<br />en la lista!
                </h2>
                <p className="max-w-3xl mx-auto text-base sm:text-lg md:text-xl lg:text-2xl text-gray-500 font-medium leading-relaxed px-4">
                  Te notificaremos por correo en cuanto confirmemos los cupos disponibles, te brindaremos los detalles para confirmar tu asistencia.
                </p>
              </div>

              {/* Registered In Bar - Interactive Cities */}
              <div className="max-w-[1372px] mx-auto bg-[#F5F6F9] rounded-[32px] py-4 md:py-6 px-6 md:px-8 flex flex-col items-center justify-center gap-6">
                <div className="text-[17px] md:text-[20px] font-medium text-gray-500">
                  Selecciona una ciudad para ver el estado:
                </div>
                <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
                  {events
                    .filter(e => selectedEvents.includes(e.id))
                    .map((e) => {
                      const isActive = selectedCityId === e.id;
                      const status = eventStatuses[e.id] || 'pending';
                      
                      return (
                        <button 
                          key={e.id}
                          onClick={() => {
                            if (isActive) return;
                            gsap.to(".city-status-badge, .user-data-container", { 
                              opacity: 0, 
                              y: 10, 
                              duration: 0.2, 
                              onComplete: () => {
                                setSelectedCityId(e.id);
                                gsap.to(".city-status-badge, .user-data-container", { opacity: 1, y: 0, duration: 0.4, ease: "back.out(1.7)" });
                              }
                            });
                          }}
                          className={cn(
                            "group flex items-center gap-3 px-6 py-3 rounded-2xl transition-all duration-300 border-2 cursor-pointer",
                            isActive 
                              ? "bg-white border-[#3154DC] shadow-md scale-105 z-10" 
                              : "bg-transparent border-transparent hover:bg-white/50 text-gray-400"
                          )}
                        >
                          <FlagIcon code={getFlagCode(e.title)} className="w-7 h-auto" />
                          <span className={cn(
                            "font-bold text-lg md:text-xl",
                            isActive ? "text-[#3154DC]" : "text-gray-500"
                          )}>
                            {e.city}
                          </span>
                          <div className={cn(
                            "size-2 rounded-full",
                            status === 'confirmed' ? "bg-green-500" : 
                            status === 'cancelled' ? "bg-red-500" : "bg-amber-500"
                          )} />
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* User Data Container - Figma Style */}
              <div className="max-w-[1372px] mx-auto bg-[#F5F6F9] rounded-[32px] p-8 md:p-12 lg:p-16 relative user-data-container">
                <div className="md:absolute md:top-10 md:right-10 mb-8 md:mb-0 flex justify-center md:justify-end">
                  {(() => {
                    const status = (eventStatuses[selectedCityId] || 'pending') as 'confirmed' | 'cancelled' | 'pending';
                    const configs = {
                      confirmed: { bg: 'bg-[#EBF2FF]', text: 'text-[#3154DC]', icon: <Check className="size-5" strokeWidth={3} />, label: 'Confirmado' },
                      cancelled: { bg: 'bg-rose-100', text: 'text-rose-700', icon: <span className="size-5 flex items-center justify-center font-bold">✕</span>, label: 'Cancelado' },
                      pending: { bg: 'bg-amber-100', text: 'text-amber-700', icon: <Loader2 className="size-5 animate-spin" />, label: 'Validando cupo' }
                    };
                    const config = configs[status];

                    return (
                      <div className={cn("px-5 py-2 md:px-6 md:py-2 rounded-2xl font-bold text-base md:text-lg flex items-center gap-2 transition-all duration-500", config.bg, config.text)}>
                        {config.icon}
                        {config.label}
                      </div>
                    );
                  })()}
                </div>

                {/* User Data Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 lg:gap-x-12 gap-y-8 lg:gap-y-12 pt-4 md:pt-12">
                  <div className="space-y-3">
                    <label className="text-[15px] font-medium text-slate-500">Nombre <span className="text-red-500">*</span></label>
                    <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">
                      {userData?.firstName}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[15px] font-medium text-slate-500">Apellido <span className="text-red-500">*</span></label>
                    <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">
                      {userData?.lastName}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[15px] font-medium text-slate-500">Correo electrónico <span className="text-red-500">*</span></label>
                    <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium truncate">
                      {userData?.email}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[15px] font-medium text-slate-500">País de residencia (opcional)</label>
                    <div className="h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">
                      {userData?.country || "México"}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[15px] font-medium text-slate-500">Teléfono (WhatsApp) <span className="text-red-500">*</span></label>
                    <div className="flex gap-2">
                      <div className="w-16 h-11 px-3 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">
                        {userData?.phoneCode}
                      </div>
                      <div className="flex-1 h-11 px-5 flex items-center bg-white border border-gray-200 rounded-xl text-lg text-black font-medium">
                        {userData?.phone}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-end justify-center pb-1">
                    <button className="flex items-center gap-2 text-[#00A650] font-bold text-base underline hover:opacity-80 transition-opacity">
                      <Edit3 className="size-5" />
                      Contacta a soporte para editar
                    </button>
                  </div>
                </div>
              </div>

              {/* Next Steps Section - Figma Style */}
              <div className="max-w-[1372px] mx-auto">
                <div className="relative border border-gray-200 rounded-[32px] p-8 md:p-12 lg:p-20 space-y-10 md:space-y-16 bg-white">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
                    <h3 className="text-xl md:text-[24px] font-extrabold text-black tracking-tight">¿Qué sigue?</h3>
                    <div className="px-6 py-2 bg-[#EBF2FF] text-[#3154DC] rounded-2xl font-bold text-lg">
                      3 pasos
                    </div>
                  </div>

                  {/* Step 1 */}
                  <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 text-center sm:text-left items-center sm:items-start">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="size-11 bg-[#3154DC] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#3154DC]/20">
                        <Check className="size-6" strokeWidth={3} />
                      </div>
                      <div className="hidden sm:block absolute top-11 w-0 h-40 border-l border-dashed border-[#3154DC]/40" />
                    </div>
                    <div className="space-y-2 pt-1.5">
                      <h4 className="text-lg md:text-[22px] font-bold text-black">Registro completado</h4>
                      <p className="text-base md:text-[20px] text-gray-500 font-light leading-snug">Ya estás en la lista de espera. Guardamos tu nombre, correo, teléfono y país</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 text-center sm:text-left items-center sm:items-start">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="size-11 rounded-full border-2 border-[#3154DC] bg-white" />
                      <div className="hidden sm:block absolute top-11 w-0 h-40 border-l border-dashed border-[#3154DC]/40" />
                    </div>
                    <div className="space-y-2 pt-1.5">
                      <h4 className="text-lg md:text-[22px] font-bold text-black">Responde el formulario general</h4>
                      <p className="text-base md:text-[20px] text-gray-500 font-light leading-snug">
                        <a href="#" className="text-[#3154DC] font-bold underline hover:opacity-80 transition-opacity">Ingresa aquí</a> <span className="text-gray-500">para completarlo</span>
                      </p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="relative flex flex-col sm:flex-row gap-6 sm:gap-12 text-center sm:text-left items-center sm:items-start">
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="size-11 rounded-full border-2 border-[#3154DC] bg-white" />
                    </div>
                    <div className="space-y-2 pt-1.5">
                      <h4 className="text-lg md:text-[22px] font-bold text-black">Confirmación de cupo</h4>
                      <p className="text-base md:text-[20px] text-gray-500 font-light leading-snug">Recibirás un correo electrónico confirmando que hay disponibilidad para tu asistencia y enviaremos todos los detalles para que puedas asistir.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Section - Figma Style */}
              <div className="max-w-[1372px] mx-auto bg-[#F5F6F9] rounded-[32px] p-8 md:p-12 lg:p-20">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                  <div className="space-y-3 text-center lg:text-left">
                    <h3 className="text-xl md:text-2xl font-extrabold text-black">¿Conoces a alguien que deba estar en esta reunión?</h3>
                    <p className="text-base md:text-xl text-gray-500 font-light">Comparte el link de registro con otros inversores de tu ciudad</p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full lg:w-auto">
                    <Button variant="outline" className="h-14 px-10 rounded-2xl border-[#3154DC] text-[#3154DC] font-bold text-lg md:text-xl hover:bg-[#3154DC]/10 w-full sm:w-auto">
                      Enviar por whatsapp
                    </Button>
                    <Button className="h-14 px-10 rounded-2xl bg-[#3154DC] text-white font-bold text-lg md:text-xl hover:bg-[#3154DC]/90 w-full sm:w-auto">
                      Copiar link
                    </Button>
                  </div>
                </div>
              </div>

              {/* Contact Footer Card - Figma Style */}
              <div className="max-w-[1372px] mx-auto bg-[#3154DC] rounded-[32px] py-12 md:py-16 lg:py-20 px-8 md:px-12 text-center text-white space-y-10 md:space-y-12">
                <h3 className="text-xl md:text-3xl font-bold">¿Dudas? contáctanos</h3>
                <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-8">
                  <Button variant="outline" className="h-14 md:h-16 px-8 md:px-12 rounded-2xl border-white bg-transparent text-white font-bold text-lg md:text-xl hover:bg-white/10 transition-colors w-full sm:w-auto">
                    Correo electrónico
                  </Button>
                  <Button variant="outline" className="h-14 md:h-16 px-8 md:px-12 rounded-2xl border-white bg-transparent text-white font-bold text-lg md:text-xl hover:bg-white/10 transition-colors w-full sm:w-auto">
                    Whatsapp
                  </Button>
                </div>
              </div>


              <div className="text-center py-10">
                <Button 
                  onClick={startNewRegistration}
                  variant="ghost" 
                  className="text-gray-400 hover:text-[#3154DC] font-bold"
                >
                  Nuevo registro / Salir
                </Button>
              </div>
            </div>
          )}
        </main>
      </TooltipProvider>
    </div>
  );
}

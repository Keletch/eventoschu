"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getEvents } from "@/app/actions/events";
import { trackGTMEvent } from "@/lib/gtm-utils";
import { getRegistrationsCount } from "@/app/actions/admin-registration";
import { createRegistration, checkRegistration, updateEventSpecificData } from "@/app/actions/user-registration";
import { getEventUIConfig } from "@/lib/event-config";
import { getContactTagsByEmail } from "@/app/actions/keap";

import { getDisplayData } from "@/components/home/utils/home-constants";

// Constants for LocalStorage keys to avoid typos (SOLID: Single Source of Truth)
export const HOME_STORAGE_KEY = 'chu_registration';
export const HOME_STEP_KEY = 'chu_active_step';

export function useHomeLogic(initialEvents: any[] = []) {
  const { user, isSignedIn, isLoaded } = useUser();

  // --- States ---
  const [step, setStep] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>(initialEvents);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [userKeapTags, setUserKeapTags] = useState<string[]>([]);
  const [isSSOOnboardingOpen, setIsSSOOnboardingOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(initialEvents.length === 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("Todos");
  const [activeMonth, setActiveMonth] = useState("");
  const [activeTag, setActiveTag] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [eventStatuses, setEventStatuses] = useState<Record<string, string>>({});
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [eventDataMap, setEventDataMap] = useState<Record<string, any>>({});
  const [surveyData, setSurveyData] = useState<any>(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [selectedCityId, _setSelectedCityId] = useState<string>("");
  const setSelectedCityId = useCallback((valOrFn: string | ((prev: string) => string)) => {
    _setSelectedCityId((prev) => {
      const nextId = typeof valOrFn === "function" ? valOrFn(prev) : valOrFn;
      if (nextId) {
        try {
          const saved = localStorage.getItem(HOME_STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            parsed.selectedCityId = nextId;
            localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify(parsed));
          }
        } catch (_e) {}
      }
      return nextId;
    });
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Derivación de datos centralizada
  const displayData = useMemo(() => 
    getDisplayData(userData, eventDataMap, selectedCityId),
  [userData, eventDataMap, selectedCityId]);

  // Refs for realtime comparison (avoiding closures issues in callbacks)
  const eventStatusesRef = useRef(eventStatuses);
  const eventDataMapRef = useRef(eventDataMap);
  const userDataRef = useRef(userData);
  const selectedEventsRef = useRef(selectedEvents);
  const surveyDataRef = useRef(surveyData);
  const userRef = useRef(user);

  useEffect(() => {
    eventStatusesRef.current = eventStatuses;
    eventDataMapRef.current = eventDataMap;
    userDataRef.current = userData;
    selectedEventsRef.current = selectedEvents;
    surveyDataRef.current = surveyData;
    userRef.current = user;
  }, [eventStatuses, eventDataMap, userData, selectedEvents, surveyData, user]);

  // 🏷️ Obtener tags del usuario en Keap CRM al iniciar sesión o gestionar temporales
  useEffect(() => {
    let active = true;
    let timerId: NodeJS.Timeout | null = null;

    const fetchTags = async () => {
      if (isSignedIn && user) {
        const emails = user.emailAddresses
          .filter((ea: any) => ea.verification?.status === "verified")
          .map((ea: any) => ea.emailAddress.toLowerCase().trim());
        
        const allTags = new Set<string>();
        for (const email of emails) {
          const res = await getContactTagsByEmail(email);
          if (!active) return;
          if (res.success && res.tags) {
            res.tags.forEach((tagId: string) => allTags.add(tagId));
          }
        }
        if (active) {
          setUserKeapTags(Array.from(allTags));
        }
      } else {
        // Si no está logueado, intentar cargar la verificación temporal de Keap
        const cached = localStorage.getItem("chu_temp_keap_tags");
        if (cached) {
          try {
            const { tags, expiresAt } = JSON.parse(cached);
            if (Date.now() < expiresAt) {
              if (active) {
                setUserKeapTags(tags);
                
                // Programar autolimpieza para el tiempo restante
                const remaining = expiresAt - Date.now();
                timerId = setTimeout(() => {
                  if (active) {
                    setUserKeapTags([]);
                    localStorage.removeItem("chu_temp_keap_tags");
                    toast.info("La vinculación temporal de tu membresía ha finalizado por seguridad.");
                  }
                }, remaining);
              }
            } else {
              localStorage.removeItem("chu_temp_keap_tags");
              if (active) setUserKeapTags([]);
            }
          } catch (_e) {
            localStorage.removeItem("chu_temp_keap_tags");
          }
        } else {
          if (active) setUserKeapTags([]);
        }
      }
    };
    fetchTags();

    return () => {
      active = false;
      if (timerId) {
        clearTimeout(timerId);
      }
    };
  }, [isSignedIn, user]);

  // Envoltura personalizada para guardar los tags temporales con expiración (5 minutos)
  const setTemporaryKeapTags = useCallback((tags: string[] | ((prev: string[]) => string[])) => {
    setUserKeapTags((prev) => {
      const nextTags = typeof tags === "function" ? tags(prev) : tags;
      if (!isSignedIn) {
        if (nextTags.length > 0) {
          const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutos
          localStorage.setItem("chu_temp_keap_tags", JSON.stringify({ tags: nextTags, expiresAt }));
        } else {
          localStorage.removeItem("chu_temp_keap_tags");
        }
      }
      return nextTags;
    });
  }, [isSignedIn]);

  // 🚀 Mostrar modal de bienvenida sobre SSO una sola vez
  useEffect(() => {
    if (isPageReady) {
      const dismissed = localStorage.getItem("chu_onboarding_dismissed");
      if (!dismissed) {
        setIsSSOOnboardingOpen(true);
      }
    }
  }, [isPageReady]);

  // --- Helpers ---
  const changeStep = useCallback((newStep: number | null) => {
    setStep(newStep);
    if (newStep !== null) {
      localStorage.setItem(HOME_STEP_KEY, newStep.toString());
    } else {
      localStorage.removeItem(HOME_STEP_KEY);
    }
  }, []);

  // 🔄 Restauración del scroll: Siempre arriba al cambiar de paso (Instantáneo)
  useEffect(() => {
    if (step !== null) {
      window.scrollTo(0, 0);
    }
  }, [step]);

  // --- Memos de Filtrado ---
  const availableCategories = useMemo(() => {
    // Solo consideramos categorías de eventos que estén ACTIVOS
    const activeEvents = events.filter(e => e.active !== false);
    const cats = activeEvents.map(e => {
      // Si tiene parent, el category principal es el parent. Si no, es la categoría misma.
      return e.categories?.parent_category ? e.categories.parent_category.name : e.categories?.name;
    }).filter(Boolean);
    
    const uniqueCats = Array.from(new Set(cats));

    return ["Todos", ...uniqueCats];
  }, [events]);

  const availableCategoryIcons = useMemo(() => {
    const icons: Record<string, string> = { "Todos": "Calendar" };
    events.filter(e => e.active !== false).forEach(e => {
      const parentName = e.categories?.parent_category?.name;
      const parentIcon = e.categories?.parent_category?.icon;
      const selfName = e.categories?.name;
      const selfIcon = e.categories?.icon;

      if (parentName && parentIcon) icons[parentName] = parentIcon;
      if (selfName && selfIcon) icons[selfName] = selfIcon;
    });
    return icons;
  }, [events]);

  const availableSubcategories = useMemo(() => {
    if (activeCategory === "Todos") return [];
    const activeEvents = events.filter(e => e.active !== false);

    // Obtenemos todos los eventos que pertenecen a esta macro-categoría
    const eventsInCat = activeEvents.filter(e => {
      const mainCatName = e.categories?.parent_category ? e.categories.parent_category.name : e.categories?.name;
      return mainCatName === activeCategory;
    });

    // Filtramos para sacar solo los que tienen una subcategoría explícita
    const subcats = eventsInCat
      .filter(e => e.categories?.parent_category) // Solo los que son hijos
      .map(e => e.categories?.name) // El nombre de la subcategoría
      .filter(Boolean);
      
    if (subcats.length === 0) return [];
    return ["Todos", ...Array.from(new Set(subcats))];
  }, [events, activeCategory]);

  const availableTags = useMemo(() => {
    const tagsMap = new Map<string, { id: string, name: string, slug: string, color_hex: string }>();
    events.filter(e => e.active !== false).forEach(e => {
      e.event_tags?.forEach((et: any) => {
        if (et.tags) {
          tagsMap.set(et.tags.id, et.tags);
        }
      });
    });
    return Array.from(tagsMap.values());
  }, [events]);

  const filteredEventsByCategory = useMemo(() => {
    const activeEvents = events.filter(e => e.active !== false);
    
    // 1. Filtro por Búsqueda (Texto)
    let filtered = activeEvents;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => {
        const title = (e.title || "").toLowerCase();
        const city = (e.city || "").toLowerCase();
        const country = (e.country || "").toLowerCase();
        const location = (e.location || "").toLowerCase();
        return title.includes(query) || city.includes(query) || country.includes(query) || location.includes(query);
      });
    }

    // 2. Filtro por Categoría
    if (activeCategory !== "Todos") {
      filtered = filtered.filter(e => {
        const mainCatName = e.categories?.parent_category ? e.categories.parent_category.name : e.categories?.name;
        return mainCatName === activeCategory;
      });
    }

    // 3. Filtro por Sub-Categoría
    if (activeSubcategory !== "Todos") {
      filtered = filtered.filter(e => e.categories?.name === activeSubcategory);
    }

    // 4. Filtro por Etiqueta (Tags)
    if (activeTag !== "Todos") {
      filtered = filtered.filter(e => 
        e.event_tags?.some((et: any) => et.tags?.id === activeTag)
      );
    }

    return filtered;
  }, [events, searchQuery, activeCategory, activeSubcategory, activeTag]);

  const filteredEvents = useMemo(() => {
    if (!activeMonth) return filteredEventsByCategory;
    return filteredEventsByCategory.filter(e => {
      const d = new Date(e.start_date);
      let label = "";
      if (d.getFullYear() === 2099) label = "Eventos Futuros";
      else {
        const m = d.toLocaleDateString("es-ES", { month: "long" });
        label = m.charAt(0).toUpperCase() + m.slice(1);
      }
      return label === activeMonth;
    });
  }, [filteredEventsByCategory, activeMonth]);

  const availableMonths = useMemo(() => {
    const monthsSet = new Set<string>();
    let hasFutureEvents = false;

    filteredEventsByCategory.forEach(e => {
      const d = new Date(e.start_date);
      if (d.getFullYear() === 2099) {
        hasFutureEvents = true;
      } else {
        const m = d.toLocaleDateString('es-ES', { month: 'long' });
        monthsSet.add(m.charAt(0).toUpperCase() + m.slice(1));
      }
    });

    const months = Array.from(monthsSet);
    if (hasFutureEvents) {
      months.push("Eventos Futuros");
    }
    return months;
  }, [filteredEventsByCategory]);

  const prevCategoryRef = useRef(activeCategory);

  // Reset subcategory ONLY when main category changes (skipping initial mount / URL hydration)
  useEffect(() => {
    if (isLoadingEvents) {
      prevCategoryRef.current = activeCategory;
      return;
    }
    if (prevCategoryRef.current !== activeCategory) {
      setActiveSubcategory("Todos");
      prevCategoryRef.current = activeCategory;
    }
  }, [activeCategory, isLoadingEvents]);

  // Adjust active month when availableMonths changes. If selected month is no longer available, reset to empty (all months).
  useEffect(() => {
    const timer = setTimeout(() => {
      if (activeMonth !== "" && !availableMonths.includes(activeMonth)) {
        setActiveMonth("");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [availableMonths, activeMonth]);

  // 🔄 Efecto para sincronizar el estado de carga global con CustomEvents
  useEffect(() => {
    const isLoading = step === null || isLoadingEvents || isTransitioning || isSubmitting || isChecking;
    
    if (isLoading) {
      window.dispatchEvent(new CustomEvent("app-loading-start"));
    } else {
      window.dispatchEvent(new CustomEvent("app-loading-stop"));
    }
  }, [step, isLoadingEvents, isTransitioning, isSubmitting, isChecking]);

  // --- Initial Data Fetching ---
  const fetchData = useCallback(async () => {
    setIsPageReady(true);
    try {
      const [eventsRes, countsRes] = await Promise.all([
        getEvents(),
        getRegistrationsCount()
      ]);

      if (eventsRes.success && eventsRes.data) {
        setEvents(eventsRes.data);
      }

      if (countsRes.success && countsRes.data) {
        setEventCounts(countsRes.data);
      }

      const params = new URLSearchParams(window.location.search);

      // Handle referral link
      const cityId = params.get('city');
      if (cityId && eventsRes.data) {
        const event = (eventsRes.data as any[]).find(e => e.id === cityId);
        if (event) {
          setSelectedCityId(cityId);
          setSelectedEvents([cityId]);
          const date = new Date(event.start_date);
          const month = date.toLocaleDateString('es-ES', { month: 'long' });
          setActiveMonth(month.charAt(0).toUpperCase() + month.slice(1));
        }
      }

      // Parse and apply URL filters (?filter=giras&Mayo&Pago or similar)
      if (eventsRes.data && eventsRes.data.length > 0) {
        const allQueryTerms: string[] = [];
        params.forEach((value, key) => {
          if (value) {
            value.split(/[\s,]+/).forEach(v => allQueryTerms.push(v.toLowerCase().replace(/_/g, ' ')));
          }
          if (key && key !== 'city' && key !== 'filter') {
            allQueryTerms.push(key.toLowerCase().replace(/_/g, ' '));
          }
        });

        const activeEvents = (eventsRes.data as any[]).filter(e => e.active !== false);

        // 1. Match category & subcategory
        const uniqueCats = Array.from(new Set(activeEvents.map(e => {
          return e.categories?.parent_category ? e.categories.parent_category.name : e.categories?.name;
        }).filter(Boolean))) as string[];

        const matchedCat = uniqueCats.find(cat => 
          allQueryTerms.includes(cat.toLowerCase())
        );
        if (matchedCat) {
          setActiveCategory(matchedCat);

          // Buscar subcategoría correspondiente bajo la categoría principal
          const eventsInCat = activeEvents.filter(e => {
            const mainCatName = e.categories?.parent_category ? e.categories.parent_category.name : e.categories?.name;
            return mainCatName === matchedCat;
          });
          const uniqueSubcats = Array.from(new Set(eventsInCat
             .filter(e => e.categories?.parent_category)
             .map(e => e.categories?.name)
             .filter(Boolean))) as string[];

          const matchedSubcat = uniqueSubcats.find(subcat => 
            allQueryTerms.includes(subcat.toLowerCase())
          );
          if (matchedSubcat) {
            setActiveSubcategory(matchedSubcat);
          }
        }

        // 2. Match month
        const monthsSet = new Set<string>();
        let hasFutureEvents = false;
        activeEvents.forEach(e => {
          const d = new Date(e.start_date);
          if (d.getFullYear() === 2099) {
            hasFutureEvents = true;
          } else {
            const m = d.toLocaleDateString('es-ES', { month: 'long' });
            monthsSet.add(m.charAt(0).toUpperCase() + m.slice(1));
          }
        });
        const possibleMonths = Array.from(monthsSet);
        if (hasFutureEvents) possibleMonths.push("Eventos Futuros");

        const matchedMonth = possibleMonths.find(m => 
          allQueryTerms.includes(m.toLowerCase())
        );
        if (matchedMonth) {
          setActiveMonth(matchedMonth);
        }

        // 3. Match tag
        const tagsMap = new Map<string, { id: string, name: string, slug: string }>();
        activeEvents.forEach(e => {
          e.event_tags?.forEach((et: any) => {
            if (et.tags) {
              tagsMap.set(et.tags.id, et.tags);
            }
          });
        });
        const possibleTags = Array.from(tagsMap.values());
        const matchedTag = possibleTags.find(tag => 
          allQueryTerms.includes(tag.name.toLowerCase()) || allQueryTerms.includes(tag.slug.toLowerCase())
        );
        if (matchedTag) {
          setActiveTag(matchedTag.id);
        }
      }
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // Dynamically update URL query parameters based on active filters for easy sharing
  useEffect(() => {
    if (!isPageReady || isLoadingEvents) return;

    // Preservar parámetros no relacionados como 'city' (referencia)
    const currentParams = new URLSearchParams(window.location.search);
    const cityId = currentParams.get('city');

    const filterTerms: string[] = [];
    
    if (activeCategory !== "Todos") {
      filterTerms.push(activeCategory.toLowerCase().replace(/\s+/g, '_'));
    }

    if (activeSubcategory !== "Todos") {
      filterTerms.push(activeSubcategory.toLowerCase().replace(/\s+/g, '_'));
    }
    
    if (activeMonth) {
      filterTerms.push(activeMonth.toLowerCase().replace(/\s+/g, '_'));
    }
    
    if (activeTag !== "Todos") {
      const activeTagObj = availableTags.find(t => t.id === activeTag);
      if (activeTagObj) {
        filterTerms.push(activeTagObj.name.toLowerCase().replace(/\s+/g, '_'));
      }
    }

    // Construir la Query string de forma manual limpia sin acumulación recursiva
    const queryParts: string[] = [];

    if (cityId) {
      queryParts.push(`city=${encodeURIComponent(cityId)}`);
    }

    if (filterTerms.length > 0) {
      // El primero entra como ?filter=valor
      queryParts.push(`filter=${encodeURIComponent(filterTerms[0])}`);
      // Los siguientes entran como flags puros sin '=' (ej. &Mayo&Pago)
      filterTerms.slice(1).forEach(term => {
        queryParts.push(encodeURIComponent(term));
      });
    }

    const queryString = queryParts.length > 0 ? '?' + queryParts.join('&') : '';
    const newRelativePathQuery = window.location.pathname + queryString;
    window.history.replaceState(null, '', newRelativePathQuery);
  }, [activeCategory, activeSubcategory, activeMonth, activeTag, isPageReady, isLoadingEvents, availableTags]);

  const startNewRegistration = useCallback(() => {
    localStorage.removeItem(HOME_STORAGE_KEY);
    // 🎯 En lugar de remover el paso, lo fijamos en 1 para que sea persistente tras recarga
    changeStep(1); 
    setUserData(null);
    setSelectedEvents([]);
    setEventStatuses({});
    setEventDataMap({});
    setSelectedCityId("");
    setIsCheckMode(false);
  }, [changeStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  // --- Hydration & Sync Logic ---
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeStep = localStorage.getItem(HOME_STEP_KEY);
      const saved = localStorage.getItem(HOME_STORAGE_KEY);
      
      // 🧠 Limpieza proactiva: Si Clerk terminó de cargar y no hay sesión, 
      // pero tenemos datos en localStorage de una sesión previa, limpiamos.
      if (isLoaded && !isSignedIn && saved) {
        const parsed = JSON.parse(saved);
        if (parsed.userData?.clerk_id) { // Solo si los datos pertenecían a un usuario logueado
          startNewRegistration();
          return;
        }
      }

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setUserData(parsed.userData);
          setSelectedEvents(parsed.selectedEvents || []);
          setEventStatuses(parsed.eventStatuses || {});
          setEventDataMap(parsed.eventDataMap || {});
          setSurveyData(parsed.surveyData || null);
          const evList = parsed.selectedEvents || [];
          // Si hay un previo válido en los eventos del usuario, usarlo; sino el más reciente (primero)
          const initialCityId = (parsed.selectedCityId && evList.includes(parsed.selectedCityId))
            ? parsed.selectedCityId
            : (evList[0] || "");
          if (initialCityId) {
            setSelectedCityId(initialCityId);
          }
        } catch (_e) {}
      }

      if (activeStep) {
        setStep(parseInt(activeStep));
      } else if (saved) {
        setStep(2);
      } else {
        setStep(1);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoaded, isSignedIn, startNewRegistration]);

  const syncRegistration = useCallback(async () => {
    if (!isLoaded) return;
    
    const saved = localStorage.getItem(HOME_STORAGE_KEY);
    const clerkEmail = userRef.current?.primaryEmailAddress?.emailAddress;
    let emailToVerify = clerkEmail;

    if (clerkEmail) {
      emailToVerify = clerkEmail;
    } else if (saved) {
      try {
        const { userData: savedData } = JSON.parse(saved);
        emailToVerify = savedData?.email;
      } catch (_e) {}
    }

    if (emailToVerify) {
      try {
        const result = await checkRegistration(emailToVerify, userRef.current?.id);
        if (result.success) {
          const statuses = (result as any).eventStatuses || {};
          const dataMap = (result as any).eventData || {};
          const survey = (result as any).surveyData || null;

          // PRIORIDAD: El nombre de Clerk manda sobre el de Supabase para mantenerlo actualizado
          const finalFirstName = userRef.current?.firstName || result.userData.first_name;
          const finalLastName = userRef.current?.lastName || result.userData.last_name;

          // Mapeo profesional de datos para el formulario y el sistema de notificaciones
          const sanitizedUserData = {
            id: result.userData.id,
            firstName: finalFirstName,
            lastName: finalLastName,
            email: result.userData.email,
            phone: result.userData.phone,
            phoneCode: result.userData.phone_code,
            country: result.userData.residence_country,
            // Mantener el resto de campos por si acaso
            ...result.userData
          };

          // Evitar actualizaciones si los datos son idénticos para prevenir ráfagas de carga
          if (JSON.stringify(sanitizedUserData) !== JSON.stringify(userDataRef.current)) {
            setUserData(sanitizedUserData);
          }
          
            // 🛡️ BLINDAJE TOTAL: Si el usuario está en el Paso 1, RESPETARLO.
            // No importa si Clerk dice que ya está registrado, si él quiere estar en el 1, se queda en el 1.
            const activeStep = localStorage.getItem(HOME_STEP_KEY);
            
            if (activeStep === '1') {
              // Aún así sincronizamos los datos en segundo plano para que el State sea correcto
              if (JSON.stringify(sanitizedUserData) !== JSON.stringify(userDataRef.current)) setUserData(sanitizedUserData);
              return; 
            }

            if (result.selectedEvents?.length > 0) {
              if (JSON.stringify(result.selectedEvents) !== JSON.stringify(selectedEventsRef.current)) {
                setSelectedEvents(result.selectedEvents || []);
              }
              if (JSON.stringify(statuses) !== JSON.stringify(eventStatusesRef.current)) {
                setEventStatuses(statuses);
              }
              if (JSON.stringify(dataMap) !== JSON.stringify(eventDataMapRef.current)) {
                setEventDataMap(dataMap);
              }
              if (JSON.stringify(survey) !== JSON.stringify(surveyDataRef.current)) {
                setSurveyData(survey);
              }
              
              if (result.selectedEvents?.length > 0) {
                // Si hay un previo válido en la lista, conservarlo; de lo contrario seleccionar el más reciente (primero)
                setSelectedCityId(prev => {
                  if (prev && result.selectedEvents.includes(prev)) return prev;
                  return result.selectedEvents[0];
                });
              }
              
              // Solo forzamos Paso 2 si NO hay un paso definido o si estamos en el 2
              if (!activeStep || activeStep === '2') {
                changeStep(2);
              }
            }

          const currentSaved = localStorage.getItem(HOME_STORAGE_KEY);
          let prevSavedCityId = "";
          try {
            if (currentSaved) prevSavedCityId = JSON.parse(currentSaved).selectedCityId;
          } catch (_e) {}

          const effectiveCityId = (prevSavedCityId && result.selectedEvents?.includes(prevSavedCityId))
            ? prevSavedCityId
            : (result.selectedEvents?.[0] || "");

          localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
            userData: sanitizedUserData,
            selectedEvents: result.selectedEvents,
            selectedCityId: effectiveCityId,
            eventStatuses: statuses,
            eventDataMap: dataMap,
            surveyData: survey
          }));
        } else {
          localStorage.removeItem(HOME_STORAGE_KEY);
          localStorage.removeItem(HOME_STEP_KEY);
          setStep(1);
        }
      } catch (err) {
        console.error('Sync error:', err);
        if (!saved) setStep(1);
      }
    } else {
      setStep(1);
    }
  }, [isLoaded, changeStep]);

  useEffect(() => {
    const timer = setTimeout(() => {
      syncRegistration();
    }, 0);
    return () => clearTimeout(timer);
  }, [isLoaded, user?.id, syncRegistration]);

  // --- Handlers ---
  const revalidateStatus = useCallback(async (email: string) => {
    setIsChecking(true);
    setSurveyData(null);
    try {
      const revalidation = await checkRegistration(email, user?.id);
      if (revalidation.success) {
        // Mantener prioridad de Clerk
        const finalUserData = {
          ...revalidation.userData,
          firstName: user?.firstName || revalidation.userData.first_name,
          lastName: user?.lastName || revalidation.userData.last_name,
        };

        setUserData(finalUserData);
        setSelectedEvents(revalidation.selectedEvents);
        setEventStatuses((revalidation as any).eventStatuses || {});
        setEventDataMap((revalidation as any).eventData || {});
        
        const currentSurvey = (revalidation as any).surveyData;
        const hasContent = currentSurvey && typeof currentSurvey === 'object' && Object.keys(currentSurvey).length > 0;
        const validSurvey = hasContent ? currentSurvey : null;
        setSurveyData(validSurvey);

        localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
          userData: revalidation.userData,
          selectedEvents: revalidation.selectedEvents,
          selectedCityId: revalidation.selectedEvents?.[0] || "",
          eventStatuses: (revalidation as any).eventStatuses || {},
          eventDataMap: (revalidation as any).eventData || {},
          surveyData: validSurvey
        }));

        if (revalidation.selectedEvents?.length > 0) {
          setSelectedCityId(prev => prev || revalidation.selectedEvents[0]);
        }
        changeStep(2);
      } else {
        toast.error("No encontramos registros activos vinculados a tu cuenta.");
      }
    } catch (err) {
      console.error('Revalidation error:', err);
    } finally {
      setIsChecking(false);
    }
  }, [user, changeStep]);

  const handleRegistration = async (data: any, turnstileToken: string): Promise<{ success: boolean }> => {
    if (selectedEvents.length === 0) {
      toast.error("Por favor selecciona al menos una gira.");
      return { success: false };
    }

    setIsSubmitting(true);
    try {
      const regResult = await createRegistration({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        phone_code: data.phoneCode,
        residence_country: data.country,
        selected_events: selectedEvents,
      }, turnstileToken);

      if (!regResult.success) {
        throw new Error(regResult.error);
      }

      // 🎯 Redirección pura para lista de espera externa sin registro local (abrir en pestaña nueva)
      if ((regResult as any).pureRedirect && (regResult as any).redirectUrl) {
        window.open((regResult as any).redirectUrl, "_blank", "noopener,noreferrer");
        return { success: true, pureRedirect: true } as any;
      }

      // 🧠 Usar el orquestador de eventos para el mensaje de éxito
      const firstEventId = selectedEvents[0];
      const eventInfo = events.find(e => e.id === firstEventId);
      const _eventConfig = getEventUIConfig(eventInfo);

      // 💡 NOTA: El toast de éxito ahora se maneja centralizadamente vía Realtime/Notification
      // para evitar duplicidad y mantener consistencia con el sistema premium.
      
      const finalStatuses = (regResult as any).eventStatuses || {};
      const finalEventData = (regResult as any).eventData || {};
      const finalSurvey = (regResult as any).surveyData || null;
      const finalSelectedEvents = (regResult as any).mergedEvents || selectedEvents;

      const newUser = {
        ...data,
        id: (regResult as any).id
      };

      // 🎯 Inteligencia de selección: Priorizar el evento que se acaba de añadir
      const oldSelectedEvents = userData?.selectedEvents || [];
      const newlyAddedId = selectedEvents.find(id => !oldSelectedEvents.includes(id));
      
      // Si es un registro nuevo (invitado), seleccionamos el primero de su lista
      // Si es una actualización, seleccionamos específicamente el NUEVO
      const idToSelect = newlyAddedId || selectedEvents[0] || finalSelectedEvents[0];

      setUserData(newUser);
      setEventStatuses(finalStatuses);
      setEventDataMap(finalEventData);
      setSurveyData(finalSurvey);
      
      if (idToSelect) {
        setSelectedCityId(idToSelect);
      }

      localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
        userData: newUser,
        selectedEvents: finalSelectedEvents,
        selectedCityId: idToSelect || "",
        eventStatuses: finalStatuses,
        eventDataMap: finalEventData,
        surveyData: finalSurvey
      }));

      window.dispatchEvent(new Event('registration-success'));
      trackGTMEvent("registration_completed");

      return { 
        success: true,
        checkoutRedirectUrl: (regResult as any).checkoutRedirectUrl || null
      } as any; 
    } catch (error: any) {
      toast.error(error.message || "Error al procesar el registro");
      return { success: false };
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
      const result = await checkRegistration(email, user?.id);
      if (result.success) {
        const statuses = (result as any).eventStatuses || {};
        const eventData = (result as any).eventData || {};
        setUserData(result.userData);
        setSelectedEvents(result.selectedEvents);
        setEventStatuses(statuses);
        setEventDataMap(eventData);
        setSurveyData((result as any).surveyData || null);
        const cityToSelect = result.selectedEvents?.[0] || "";
        if (cityToSelect) {
          setSelectedCityId(cityToSelect);
        }

        localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
          userData: result.userData,
          selectedEvents: result.selectedEvents,
          selectedCityId: cityToSelect,
          eventStatuses: statuses,
          eventDataMap: eventData,
          surveyData: (result as any).surveyData || null
        }));

        changeStep(2);
        toast.success("Registro encontrado");
      } else {
        // 🛡️ Si falla o no tiene eventos, limpiamos por seguridad
        startNewRegistration();
        toast.error(result.error || "No se encontró registro.");
      }
    } catch (_error: any) {
      toast.error("Error al consultar el registro.");
    } finally {
      setIsChecking(false);
    }
  };

  const handleUpdateRegistration = async () => {
    const currentEventData = eventDataMap[selectedCityId];
    const displayData = {
      firstName: editFormData.firstName,
      lastName: editFormData.lastName,
      email: currentEventData?.email || userData?.email || "",
      phone: editFormData.phone,
      phoneCode: currentEventData?.phone_code || userData?.phoneCode || "",
      country: editFormData.country
    };

    setIsSubmitting(true);
    try {
      const result = await updateEventSpecificData(displayData.email, selectedCityId, {
        first_name: editFormData.firstName,
        last_name: editFormData.lastName,
        phone: editFormData.phone,
        residence_country: editFormData.country,
      });

      if (result.success) {
        toast.success(`Información actualizada`);
        setIsEditing(false);
        await revalidateStatus(displayData.email);
      } else {
        throw new Error(result.error);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * 🔄 Orquestador de Sincronización Realtime (Full State)
   */
  const syncRegistrationData = useCallback((payload: any) => {
    if (!payload) return;

    // A. Manejo de Purga o Usuario sin eventos
    if (payload.selected_events && payload.selected_events.length === 0) {
      startNewRegistration();
      return;
    }

    // B. Sincronización de lista de eventos y carrusel
    if (payload.selected_events) {
      setSelectedEvents(payload.selected_events);
      if (!payload.selected_events.includes(selectedCityId)) {
        setSelectedCityId(payload.selected_events[0]);
      }
    }

    // C. Sincronización de Estados (Pendiente/Confirmado)
    if (payload.event_statuses) {
      setEventStatuses(prev => ({ ...prev, ...payload.event_statuses }));
    }

    // D. Sincronización de Datos Específicos
    if (payload.event_data) {
      setEventDataMap(prev => ({ ...prev, ...payload.event_data }));
    }

    // E. Actualización de Datos de Usuario (Perfil)
    if (payload.userData || payload.email) {
      setUserData((prev: any) => ({ ...prev, ...(payload.userData || payload) }));
    }

    // F. Persistencia en LocalStorage para consistencia
    const saved = localStorage.getItem(HOME_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const updatedEvents = payload.selected_events || parsed.selectedEvents;
        const currentCityId = parsed.selectedCityId && updatedEvents?.includes(parsed.selectedCityId)
          ? parsed.selectedCityId
          : (updatedEvents?.[0] || "");

        localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
          ...parsed,
          selectedEvents: updatedEvents,
          selectedCityId: currentCityId,
          eventStatuses: payload.event_statuses ? { ...parsed.eventStatuses, ...payload.event_statuses } : parsed.eventStatuses,
          eventDataMap: payload.event_data ? { ...parsed.eventDataMap, ...payload.event_data } : parsed.eventDataMap,
          userData: (payload.userData || payload.email) ? { ...parsed.userData, ...(payload.userData || payload) } : parsed.userData
        }));
      } catch (_e) {}
    }
  }, [selectedCityId, startNewRegistration]);

  const resetAllFilters = useCallback(() => {
    setSearchQuery("");
    setActiveCategory("Todos");
    setActiveSubcategory("Todos");
    setActiveMonth("");
    setActiveTag("Todos");
  }, []);

  return {
    // States
    step, setStep: changeStep,
    events, setEvents,
    selectedEvents, setSelectedEvents,
    userData, setUserData,
    userKeapTags,
    isSSOOnboardingOpen,
    setIsSSOOnboardingOpen,
    isLoadingEvents,
    isSubmitting,
    activeMonth, setActiveMonth,
    searchQuery, setSearchQuery,
    isTransitioning, setIsTransitioning,
    isPageReady,
    isChecking,
    isCheckMode, setIsCheckMode,
    eventStatuses, setEventStatuses,
    eventStatusesRef,
    selectedCityId, setSelectedCityId,
    eventCounts, setEventCounts,
    eventDataMap, setEventDataMap,
    eventDataMapRef,
    surveyData, setSurveyData,
    isSurveyOpen, setIsSurveyOpen,
    isEditing, setIsEditing,
    editFormData, setEditFormData,
    
    // Auth
    user, isSignedIn, isLoaded, isRegistered: !!userData,
    displayData,
    setUserKeapTags: setTemporaryKeapTags,

    // Handlers
    fetchData,
    revalidateStatus,
    syncRegistrationData, // 🚀 Orquestador robusto expuesto para RT
    handleRegistration,
    handleCheckRegistration,
    startNewRegistration,
    handleUpdateRegistration,
    availableMonths,
    activeCategory,
    setActiveCategory,
    activeSubcategory,
    setActiveSubcategory,
    activeTag,
    setActiveTag,
    availableCategories,
    availableCategoryIcons,
    availableSubcategories,
    availableTags,
    resetAllFilters,
    filteredEvents
  };
}

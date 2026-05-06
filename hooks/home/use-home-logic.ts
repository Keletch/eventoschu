"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { getEvents } from "@/app/actions/events";
import { getRegistrationsCount } from "@/app/actions/admin-registration";
import { createRegistration, checkRegistration, updateEventSpecificData } from "@/app/actions/user-registration";
import { getEventUIConfig } from "@/lib/event-config";

import { getDisplayData } from "@/components/home/utils/home-constants";

// Constants for LocalStorage keys to avoid typos (SOLID: Single Source of Truth)
export const HOME_STORAGE_KEY = 'chu_registration';
export const HOME_STEP_KEY = 'chu_active_step';

export function useHomeLogic() {
  const { user, isSignedIn, isLoaded } = useUser();

  // --- States ---
  const [step, setStep] = useState<number | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("Todos");
  const [activeMonth, setActiveMonth] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPageReady, setIsPageReady] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isCheckMode, setIsCheckMode] = useState(false);
  const [eventStatuses, setEventStatuses] = useState<Record<string, string>>({});
  const [eventCounts, setEventCounts] = useState<Record<string, number>>({});
  const [eventDataMap, setEventDataMap] = useState<Record<string, any>>({});
  const [surveyData, setSurveyData] = useState<any>(null);
  const [isSurveyOpen, setIsSurveyOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>(null);

  // Derivación de datos centralizada
  const displayData = useMemo(() => 
    getDisplayData(userData, eventDataMap, selectedCityId),
  [userData, eventDataMap, selectedCityId]);

  // Refs for realtime comparison (avoiding closures issues in callbacks)
  const eventStatusesRef = useRef(eventStatuses);
  const eventDataMapRef = useRef(eventDataMap);

  useEffect(() => {
    eventStatusesRef.current = eventStatuses;
    eventDataMapRef.current = eventDataMap;
  }, [eventStatuses, eventDataMap]);

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
    const cats = events.map(e => e.categories?.name).filter(Boolean);
    return ["Todos", ...Array.from(new Set(cats))];
  }, [events]);

  const filteredEventsByCategory = useMemo(() => {
    if (activeCategory === "Todos") return events;
    return events.filter(e => e.categories?.name === activeCategory);
  }, [events, activeCategory]);

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

  // Reset active month when category changes
  useEffect(() => {
    if (availableMonths.length > 0) {
      // Intentar mantener el mes si existe en la nueva categoría, si no, ir al primero
      if (!availableMonths.includes(activeMonth)) {
        setActiveMonth(availableMonths[0]);
      }
    } else {
      setActiveMonth("");
    }
  }, [activeCategory, availableMonths]);

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
        if (eventsRes.data.length > 0 && !activeMonth) {
          const firstDate = new Date(eventsRes.data[0].start_date);
          const firstMonth = firstDate.toLocaleDateString('es-ES', { month: 'long' });
          setActiveMonth(firstMonth.charAt(0).toUpperCase() + firstMonth.slice(1));
        }
      }

      if (countsRes.success && countsRes.data) {
        setEventCounts(countsRes.data);
      }

      // Handle referral link
      const params = new URLSearchParams(window.location.search);
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
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setIsLoadingEvents(false);
    }
  }, [activeMonth]);

  useEffect(() => {
    fetchData();
  }, []);

  // --- Hydration & Sync Logic ---
  useEffect(() => {
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

    if (activeStep === '1') {
      setStep(1);
    } else if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUserData(parsed.userData);
        setSelectedEvents(parsed.selectedEvents);
        setEventStatuses(parsed.eventStatuses || {});
        setEventDataMap(parsed.eventDataMap || {});
        setSurveyData(parsed.surveyData || null);
        setStep(2);
      } catch (e) {
        setStep(1);
      }
    }
  }, []);

  const syncRegistration = useCallback(async () => {
    if (!isLoaded) return;
    
    const saved = localStorage.getItem(HOME_STORAGE_KEY);
    const clerkEmail = user?.primaryEmailAddress?.emailAddress;
    let emailToVerify = clerkEmail;

    if (clerkEmail) {
      emailToVerify = clerkEmail;
    } else if (saved) {
      try {
        const { userData: savedData } = JSON.parse(saved);
        emailToVerify = savedData?.email;
      } catch (e) {}
    }

    if (emailToVerify) {
      try {
        const result = await checkRegistration(emailToVerify, user?.id);
        if (result.success) {
          const statuses = (result as any).eventStatuses || {};
          const dataMap = (result as any).eventData || {};
          const survey = (result as any).surveyData || null;

          // PRIORIDAD: El nombre de Clerk manda sobre el de Supabase para mantenerlo actualizado
          const finalFirstName = user?.firstName || result.userData.first_name;
          const finalLastName = user?.lastName || result.userData.last_name;

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
          if (JSON.stringify(sanitizedUserData) !== JSON.stringify(userData)) {
            setUserData(sanitizedUserData);
          }
          
          // CRÍTICO: Solo pre-seleccionamos eventos si NO estamos en el Paso 1
          const activeStep = localStorage.getItem(HOME_STEP_KEY);
          
          if (activeStep !== '1') {
            if (JSON.stringify(result.selectedEvents) !== JSON.stringify(selectedEvents)) {
              setSelectedEvents(result.selectedEvents || []);
            }
            if (JSON.stringify(statuses) !== JSON.stringify(eventStatuses)) {
              setEventStatuses(statuses);
            }
            if (JSON.stringify(dataMap) !== JSON.stringify(eventDataMap)) {
              setEventDataMap(dataMap);
            }
            if (JSON.stringify(survey) !== JSON.stringify(surveyData)) {
              setSurveyData(survey);
            }
            
            if (result.selectedEvents?.length > 0) {
              setSelectedCityId(prev => prev || result.selectedEvents[0]);
            }
            changeStep(2);
          }

          localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
            userData: sanitizedUserData,
            selectedEvents: result.selectedEvents,
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
  }, [isLoaded, user?.id, changeStep]);

  useEffect(() => {
    syncRegistration();
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
  }, [user?.id, user?.firstName, user?.lastName, changeStep]);

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

      // 🧠 Usar el orquestador de eventos para el mensaje de éxito
      const firstEventId = selectedEvents[0];
      const eventInfo = events.find(e => e.id === firstEventId);
      const eventConfig = getEventUIConfig(eventInfo);

      toast.success(eventConfig.registrationToast.title(data.firstName), {
        description: eventConfig.registrationToast.description,
        duration: 6000
      });
      
      const finalStatuses = (regResult as any).eventStatuses || {};
      const finalEventData = (regResult as any).eventData || {};
      const finalSurvey = (regResult as any).surveyData || null;
      const finalSelectedEvents = (regResult as any).mergedEvents || selectedEvents;

      const newUser = {
        ...data,
        id: (regResult as any).id
      };
      
      setUserData(newUser);
      setEventStatuses(finalStatuses);
      setEventDataMap(finalEventData);
      setSurveyData(finalSurvey);
      if (finalSelectedEvents.length > 0) setSelectedCityId(finalSelectedEvents[0]);

      localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
        userData: newUser,
        selectedEvents: finalSelectedEvents,
        eventStatuses: finalStatuses,
        eventDataMap: finalEventData,
        surveyData: finalSurvey
      }));

      window.dispatchEvent(new Event('registration-success'));

      return { success: true }; 
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
        if (result.selectedEvents && result.selectedEvents.length > 0) {
          setSelectedCityId(result.selectedEvents[0]);
        }

        localStorage.setItem(HOME_STORAGE_KEY, JSON.stringify({
          userData: result.userData,
          selectedEvents: result.selectedEvents,
          eventStatuses: statuses,
          eventDataMap: eventData,
          surveyData: (result as any).surveyData || null
        }));

        changeStep(2);
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
    localStorage.removeItem(HOME_STORAGE_KEY);
    setUserData(null);
    setSelectedEvents([]);
    setEventStatuses({});
    setEventDataMap({});
    setSelectedCityId("");
    changeStep(1);
    setIsCheckMode(false);
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

  return {
    // States
    step, setStep: changeStep,
    events, setEvents,
    selectedEvents, setSelectedEvents,
    userData, setUserData,
    isLoadingEvents,
    isSubmitting,
    activeMonth, setActiveMonth,
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

    // Handlers
    fetchData,
    revalidateStatus,
    handleRegistration,
    handleCheckRegistration,
    startNewRegistration,
    handleUpdateRegistration,
    availableMonths,
    activeCategory,
    setActiveCategory,
    availableCategories,
    filteredEvents: filteredEventsByCategory
  };
}

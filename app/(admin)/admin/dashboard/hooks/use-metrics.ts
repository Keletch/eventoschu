import { useMemo } from "react";
import { SURVEY_QUESTIONS } from "@/lib/constants";
import { transformEventForUI } from "@/lib/event-transformers";

export function useMetrics(registrations: any[], events: any[]) {
  return useMemo(() => {
    if (!registrations.length) return null;

    // 1. Métricas Globales
    const today = new Date().toISOString().split('T')[0];
    const registrationsToday = registrations.filter(r => r.created_at?.startsWith(today)).length;
    
    const totalInscriptions = registrations.reduce((acc, r) => acc + (r.selected_events?.length || 0), 0);
    const confirmedInscriptions = registrations.reduce((acc, r) => 
      acc + Object.values(r.event_statuses || {}).filter(s => s === 'confirmed').length, 0);
    
    const repeatUsers = registrations.filter(r => (r.selected_events?.length || 0) > 1).length;
    const surveyCompletionCount = registrations.filter(r => r.survey_data && Object.keys(r.survey_data).length > 0).length;

    // 2. Distribución Geográfica
    const countriesMap: Record<string, number> = {};
    registrations.forEach(r => {
      const country = r.residence_country || "No especificado";
      countriesMap[country] = (countriesMap[country] || 0) + 1;
    });
    const countryDistribution = Object.entries(countriesMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 3. Análisis de Encuesta (Dinamizado por lib/constants.ts)
    const surveyInsights: Record<string, any> = {};
    SURVEY_QUESTIONS.forEach(q => {
      const distribution: Record<string, number> = {};
      registrations.forEach(r => {
        const answerData = r.survey_data?.[q.id];
        if (answerData) {
          const label = answerData.answer;
          distribution[label] = (distribution[label] || 0) + 1;
        }
      });
      
      surveyInsights[q.id] = {
        label: q.label,
        data: Object.entries(distribution)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value)
      };
    });

    // 4. Rendimiento por Evento (SSoT via transformEventForUI)
    const eventPerformance = events.map(event => {
      const uiData = transformEventForUI(event);
      const isUnlimited = (event.capacity ?? 0) >= 9999;
      const eventRegs = registrations.filter(r => r.selected_events?.includes(event.id));
      const confirmed = eventRegs.reduce((acc, r) => 
        acc + (r.event_statuses?.[event.id] === 'confirmed' ? 1 : 0), 0);
      
      return {
        id: event.id,
        title: uiData.title,
        city: isUnlimited ? uiData.country : (uiData.isOnline ? "Online" : uiData.city),
        capacity: isUnlimited ? null : (event.capacity || 25),
        isUnlimited,
        total: eventRegs.length,
        confirmed,
        occupancyRate: isUnlimited ? null : (confirmed / (event.capacity || 25)) * 100,
        active: event.active
      };
    }).sort((a, b) => b.confirmed - a.confirmed);

    // 5. Tendencia de Registros (Últimos 14 días — mostramos 7 días pero calculamos 14 para el delta)
    const trendData: { date: string; label: string; count: number }[] = [];
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });
      const count = registrations.filter(r => r.created_at?.startsWith(dateStr)).length;
      trendData.push({ date: dateStr, label, count });
    }

    // Delta semana pasada vs actual (últimos 7 días vs 7 días anteriores)
    const thisWeekTotal = trendData.reduce((s, d) => s + d.count, 0);
    const prevWeekDays: number[] = [];
    for (let i = 13; i >= 7; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      prevWeekDays.push(registrations.filter(r => r.created_at?.startsWith(dateStr)).length);
    }
    const prevWeekTotal = prevWeekDays.reduce((s, c) => s + c, 0);
    const weeklyDelta = prevWeekTotal > 0 
      ? Math.round(((thisWeekTotal - prevWeekTotal) / prevWeekTotal) * 100)
      : thisWeekTotal > 0 ? 100 : 0;

    // 6. Distribución de Interés por Categoría
    const categoryMap: Record<string, number> = {};
    registrations.forEach(r => {
      (r.selected_events || []).forEach((eventId: string) => {
        const ev = events.find(e => e.id === eventId);
        if (!ev) return;
        const catName = ev.categories?.parent_category?.name || ev.categories?.name || "Sin categoría";
        categoryMap[catName] = (categoryMap[catName] || 0) + 1;
      });
    });
    const categoryDistribution = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      global: {
        totalUsers: registrations.length,
        totalInscriptions,
        confirmedInscriptions,
        registrationsToday,
        surveyCompletionCount,
        globalConversionRate: totalInscriptions > 0 ? (confirmedInscriptions / totalInscriptions) * 100 : 0,
        loyaltyRate: registrations.length > 0 ? (repeatUsers / registrations.length) * 100 : 0,
      },
      countryDistribution,
      surveyInsights,
      eventPerformance,
      trendData,
      weeklyDelta,
      thisWeekTotal,
      categoryDistribution,
    };
  }, [registrations, events]);
}

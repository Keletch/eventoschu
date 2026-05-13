import { useMemo } from "react";
import { SURVEY_QUESTIONS } from "@/lib/constants";

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

    // 4. Rendimiento por Evento
    const eventPerformance = events.map(event => {
      const eventRegs = registrations.filter(r => r.selected_events?.includes(event.id));
      const confirmed = eventRegs.reduce((acc, r) => 
        acc + (r.event_statuses?.[event.id] === 'confirmed' ? 1 : 0), 0);
      
      return {
        id: event.id,
        title: event.title,
        city: event.city,
        capacity: event.capacity || 25,
        total: eventRegs.length,
        confirmed,
        occupancyRate: (confirmed / (event.capacity || 25)) * 100,
        active: event.active
      };
    }).sort((a, b) => b.confirmed - a.confirmed);

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
    };
  }, [registrations, events]);
}

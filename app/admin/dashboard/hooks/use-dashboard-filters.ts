import { useState, useMemo, useEffect } from "react";

export function useDashboardFilters(events: any[], registrations: any[]) {
  // Events Filters
  const [eventsSearch, setEventsSearch] = useState("");
  const [eventTabCatFilter, setEventTabCatFilter] = useState("all");
  const [eventTabStatusFilter, setEventTabStatusFilter] = useState("all");

  // Registrations Filters
  const [regsSearch, setRegsSearch] = useState("");
  const [regsCategoryFilter, setRegsCategoryFilter] = useState("all");
  const [regsEventFilter, setRegsEventFilter] = useState("all");
  const [regsStatusFilter, setRegsStatusFilter] = useState("all");
  const [regsCountryFilter, setRegsCountryFilter] = useState("all");
  const [regsSurveyFilter, setRegsSurveyFilter] = useState<{ q: string, a: string } | null>(null);
  const [regsLoyaltyFilter, setRegsLoyaltyFilter] = useState(false);
  const [regsSurveyCompleteFilter, setRegsSurveyCompleteFilter] = useState(false);
  const [regsTodayFilter, setRegsTodayFilter] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  // Filter Logic: Events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(eventsSearch.toLowerCase()) ||
                          event.city.toLowerCase().includes(eventsSearch.toLowerCase());
      const matchesCat = eventTabCatFilter === "all" || event.category_id === eventTabCatFilter;
      const matchesStatus = eventTabStatusFilter === "all" || 
                           (eventTabStatusFilter === "active" ? event.active : !event.active);
      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [events, eventsSearch, eventTabCatFilter, eventTabStatusFilter]);

  // Filter Logic: Registrations
  const filteredRegs = useMemo(() => {
    return registrations.filter(reg => {
      const searchStr = `${reg.first_name} ${reg.last_name} ${reg.email}`.toLowerCase();
      const matchesSearch = searchStr.includes(regsSearch.toLowerCase());
      const matchesEvent = regsEventFilter === "all" || reg.selected_events?.includes(regsEventFilter);
      const matchesStatus = regsStatusFilter === "all" || 
                           (regsEventFilter !== "all" 
                             ? reg.event_statuses?.[regsEventFilter] === regsStatusFilter 
                             : Object.values(reg.event_statuses || {}).includes(regsStatusFilter));
      
      const matchesCountry = regsCountryFilter === "all" || 
                            (regsCountryFilter === "unspecified" ? !reg.residence_country : reg.residence_country === regsCountryFilter);

      const matchesSurvey = !regsSurveyFilter || 
                           (reg.survey_data?.[regsSurveyFilter.q]?.answer === regsSurveyFilter.a);

      const matchesLoyalty = !regsLoyaltyFilter || ((reg.selected_events?.length || 0) > 1);
      const matchesSurveyComplete = !regsSurveyCompleteFilter || (reg.survey_data && Object.keys(reg.survey_data).length > 0);
      const today = new Date().toISOString().split('T')[0];
      const matchesToday = !regsTodayFilter || reg.created_at?.startsWith(today);

      // Category filter is more complex as it depends on events linked to registration
      let matchesCat = true;
      if (regsCategoryFilter !== "all") {
        // Implement complex cat logic if needed
      }

      return matchesSearch && matchesEvent && matchesStatus && matchesCat && matchesCountry && matchesSurvey && matchesLoyalty && matchesSurveyComplete && matchesToday;
    });
  }, [registrations, regsSearch, regsEventFilter, regsStatusFilter, regsCategoryFilter, regsCountryFilter, regsSurveyFilter, regsLoyaltyFilter, regsSurveyCompleteFilter, regsTodayFilter]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [regsSearch, regsEventFilter, regsStatusFilter, regsCategoryFilter, regsCountryFilter, regsSurveyFilter, regsLoyaltyFilter, regsSurveyCompleteFilter, regsTodayFilter]);

  const totalPages = Math.ceil(filteredRegs.length / pageSize);
  const paginatedRegs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRegs.slice(start, start + pageSize);
  }, [filteredRegs, currentPage, pageSize]);

  return {
    eventsSearch, setEventsSearch,
    eventTabCatFilter, setEventTabCatFilter,
    eventTabStatusFilter, setEventTabStatusFilter,
    regsSearch, setRegsSearch,
    regsCategoryFilter, setRegsCategoryFilter,
    regsEventFilter, setRegsEventFilter,
    regsStatusFilter, setRegsStatusFilter,
    regsCountryFilter, setRegsCountryFilter,
    regsSurveyFilter, setRegsSurveyFilter,
    regsLoyaltyFilter, setRegsLoyaltyFilter,
    regsSurveyCompleteFilter, setRegsSurveyCompleteFilter,
    regsTodayFilter, setRegsTodayFilter,
    currentPage, setCurrentPage,
    pageSize, setPageSize,
    totalPages,
    filteredEvents,
    filteredRegs,
    paginatedRegs
  };
}

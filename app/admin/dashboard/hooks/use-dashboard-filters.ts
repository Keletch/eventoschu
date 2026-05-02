import { useState, useMemo } from "react";

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
      
      // Category filter is more complex as it depends on events linked to registration
      let matchesCat = true;
      if (regsCategoryFilter !== "all") {
        // Implement complex cat logic if needed
      }

      return matchesSearch && matchesEvent && matchesStatus && matchesCat;
    });
  }, [registrations, regsSearch, regsEventFilter, regsStatusFilter, regsCategoryFilter]);

  return {
    eventsSearch, setEventsSearch,
    eventTabCatFilter, setEventTabCatFilter,
    eventTabStatusFilter, setEventTabStatusFilter,
    regsSearch, setRegsSearch,
    regsCategoryFilter, setRegsCategoryFilter,
    regsEventFilter, setRegsEventFilter,
    regsStatusFilter, setRegsStatusFilter,
    filteredEvents,
    filteredRegs
  };
}

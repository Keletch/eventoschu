/**
 * 📅 Utilidades globales para el manejo de fechas en todo el proyecto.
 */

export function formatSafeDate(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  try {
    // Manejar formato YYYY-MM-DD sin problemas de zona horaria
    const baseDate = dateStr.split("T")[0];
    const parts = baseDate.split("-");
    if (parts.length === 3) {
      return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    }
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  } catch (_e) {
    return null;
  }
}

export function formatDateToShort(date: Date | null): string {
  if (!date) return "Sin fecha";
  if (date.getFullYear() === 2099) return "Por confirmar";
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

export function formatDateToLong(date: Date | null): string {
  if (!date) return "Sin fecha";
  if (date.getFullYear() === 2099) return "Por confirmar";
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
}

/**
 * Formatea un rango de fechas (ej: "15 al 17 de octubre de 2026" o "28 de octubre al 2 de noviembre de 2026")
 */
export function formatDateRange(startDateStr: string | null | undefined, endDateStr: string | null | undefined): string {
  const start = formatSafeDate(startDateStr);
  if (!start) return "Por confirmar";
  if (start.getFullYear() === 2099) return "Por confirmar";

  const end = formatSafeDate(endDateStr);
  if (!end || end.getFullYear() === 2099 || isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    return formatDateToLong(start);
  }

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString("es-ES", { month: "long" });
  const endMonth = end.toLocaleDateString("es-ES", { month: "long" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  // Mismo mes y mismo año: "15 al 17 de octubre de 2026"
  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay} al ${endDay} de ${startMonth} de ${startYear}`;
  }

  // Mismo año, distinto mes: "28 de octubre al 2 de noviembre de 2026"
  if (startYear === endYear) {
    return `${startDay} de ${startMonth} al ${endDay} de ${endMonth} de ${startYear}`;
  }

  // Distinto año: "28 de diciembre de 2026 al 3 de enero de 2027"
  return `${startDay} de ${startMonth} de ${startYear} al ${endDay} de ${endMonth} de ${endYear}`;
}

/**
 * Formato corto de rango para tablas admin (ej: "15 - 17 oct 2026")
 */
export function formatDateRangeShort(startDateStr: string | null | undefined, endDateStr: string | null | undefined): string {
  const start = formatSafeDate(startDateStr);
  if (!start) return "Sin fecha";
  if (start.getFullYear() === 2099) return "Por confirmar";

  const end = formatSafeDate(endDateStr);
  if (!end || end.getFullYear() === 2099 || isNaN(end.getTime()) || end.getTime() <= start.getTime()) {
    return formatDateToShort(start);
  }

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString("es-ES", { month: "short" });
  const endMonth = end.toLocaleDateString("es-ES", { month: "short" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startMonth === endMonth && startYear === endYear) {
    return `${startDay} - ${endDay} ${startMonth} ${startYear}`;
  }

  if (startYear === endYear) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
  }

  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
}

/**
 * Convierte cualquier string de fecha a YYYY-MM-DD para inputs HTML5
 */
export function formatDateForInput(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    // Tomamos solo la parte de la fecha antes de la T o el espacio
    const baseDate = dateStr.split("T")[0].split(" ")[0];
    return baseDate; // Formato YYYY-MM-DD
  } catch (_e) {
    return "";
  }
}


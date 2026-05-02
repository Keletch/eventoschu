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
  } catch (e) {
    return null;
  }
}

export function formatDateToShort(date: Date | null): string {
  if (!date) return "Sin fecha";
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
}

export function formatDateToLong(date: Date | null): string {
  if (!date) return "Sin fecha";
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
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
  } catch (e) {
    return "";
  }
}


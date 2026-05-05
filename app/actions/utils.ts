/**
 * 🛠️ Formateador único de eventos para notificaciones
 * Se encuentra en un archivo separado sin 'use server' para permitir su uso síncrono.
 */
export const formatEventForNotification = (event: any) => {
  if (!event) return "Evento desconocido";
  
  // Formateo de fecha corto y elegante (ej: 16 may) o "próximamente" para 2099
  let dateStr = 'Fecha pendiente';
  if (event.start_date) {
    const d = new Date(event.start_date);
    if (d.getFullYear() === 2099) {
      dateStr = 'próximamente';
    } else {
      dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');
    }
  }

  const catData = event.categories as any;
  const catName = Array.isArray(catData) ? catData[0]?.name : catData?.name;
  const category = catName ? `[${catName}]` : "[Evento]";
  
  return `${category} ${event.title} (${dateStr})`;
};

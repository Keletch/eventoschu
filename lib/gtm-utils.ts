declare global {
  interface Window {
    dataLayer: any[];
  }
}

/**
 * 📊 Envía un evento personalizado a la capa de datos (dataLayer) de Google Tag Manager.
 * Es seguro para SSR (Server-Side Rendering) y no fallará si GTM está bloqueado.
 * 
 * @param event Nombre del evento configurado en el activador de GTM.
 * @param parameters Parámetros opcionales para enriquecer el evento (ej: share_method).
 */
export function trackGTMEvent(event: string, parameters?: Record<string, any>) {
  if (typeof window === "undefined") return;

  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event,
      ...parameters,
    });
  } catch (error) {
    console.error("GTM track error:", error);
  }
}

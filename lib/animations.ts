/**
 * Configuración centralizada de animaciones GSAP
 * Sigue principios SOLID y DRY para asegurar consistencia y rendimiento.
 */

export const ANIM_CONFIG = {
  // Duraciones estándar
  duration: {
    fast: 0.2,
    normal: 0.4,
    slow: 0.8,
    entrance: 1.2
  },
  
  // Eases estándar
  ease: {
    base: "power2.inOut",
    out: "power3.out",
    in: "power2.in",
    gentle: "power1.inOut",
    bounce: "back.out(1.7)"
  },
  
  // Desplazamientos (offsets)
  offset: {
    sweep: 30,      // Barrido lateral
    slide: 40,      // Deslizamiento vertical
    stagger: 0.05    // Escalonado base
  }
};

/**
 * Selectores estándar para evitar hardcoding
 */
export const ANIM_SELECTORS = {
  card: ".event-card-wrapper",
  monthTab: ".month-tab-btn",
  categoryTab: ".category-tab-btn",
  step1: ".step-1",
  step2: ".step-2",
  heroCheck: ".hero-check",
  footer: "footer"
};

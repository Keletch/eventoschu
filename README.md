# Giras Hyenuk Chu - Sistema de Registro de Inversores

Este es un sistema de registro de alta fidelidad diseñado para gestionar la asistencia a las giras y eventos de **Hyenuk Chu**. La aplicación se centra en ofrecer una experiencia de usuario premium, minimalista y extremadamente segura, permitiendo a los inversores registrarse en múltiples sedes de forma fluida.

## 🚀 Características Principales

- **Diseño Premium & Dinámico:** Interfaz de usuario de alta fidelidad con micro-animaciones en GSAP, incluyendo un encabezado animado con efecto de rotación y *motion blur*.
- **Gestión de Estados Granulares:** Sistema de estados independiente para cada evento seleccionado (Revisando cupo, Confirmado, Cancelado), permitiendo una gestión precisa de la disponibilidad.
- **Sincronización Inteligente con Keap:** Integración profunda con Keap (Infusionsoft) que añade o elimina etiquetas automáticamente en función del estado de registro de cada ciudad.
- **Silent Re-validation:** Sistema de persistencia que re-valida automáticamente los datos del usuario contra Supabase en segundo plano al recargar la página, garantizando información siempre fresca.
- **Registro Multi-Evento:** Lógica inteligente que permite registrarse en múltiples sedes simultáneamente, con un sistema de fusión (merge) que actualiza los datos del usuario sin crear duplicados.
- **Protección Anti-Bots:** Integración con **Cloudflare Turnstile** para prevenir spam y ataques automatizados.
- **Admin Dashboard Pro:** Panel administrativo avanzado con filtros, edición de estados por ciudad y visualización de "Multi-Estado" para una gestión eficiente.

## 🛠️ Stack Tecnológico

- **Framework:** [Next.js](https://nextjs.org/) (App Router) - Arquitectura moderna y Server Components.
- **Lenguaje:** [TypeScript](https://www.typescriptlang.org/) - Tipado estricto para mayor robustez.
- **Base de Datos:** [Supabase](https://supabase.com/) - Gestión de datos en tiempo real y almacenamiento seguro.
- **Caché de Alto Rendimiento:** [Upstash Redis](https://upstash.com/) - Reducción drástica de latencia en la carga de eventos.
- **CRM Integration:** [Keap (Infusionsoft)](https://keap.com/) - Automatización de marketing mediante sincronización de etiquetas.
- **Animaciones:** [GSAP](https://greensock.com/gsap/) - El estándar de oro para animaciones web premium.
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/) - Estética minimalista y responsiva.
- **Seguridad:** [Zod](https://zod.dev/) para validación de esquemas y Server Actions para protección de secretos.

## 🔒 Seguridad y Optimización

- **Zero-Friction UX:** Sistema de verificación de registro que autocompleta datos de usuarios conocidos.
- **Integridad de Datos:** Validación multicapa (cliente/servidor) y protección contra inyecciones.
- **Responsive Design:** Adaptabilidad total desde dispositivos móviles hasta monitores 4K.

---
© 2026 Eventos Chu. Desarrollado con enfoque en excelencia técnica y experiencia de usuario premium.

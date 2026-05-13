# 🏛️ Arquitectura Técnica: Eventos HyenUk Chu

Este documento detalla la estructura, flujo de datos y lógica de negocio del ecosistema de eventos del Club de Inversionistas. Diseñado para ser escalable, seguro y optimizado para SEO/IA.

---

## 📂 Estructura Exhaustiva del Proyecto

### Archivos de Configuración Raíz
- `.env.local`: Variables de entorno locales (claves de Clerk, Supabase, Redis, Keap). No se sube a repositorios.
- `.gitignore`: Lista de archivos y carpetas ignoradas por el control de versiones (Git).
- `AGENTS.md` / `CLAUDE.md`: Directrices y contexto técnico para asistentes de IA.
- `ARCHITECTURE.md`: Este documento arquitectónico.
- `components.json`: Archivo de configuración de la librería de UI `shadcn/ui`.
- `eslint.config.mjs`: Reglas de linting para mantener calidad y consistencia en el código fuente.
- `next-env.d.ts`: Archivo generado automáticamente por Next.js para tipados nativos de TypeScript.
- `next.config.js` / `next.config.ts`: Configuración del compilador de Next.js (headers, redirecciones, dominios de imagen externos).
- `package.json` / `package-lock.json`: Definición de dependencias NPM y scripts principales (`dev`, `build`, `start`).
- `postcss.config.mjs`: Configuración de PostCSS (necesario para compilar TailwindCSS).
- `proxy.ts`: Script de red local u optimización de proxys.
- `README.md`: Documentación inicial y comandos de instalación del proyecto.
- `tsconfig.json`: Configuración estricta del compilador de TypeScript para seguridad de tipado.
- Archivos temporales: `tree.txt`, `skills-lock.json` (usados temporalmente para generación de scripts/agentes).

### 🌐 `/app` (App Router - Rutas y Server Actions)
Contiene todas las rutas web accesibles y la lógica pesada ejecutada exclusivamente en el servidor.

#### `/app/actions` (Server Actions - El Motor Backend)
Esta carpeta reemplaza las APIs REST tradicionales y brinda funciones de servidor ejecutables desde el cliente.
- `admin-check.ts`: Middleware de validación que verifica si el usuario autenticado tiene permisos de administrador.
- `admin-mass-ops.ts`: Tareas pesadas o de mantenimiento (limpieza masiva, migraciones).
- `admin-notifications.ts`: CRUD de notificaciones internas vistas en el panel de administrador.
- `admin-registration.ts`: Maneja la lectura, conteo y manipulación de los registros de asistentes para las tablas del dashboard.
- `auth-actions.ts`: Funciones puente con el sistema de Clerk para leer atributos de usuario desde servidor.
- `events.ts`: Archivo vital. Contiene el CRUD de los eventos e integra una capa de caché de ultra velocidad en **Redis (Upstash)**.
- `keap.ts`: Orquestador de marketing. Sincroniza correos e inyecta etiquetas (`tags`) automáticamente en el CRM Infusionsoft/Keap.
- `notifications.ts`: Funciones para emisión y consumo general de alertas.
- `schemas.ts`: Esquemas de validación estructural (Zod) usados para asegurar que los datos de entrada del usuario sean correctos.
- `turnstile.ts`: Valida los tokens de Cloudflare Turnstile para prevenir registros hechos por bots maliciosos.
- `user-registration.ts`: El corazón transaccional del registro. Coordina Clerk, Turnstile, Keap y Supabase en un solo flujo atómico.
- `utils-realtime.ts`: Helpers para desencadenar eventos WebSocket (Supabase Realtime) tras una mutación.
- `utils.ts`: Utilidades secundarias para el entorno de Node.js/Server Actions.

#### `/app/admin` (Dashboard Privado - Tematizado & Camaleónico)
- `/app/admin/dashboard/page.tsx`: Vista principal protegida del panel. Soporta temas dinámicos (Light, Dark, Synthwave).
- **/app/admin/dashboard/components/filters/**: Componentes para buscar en tablas.
  - `search-input.tsx`: Campo de búsqueda de texto.
  - `searchable-picker.tsx`: ComboBox avanzado para filtrar y seleccionar opciones de listas muy largas.
- **/app/admin/dashboard/components/forms/**: Formularios de administración y mutación.
  - `delete-event-dialog.tsx`: Modal para destruir un evento.
  - `event-dialog.tsx`: Formulario gigante para crear o editar los datos de un evento.
  - `keap-tag-picker.tsx`: Selector visual sincronizado con las etiquetas reales de Keap CRM.
  - `purge-user-dialog.tsx`: Proceso letal que borra la existencia de un usuario de las bases de datos.
  - `registration-dialog.tsx`: Modal para alterar el estatus ("Pendiente", "Confirmado") de un registro.
  - `toggle-event-dialog.tsx`: Activa o apaga la visibilidad pública de un evento.
- **/app/admin/dashboard/components/layout/**: Elementos estructurales (top bar, menú lateral) del dashboard.
- **/app/admin/dashboard/components/metrics/**:
  - `metrics-view.tsx`: Panel visual para renderizar gráficas de rendimiento y embudos (funnels).
- **/app/admin/dashboard/components/stats/**:
  - `stat-card.tsx` / `stats-grid.tsx`: Tarjetas (KPIs) en la cima del panel con métricas rápidas (ej. Total Registros).
- **/app/admin/dashboard/components/tables/**:
  - `events-table.tsx`: Tabla maestra de eventos.
  - `registrations-table.tsx`: Tabla maestra con filtros de los miles de usuarios registrados.
- **/app/admin/dashboard/hooks/**: Lógica interactiva del cliente administrativo.
  - `use-admin-dashboard.ts`: Manejo de estado principal (qué pestaña está abierta).
  - `use-dashboard-filters.ts`: Estado local de los filtros de las tablas.
  - `use-metrics.ts`: Fetcher asíncrono para cálculos estadísticos.
  - `use-notifications.ts`: Gestor de alertas administrativas en vivo.
  - `use-realtime-sync.ts`: Conecta las tablas a WebSockets para ver a la gente registrarse en tiempo real (mágico).
- `/app/admin/dashboard/utils/admin-constants.ts`: Constantes visuales o de límites para el admin.
- `/app/admin/login/page.tsx`: Un portal de login exclusivo y aislado para administradores.

#### `/app/api` (Endpoints de API tradicionales HTTP)
- `/app/api/webhooks/clerk/route.ts`: Endpoint público seguro que escucha los eventos de creación/eliminación de usuarios en Clerk (Auth) y los clona secretamente en la base de datos local Supabase para integridad relacional.

#### Archivos Principales y Rutas Raíz de `/app`
- `favicon.ico`: El icono mostrado en las pestañas del navegador web.
- `globals.css`: Punto de entrada global de CSS. Define las utilidades de Tailwind, variables de color e inyecciones de temas de Clerk.
- `home-client.tsx`: Envoltorio cliente para la página de inicio que gestiona animaciones y estados pesados del DOM.
- `layout.tsx`: El molde de todo el sitio (Root Layout). Carga las fuentes (Raleway), inyecta el `ClerkProvider` y renderiza el Scrollbar personalizado.
- `llms.txt/route.ts`: Endpoint dinámico. Sirve un resumen estructurado en texto plano y Markdown de todos los eventos reales para inteligencias artificiales (ChatGPT, etc).
- `manifest.ts`: Configuración que convierte la página en instalable (Progressive Web App - PWA).
- `opengraph-image.png`: La portada gigante que aparece cuando el link es pegado en WhatsApp o redes sociales.
- `page.tsx`: Home Page Pública. Es un componente de servidor que hace "Streaming" instantáneo de un esqueleto mientras procesa la base de datos.
- `registrado/`: Directorio / Ruta. Una página de destino que aparece justo después de un registro exitoso.
- `robots.ts`: Instrucciones para rastreadores (Googlebot). Completamente optimizado.
- `sitemap.ts`: Genera un archivo XML con los enlaces y fechas de modificación para indexación SEO.

---

### 🧱 `/components` (Biblioteca de Interfaces Reutilizables)

Todos los archivos raíz de esta carpeta son **orquestadores** (`header.tsx`, `footer.tsx`). Todo componente específico de un dominio vive en su propia subcarpeta.

#### `/components/events` (Motor Visual de Tarjetas)
- `event-card.tsx`: La tarjeta visual que muestra los detalles de un evento en el Home. Delega en los siguientes dos:
- `event-progress-bar.tsx`: Barra visual del porcentaje de ocupación de un evento.
- `event-sold-out-overlay.tsx`: Cortina opaca visual que dice "Agotado" para eventos llenos.

#### `/components/footer` & `/components/header`
- `footer.tsx` / `footer/social-icon.tsx`: Orquestador del pie de página y botones sociales estandarizados.
- `header.tsx`: Orquestador de la barra de navegación fija superior.
- `header/auth-section.tsx`: Renderiza el botón de sesión o avatar del usuario.
- `header/header-alerts.tsx`: Cinta de alertas/avisos importantes arriba del logo.
- `header/logo.tsx`: El logo del Club de Inversionistas.
- `header/sidebar.tsx`: Panel lateral deslizable en móvil.

#### `/components/home` (Bloques de la Página de Inicio)
- `category-tabs.tsx`: Pestañas para filtrar por tipo de evento (Gira, Taller).
- `check-registration-panel.tsx`: Panel donde el visitante consulta el estatus de su registro por email.
- `city-selector.tsx`: Desplegable para escoger el destino presencial.
- `contact-footer-card.tsx`: Gran tarjeta persuasiva al fondo del scroll.
- `events-carousel.tsx`: El slider interactivo horizontal con GSAP y snapping.
- `events-skeleton.tsx`: Esqueleto de carga que preserva el layout sin CLS.
- `hero-section.tsx`: Titular principal de entrada. Carga el `WordRotator` de forma asíncrona.
- `month-tabs.tsx`: Sub-pestañas para filtrar eventos por mes.
- `next-steps-panel.tsx`: Caja informativa sobre los pasos previos al viaje.
- `public-view.tsx` / `registered-view.tsx`: Los dos modos del Home según el estado del usuario.
- `registration-hero.tsx` / `registration-top-bar.tsx`: Títulos dinámicos en modo inscripción.
- `share-section.tsx` / `social-media-panel.tsx`: Componentes para compartir la landing.
- `user-data-card.tsx`: Credencial con datos del usuario desde Supabase.
- `word-rotator.tsx`: Animación GSAP de palabras rotativas (cargado asíncronamente).
- `utils/flag-helpers.tsx`: Vectores de banderas por código de país.
- `utils/home-constants.ts`: Constantes visuales de la página principal.

#### `/components/notifications`
- `notification-bell.tsx`: Campanita con popover de alertas para el header.
- `notification-item.tsx`: Tarjeta expandible con el detalle de cada notificación.

#### `/components/providers` (Wrappers de Infraestructura)
Componentes "use client" mínimos que envuelven servicios de terceros para poder usarlos en el Server Component `layout.tsx`.
- `vercel-analytics.tsx`: Wrapper de Vercel Analytics (excluye rutas `/admin`).
- `vercel-speed-insights.tsx`: Wrapper de Vercel Speed Insights (excluye rutas `/admin`).

#### `/components/registration` (Motor de Formularios)
- `registration-form.tsx`: Gran formulario principal con validación, Clerk, Turnstile y Supabase.
- `survey-modal.tsx`: Modal post-registro con preguntas de encuesta (guarda en Supabase).
- `country-selector.tsx`: Selector de países con opción "Otro".
- `form-field.tsx`: Envoltorio estándar (label + input + error) reutilizable.
- `phone-input.tsx`: Input especializado para números internacionales.

#### `/components/seo`
- `event-json-ld.tsx`: Inyecta JSON-LD estructurado para Rich Snippets en Google Search.

#### `/components/ui` (Base de Componentes UI Shadcn/Radix)
Componentes atómicos de diseño reutilizables en toda la app.
- Atómicos Shadcn: `badge`, `button`, `card`, `checkbox`, `command`, `dialog`, `dropdown-menu`, `input`, `input-group`, `label`, `popover`, `select`, `skeleton`, `sonner`, `switch`, `table`, `tabs`, `textarea`, `tooltip`.
- Personalizados:
  - `custom-scrollbar.tsx` / `custom-scrollbar-wrapper.tsx`: Scrollbar GSAP aislado asíncronamente.
  - `event-flag.tsx`: Avatar redondo con la bandera de la ciudad.
  - `sidebar-scrollbar.tsx`: Scrollbar adaptado al menú lateral.

---

### 🎣 `/hooks` (Lógica Reactiva del Cliente)
- `/hooks/home/use-home-logic.ts`: Extrae todas las matemáticas del estado (mes elegido, evento abierto) para que el UI solo se encargue de "pintar".
- `/hooks/home/use-home-sync.ts`: Escucha cambios persistentes y sincroniza datos de sesión sin recargar.
- `/hooks/realtime/use-personal-realtime.ts` / `use-public-realtime.ts`: Conexiones WebSocket nativas de Supabase. Detectan y actualizan los cupos sin refrescar el explorador.
- `/hooks/user/use-user-notifications.ts`: Controlador estado local para notificaciones a usuarios.

---

### 🛠️ `/lib` (Librerías, Backend Crudo y Utilidades Maestras)
- `animations.ts`: Variables y tiempos mágicos compartidos para todas las librerías GSAP.
- `constants.ts`: Tokens estáticos inmutables en la app.
- `date-utils.ts`: Scripts a prueba de bombas para extraer y mostrar fechas sin el dolor de cabeza de las "Zonas Horarias".
- `event-config.ts`: Decisiones puras (ej. Si el evento es gratis, cómo se debe tratar).
- `event-transformers.ts`: **LA ÚNICA FUENTE DE VERDAD (SSoT)**. Es el archivo más crítico para formato. Una sola función (`transformEventForUI`) es llamada tanto por el carrusel de humanos, los buscadores de Google y el LLM de las IA's para garantizar que la información (`Por confirmar`, `Sin Costo`) sea 100% idéntica en todo el universo de internet.
- `supabase-admin.ts`: Llave maestra de base de datos (Service Role Key). Solo vive en servidor y bypassa las reglas de seguridad.
- `supabase-server.ts`: Cliente de Supabase pero regido por las reglas de seguridad del usuario autenticado actual.
- `supabase.ts`: Cliente de base de datos básico para interacciones en componentes "use client".
- `utils.ts`: Útiles como `cn`, que mezcla clases de Tailwind de forma perfecta sin colisiones.
- `/lib/notifications/templates.ts`: Diseños de textos/emails prefabricados para enviar alertas.
- `/lib/services/signal-dispatcher.ts`: Un orquestador global (Event Emitter). Permite que un componente avise a otro de un cambio de estado sin estar conectados o entrelazados en el DOM.

---

### 📁 `/public` (Directorio de Estáticos Globales)
Archivos accesibles abiertamente desde la URL raíz (`/`).
- `cdi-logo.png`: El logotipo crudo de Club de Inversionistas.

---

### 💡 Ideas y Patrones para el Futuro
- **Vercel Flags (Feature Toggling):** Cuando se necesite implementar una funcionalidad experimental o realizar pruebas A/B (ej. un nuevo formulario de registro), se recomienda usar el **Vercel Flags SDK**. 
  - **Patrón:** Definir el flag en `lib/flags.ts`, usar `await myFlag()` en Server Components, y controlar la visibilidad desde el dashboard de Vercel sin necesidad de redeploy.

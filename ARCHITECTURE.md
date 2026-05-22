# 🏛️ Arquitectura Técnica: Eventos HyenUk Chu

Este documento detalla la estructura, flujo de datos y lógica de negocio del ecosistema de eventos del Club de Inversionistas. Diseñado para ser escalable, seguro y optimizado para SEO/IA.

---

## 📚 Documentación de Contexto Adicional

Para obtener un contexto completo del proyecto, cualquier desarrollador o IA debe consultar los siguientes documentos Markdown situados en la raíz:
1. **`DESIGN.md`**: Detalla el sistema de diseño visual, la paleta de colores corporativos, tipografía, radios y sombras, y el funcionamiento técnico de las animaciones (Tailwind CSS para render inicial y GSAP para interacción).
2. **`THEMES.md`**: Guía técnica de tematización. Detalla los 5 temas activos del sistema (`Light`, `Dark`, `Synthwave`, `Hacker` y `Coffee`) y la plantilla de tokens semánticos (superficie, acción, contraste y scrollbars) para crear nuevos temas.
3. **`AGENTS.md`**: Reglas maestras obligatorias y principios arquitectónicos (SOLID, DRY y Colocation por dominio) que todo agente de IA debe seguir sin excepción al escribir o refactorizar código en este repositorio.
4. **`README.md`**: Resumen general de las características operativas y flujo del sistema.

---

## 📂 Estructura Exhaustiva del Proyecto

### Archivos de Configuración Raíz
- `.env.local`: Variables de entorno locales (claves de Clerk, Supabase, Redis, Keap). No se sube a repositorios.
- `.gitignore`: Lista de archivos y carpetas ignoradas por el control de versiones (Git).
- `AGENTS.md` / `CLAUDE.md`: Directrices y contexto técnico para asistentes de IA.
- `ARCHITECTURE.md`: Este documento arquitectónico.
- `DESIGN.md`: Documento de guías visuales, tipografías y animaciones.
- `THEMES.md`: Arquitectura del motor de temas y tokens semánticos del sistema.
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
- `admin-categories.ts`: Motor backend para la creación, edición y borrado de categorías.
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

- `/app/(admin)/layout.tsx`: Layout raíz para el área de administración pública/privada. Configura el renderizado e inyecciones específicas del panel.
- `/app/admin/dashboard/page.tsx`: Vista principal protegida del panel. Construye el layout estructural completo del dashboard (sidebar de navegación de pestañas, cabecera y cuerpo) e interactúa con el hook `useAdminDashboard`. Soporta los 5 temas dinámicos.
- **/app/admin/dashboard/components/filters/**: Componentes para buscar en tablas.
  - `search-input.tsx`: Campo de búsqueda de texto.
  - `searchable-picker.tsx`: ComboBox avanzado para filtrar y seleccionar opciones de listas muy largas.
- **/app/admin/dashboard/components/forms/**: Formularios de administración y mutación.
  - `delete-event-dialog.tsx`: Modal para destruir un evento.
  - `event-dialog.tsx`: Formulario gigante para crear o editar los datos de un evento.
  - `keap-tag-picker.tsx`: Selector visual de tags Keap.
  - `manage-categories-dialog.tsx`: Modal para crear, modificar o eliminar categorías y subcategorías de eventos.
  - `purge-user-dialog.tsx`: Proceso letal que borra la existencia de un usuario de las bases de datos.
  - `registration-dialog.tsx`: Modal para alterar el estatus ("Pendiente", "Confirmado") de un registro.
  - `toggle-event-dialog.tsx`: Activa o apaga la visibilidad pública de un evento.
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
- `globals.css`: Punto de entrada global de CSS. Define las utilidades de Tailwind, variables de color e inyecciones de temas de Clerk. Incluye los tokens de scrollbar (`--scrollbar-dot`, `--scrollbar-dot-muted`, `--scrollbar-sidebar-dot`) que permiten la tematización dinámica de los scrollbars GSAP.
- `layout.tsx`: El molde de todo el sitio (Root Layout). Carga las fuentes (Raleway), inyecta el `ClerkProvider` y renderiza el Scrollbar personalizado.
- `llms.txt/route.ts`: Endpoint dinámico. Sirve un resumen estructurado en texto plano y Markdown de todos los eventos reales para inteligencias artificiales (ChatGPT, etc).
- `manifest.ts`: Configuración que convierte la página en instalable (Progressive Web App - PWA).
- `opengraph-image.png`: La portada gigante que aparece cuando el link es pegado en WhatsApp o redes sociales.
- `page.tsx`: Home Page Pública. Es un componente de servidor que hace "Streaming" instantáneo de un esqueleto mientras procesa la base de datos.
- `(public)/home-client.tsx`: Envoltorio cliente de la Home. Contiene el orquestador de animaciones **`animateCardsTransition`** — función centralizada que maneja la secuencia GSAP de salida/entrada de Event Cards para cualquier cambio de filtro (categoría, mes, subcategoría). Toda nueva transición de filtro debe usar este orquestador, nunca duplicar lógica GSAP.
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
- `category-tabs.tsx`: Sistema de filtrado jerárquico de dos niveles. El primer nivel son las pestañas de categoría principal (Talleres, Giras, etc.). El segundo nivel son pills de subcategoría que aparecen anidadas bajo la categoría activa. Ambos niveles usan el orquestador `animateCardsTransition` para sus transiciones.
- `check-registration-panel.tsx`: Panel donde el visitante consulta el estatus de su registro por email.
- `city-selector.tsx`: Desplegable para escoger el destino presencial.
- `contact-footer-card.tsx`: Gran tarjeta persuasiva al fondo del scroll.
- `events-carousel.tsx`: El slider interactivo horizontal con GSAP y snapping.
- `events-skeleton.tsx`: Esqueleto de carga principal del carrusel de eventos.
- `hero-section.tsx`: Titular principal de entrada. Carga el `WordRotator` de forma asíncrona.
- `month-tabs.tsx`: Sub-pestañas para filtrar eventos por mes.
- `next-steps-panel.tsx`: Caja informativa sobre los pasos previos al viaje.
- `public-view.tsx` / `registered-view.tsx`: Los dos modos del Home según el estado del usuario.
- `registration-hero.tsx` / `registration-top-bar.tsx`: Títulos dinámicos en modo inscripción.
- `share-section.tsx` / `social-media-panel.tsx`: Componentes para compartir la landing.
- `skeletons.tsx`: Esqueletos de carga auxiliares para la interfaz del Home.
- `user-data-card.tsx`: Credencial con datos del usuario desde Supabase.
- `word-rotator.tsx`: Animación GSAP de palabras rotativas (cargado asíncronamente).
- `utils/flag-helpers.tsx`: Vectores de banderas por código de país.
- `utils/home-constants.ts`: Constantes visuales de la página principal.

#### `/components/notifications`
- `notification-bell.tsx`: Campanita con popover de alertas para el header.
- `notification-item.tsx`: Tarjeta expandible con el detalle de cada notificación.

#### `/components/providers` (Wrappers de Infraestructura)
Componentes "use client" mínimos que envuelven servicios de terceros para poder usarlos en el Server Component `layout.tsx`.
- `gtm-provider.tsx`: Envoltorio para inicializar Google Tag Manager.
- `theme-provider.tsx`: Envoltorio cliente para configurar `next-themes` con soporte de 5 temas.
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
  - `dot-scrollbar.tsx`: **Motor unificado de scrollbar de puntos GSAP.** Acepta props `scrollTarget` (`"window"` o un `ref` a contenedor), `position` (`"fixed"` o `"absolute"`), `colorVar` (token CSS del color), `showLoadingWave` (boolean para la ola de carga), `className`. Es el único componente de scrollbar que contiene lógica GSAP. No crear alternativas.
  - `custom-scrollbar.tsx` / `custom-scrollbar-wrapper.tsx`: Thin wrapper de `DotScrollbar` para el scrollbar global de página (`scrollTarget="window"`, `position="fixed"`, `showLoadingWave={true}`).
  - `sidebar-scrollbar.tsx`: Thin wrapper de `DotScrollbar` para el scrollbar del sidemenu (`scrollTarget=ref`, `position="absolute"`, `showLoadingWave={false}`).
  - `event-flag.tsx`: Avatar redondo con la bandera de la ciudad.
  - `theme-toggle.tsx`: Botón cliente para conmutar cíclicamente entre los 5 temas visuales de la app.

---

### 🎣 `/hooks` (Lógica Reactiva del Cliente)
- `/hooks/home/use-home-logic.ts`: Extrae toda la lógica de estado del Home en un hook dedicado. Gestiona el sistema de filtrado jerárquico de 3 niveles: **Categoría → Subcategoría → Mes**. Cada nivel tiene su propio estado independiente con reglas de cascade: cambiar la categoría resetea la subcategoría activa, pero cambiar el mes no altera la selección de subcategoría. El UI solo pinta — toda la matemática de qué eventos mostrar vive aquí.
- `/hooks/home/use-home-sync.ts`: Escucha cambios persistentes y sincroniza datos de sesión sin recargar.
- `/hooks/realtime/use-personal-realtime.ts` / `use-public-realtime.ts`: Conexiones WebSocket nativas de Supabase. Detectan y actualizan los cupos sin refrescar el explorador.
- `/hooks/user/use-user-notifications.ts`: Controlador estado local para notificaciones a usuarios.

---

### 🛠️ `/lib` (Librerías, Backend Crudo y Utilidades Maestras)
- `animations.ts`: Variables y tiempos mágicos compartidos para todas las librerías GSAP.
- `constants.ts`: Tokens estáticos inmutables en la app.
- `gtm-utils.ts`: Funciones de utilidad para inyectar eventos al DataLayer de Google Tag Manager.
- `date-utils.ts`: Scripts a prueba de bombas para extraer y mostrar fechas sin el dolor de cabeza de las "Zonas Horarias".
- `event-config.ts`: Decisiones puras (ej. Si el evento es gratis, cómo se debe tratar).
- `event-transformers.ts`: **LA ÚNICA FUENTE DE VERDAD (SSoT)**. Es el archivo más crítico para formato. Una sola función (`transformEventForUI`) es llamada tanto por el carrusel de humanos, los buscadores de Google y el LLM de las IA's para garantizar que la información (`Por confirmar`, `Sin Costo`) sea 100% idéntica en todo el universo de internet. Incluye la constante `TIMEZONE_SHORT_CODES` que mapea zonas horarias IANA a etiquetas cortas legibles (ej: `America/Mexico_City` → `CDMX`, `America/New_York` → `EST`) que se inyectan automáticamente en el campo de hora de cada evento.
- `supabase-admin.ts`: Llave maestra de base de datos (Service Role Key). Solo vive en servidor y bypassa las reglas de seguridad.
- `supabase-server.ts`: Cliente de Supabase pero regido por las reglas de seguridad del usuario autenticado actual.
- `supabase.ts`: Cliente de base de datos básico para interacciones en componentes "use client".
- `utils.ts`: Útiles como `cn`, que mezcla clases de Tailwind de forma perfecta sin colisiones.
- `/lib/notifications/templates.ts`: Diseños de textos/emails prefabricados para enviar alertas.
- `/lib/services/signal-dispatcher.ts`: Un orquestador global (Event Emitter). Permite que un componente avise a otro de un cambio de estado sin estar conectados o entrelazados en el DOM.

---

## 🗄️ Modelado de Datos y Sincronización Realtime

### 1. Base de Datos Relacional (PostgreSQL)
El backend en Supabase gestiona las relaciones maestras para la segmentación de eventos:
*   `tags`: Contiene las etiquetas globales del sistema (ej: `pago` para clasificar y marcar eventos pagados).
*   `event_tags`: Tabla relacional intermedia (Muchos a Muchos) que vincula etiquetas a eventos específicos para modular la UI y el comportamiento de inscripción de forma dinámica.

### 2. Canales de Progreso en Tiempo Real (Keap CRM Sync)
Para operaciones de administración pesadas (como la migración o sincronización de miles de contactos en el CRM Keap):
*   **Orquestación WebSocket**: Se asigna un identificador único de operación (`operationId`).
*   **Canales Dinámicos**: La Server Action abre y transmite actualizaciones de porcentaje y logs a un canal exclusivo de Supabase Realtime (`op-progress:${operationId}`).
*   **Consumo Cliente**: El componente `OperationProgressDialog` se suscribe en tiempo real a este canal para renderizar una barra de progreso fluida con feedback directo de cada contacto procesado, mitigando el riesgo de desconexión del cliente durante procesos prolongados de red.

### 3. Lógica de Negocio en Inteligencia y Métricas
*   **Cálculo SSoT**: Toda métrica de eventos extraída en el dashboard admin consume la función centralizada `transformEventForUI` para formatear de manera idéntica los títulos y nombres de ciudades virtuales (`Online`).
*   **Manejo de Aforo Ilimitado**: Los eventos con un cupo mayor o igual a `9999` se consideran de capacidad ilimitada (`isUnlimited: true`), inyectando en la vista de rendimiento un badge de infinito `∞` que sobrescribe las barras de porcentaje y evita cálculos de ocupación incorrectos.

---

### 📁 `/public` (Directorio de Estáticos Globales)
Archivos accesibles abiertamente desde la URL raíz (`/`).
- `cdi-logo.png`: El logotipo crudo de Club de Inversionistas.

---

### ⚡ Estrategia de SEO & AIO (Artificial Intelligence Optimization)

La plataforma está diseñada con una estrategia dual que optimiza tanto el posicionamiento en buscadores tradicionales (SEO) como el consumo por parte de agentes y modelos de Inteligencia Artificial (AIO).

1. **Estructura Semántica de llms.txt (`app/llms.txt/route.ts`)**:
   - Genera un archivo Markdown plano compatible con la especificación `llms.txt`.
   - Recupera dinámicamente los eventos activos de Redis/Supabase.
   - Aplica `transformEventForUI` garantizando consistencia absoluta (SSoT).
   - Divide la información jerárquicamente por categorías y subcategorías (ej: `[Talleres > Básico]`), informando claramente si el evento es presencial u online, su costo, duración y URL/Plataforma de acceso directo.
2. **Optimización de Sitemap Dinámico (`app/sitemap.ts`)**:
   - Expone la URL principal y calcula el atributo `lastModified` dinámicamente basado en la fecha de modificación o creación del evento más reciente. Esto le dice a Googlebot cuándo es crítico volver a indexar la página sin saturar la red.
3. **Control de Rastreo Inteligente (`app/robots.ts`)**:
   - Instruye a agentes convencionales e IAs (`GPTBot`, `Claude-Web`, `Amazonbot`, `Google-Extended`) a indexar libremente el Home y el recurso `/llms.txt`, pero bloquea de forma estricta el acceso a endpoints `/api` o rutas del panel administrativo `/admin`.
4. **Metadatos y Schema JSON-LD (`components/seo/event-json-ld.tsx`)**:
   - Inyecta metadatos estructurados compatibles con Schema.org en formato `application/ld+json`.
   - Permite que Google Search reconozca los eventos presenciales y online como Rich Snippets directos en las hojas de resultados (mostrando horarios, fechas y disponibilidad en vivo).

---

### 💡 Ideas y Patrones para el Futuro
- **Vercel Flags (Feature Toggling):** Cuando se necesite implementar una funcionalidad experimental o realizar pruebas A/B (ej. un nuevo formulario de registro), se recomienda usar el **Vercel Flags SDK**. 
  - **Patrón:** Definir el flag en `lib/flags.ts`, usar `await myFlag()` en Server Components, y controlar la visibilidad desde el dashboard de Vercel sin necesidad de redeploy.

# Graph Report - eventosCHU  (2026-05-26)

## Corpus Check
- 149 files · ~75,901 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 890 nodes · 2046 edges · 56 communities (53 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `c76edf91`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Database Operations|Admin Database Operations]]
- [[_COMMUNITY_Category and Event Dialogs|Category and Event Dialogs]]
- [[_COMMUNITY_Event Fetching and State|Event Fetching and State]]
- [[_COMMUNITY_Global Header and Navigation|Global Header and Navigation]]
- [[_COMMUNITY_Public Registration and Attendees|Public Registration and Attendees]]
- [[_COMMUNITY_Admin Layout and SEO|Admin Layout and SEO]]
- [[_COMMUNITY_External Node Modules|External Node Modules]]
- [[_COMMUNITY_Admin Data Tables|Admin Data Tables]]
- [[_COMMUNITY_Searchable Dropdowns and Pickers|Searchable Dropdowns and Pickers]]
- [[_COMMUNITY_Shadcn Components Schema|Shadcn Components Schema]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Primitive UI Components|Primitive UI Components]]
- [[_COMMUNITY_TypeScript Project Configuration|TypeScript Project Configuration]]
- [[_COMMUNITY_Admin Login and Cards|Admin Login and Cards]]
- [[_COMMUNITY_Custom and Sidebar Scrollbars|Custom and Sidebar Scrollbars]]
- [[_COMMUNITY_Form Inputs and Textareas|Form Inputs and Textareas]]
- [[_COMMUNITY_Development Dependencies|Development Dependencies]]
- [[_COMMUNITY_Metrics Dashboard and KPIs|Metrics Dashboard and KPIs]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Notification Bell and Alert UI|Notification Bell and Alert UI]]
- [[_COMMUNITY_PNPM Package Definition|PNPM Package Definition]]
- [[_COMMUNITY_Build and Dev Scripts|Build and Dev Scripts]]
- [[_COMMUNITY_Supabase Client and API Proxy|Supabase Client and API Proxy]]
- [[_COMMUNITY_Eslint Project Rules|Eslint Project Rules]]
- [[_COMMUNITY_Next.js Core Configuration|Next.js Core Configuration]]
- [[_COMMUNITY_Next.js TS Configuration|Next.js TS Configuration]]
- [[_COMMUNITY_PostCSS Compiler Options|PostCSS Compiler Options]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 56|Community 56]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 151 edges
2. `Button()` - 30 edges
3. `insertAdminNotification()` - 17 edges
4. `compilerOptions` - 16 edges
5. `syncKeapTags()` - 16 edges
6. `fetch()` - 16 edges
7. `Input()` - 15 edges
8. `formatEventForNotification()` - 14 edges
9. `dispatchSignal()` - 14 edges
10. `cachePut()` - 14 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `MetricKpiCard()` --calls--> `cn()`  [EXTRACTED]
  app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx → lib/utils.ts
- `SimpleProgressBar()` --calls--> `cn()`  [EXTRACTED]
  app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx → lib/utils.ts
- `TrendChart()` --calls--> `cn()`  [EXTRACTED]
  app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx → lib/utils.ts
- `keapFetch()` --calls--> `fetch()`  [INFERRED]
  app/actions/keap.ts → public/sw.js

## Communities (56 total, 3 thin omitted)

### Community 0 - "Admin Database Operations"
Cohesion: 0.07
Nodes (69): createCategory(), deleteCategory(), updateCategory(), supabaseAdmin, verifyAdminPermission(), adminAddEventToUser(), adminRemoveEventFromUser(), clerk (+61 more)

### Community 1 - "Category and Event Dialogs"
Cohesion: 0.09
Nodes (43): uploadImage(), DeleteEventDialogProps, BG_COLOR_OPTIONS, EventDialogProps, TIMEZONE_LABELS, AVAILABLE_ICONS, ManageCategoriesDialogProps, OperationProgressDialogProps (+35 more)

### Community 2 - "Event Fetching and State"
Cohesion: 0.17
Nodes (6): EventsCarousel(), EventsCarouselProps, EventsSkeleton(), HeaderSkeleton(), EventJsonLd(), Skeleton()

### Community 3 - "Global Header and Navigation"
Cohesion: 0.21
Nodes (7): Sidebar(), SIDEBAR_LINKS, SidebarProps, DotScrollbar(), DotScrollbarProps, SidebarScrollbar(), SidebarScrollbarProps

### Community 4 - "Public Registration and Attendees"
Cohesion: 0.06
Nodes (39): trackPaidEventClick(), EventCard(), EventCardProps, EventDetailItem(), EventProgressBar(), EventProgressBarProps, EventSoldOutOverlay(), CitySelector() (+31 more)

### Community 5 - "Admin Layout and SEO"
Cohesion: 0.10
Nodes (19): metadata, raleway, SearchInputProps, HeaderAlertsProps, HeroSectionProps, WordRotator, GTMProvider(), ThemeProvider() (+11 more)

### Community 6 - "External Node Modules"
Cohesion: 0.06
Nodes (32): dependencies, @base-ui/react, canvas-confetti, class-variance-authority, @clerk/localizations, @clerk/nextjs, @clerk/ui, clsx (+24 more)

### Community 7 - "Admin Data Tables"
Cohesion: 0.12
Nodes (22): formatDateToShort(), formatSafeDate(), EventsTableProps, RegistrationsTableProps, Card(), CardAction(), CardContent(), CardDescription() (+14 more)

### Community 8 - "Searchable Dropdowns and Pickers"
Cohesion: 0.07
Nodes (25): _(), _awaitComplete(), b, createHandlerBoundToUrl(), destroy(), doneWaiting(), ea(), eq (+17 more)

### Community 9 - "Shadcn Components Schema"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Community 10"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 11 - "Primitive UI Components"
Cohesion: 0.14
Nodes (13): cn(), RegistrationForm(), Checkbox(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+5 more)

### Community 12 - "TypeScript Project Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 13 - "Admin Login and Cards"
Cohesion: 0.40
Nodes (4): StatCard(), StatCardProps, StatsGrid(), StatsGridProps

### Community 14 - "Custom and Sidebar Scrollbars"
Cohesion: 0.18
Nodes (15): _addSyncListener(), addToPrecacheList(), c(), constructor(), ec(), ew(), handleActivate(), handleCache() (+7 more)

### Community 15 - "Form Inputs and Textareas"
Cohesion: 0.12
Nodes (19): ActiveChip(), ActiveChipProps, EventsFilterBar(), EventsFilterBarProps, Notification, formatRelativeTime(), NotificationBellProps, NotificationItem() (+11 more)

### Community 16 - "Development Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 17 - "Metrics Dashboard and KPIs"
Cohesion: 0.22
Nodes (7): env, envContent, envPath, key, parts, supabase, val

### Community 18 - "Community 18"
Cohesion: 0.08
Nodes (26): 1. Base de Datos Relacional (PostgreSQL), 2. Canales de Progreso en Tiempo Real (Keap CRM Sync), 3. Lógica de Negocio en Inteligencia y Métricas, `/app/actions` (Server Actions - El Motor Backend), `/app/api` (Endpoints de API tradicionales HTTP), 🌐 `/app` (App Router - Rutas y Server Actions), Archivos de Configuración Raíz, Archivos Principales y Rutas Raíz de `/app` (+18 more)

### Community 19 - "Notification Bell and Alert UI"
Cohesion: 0.18
Nodes (24): A, cacheMatch(), cachePut(), E, _ensureResponseSafeToCache(), fetch(), fetchAndCachePut(), findMatchingRoute() (+16 more)

### Community 20 - "PNPM Package Definition"
Cohesion: 0.25
Nodes (7): name, @tanstack/query-core, packageManager, pnpm, overrides, private, version

### Community 21 - "Build and Dev Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 22 - "Supabase Client and API Proxy"
Cohesion: 0.50
Nodes (3): config, response, supabase

### Community 28 - "Next.js TS Configuration"
Cohesion: 0.50
Nodes (3): nextConfig, withSerwist, nextConfig

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (22): 1. Inyección en el Layout (`app/(public)/layout.tsx`), ☀️ 1. Tema Light (Estándar/Default), 1. Variables de Estructura e Interfaz, 📚 2. Tema Dark ("Libro Viejo"), 2. Variables de Scrollbar y Navegación (GSAP), 3. Efectos Visuales CSS, 🌃 3. Tema Synthwave ("Retro-futurismo"), 📟 4. Tema Hacker ("Matrix") (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.18
Nodes (11): 1. ⚡ Optimización de Rendimiento (LCP & TBT), 2. 🎨 Filosofía de Animación (Híbrida), 3. 🧩 SSoT (Única Fuente de Verdad), 4. 🗄️ Acceso a Datos, 5. 💅 Consistencia Visual, 8. 📚 Consulta Obligatoria de Skills Antes de Implementar, 9. 🦧 Modo Caveman Obligatorio (Tersura Absoluta), Ejemplo de cómo recomendar una mejora (+3 more)

### Community 33 - "Community 33"
Cohesion: 0.13
Nodes (18): AdminDashboard(), SearchInput(), DeleteEventDialog(), EventDialog(), ManageCategoriesDialog(), OperationProgressDialog(), PurgeUserDialog(), RegistrationDialog() (+10 more)

### Community 34 - "Community 34"
Cohesion: 0.13
Nodes (16): ALL_LUCIDE_ICONS, CATEGORY_ICONS, CATEGORY_LABELS, CategoryTabs(), CategoryTabsProps, CheckRegistrationPanel(), HeroSection(), MonthTabs() (+8 more)

### Community 35 - "Community 35"
Cohesion: 0.50
Nodes (3): customCache, serwist, WorkerGlobalScope

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (9): Header(), HeaderProps, InstallPwaButton(), Logo(), LogoProps, useNotifications(), usePersonalRealtime(), ThemeToggle() (+1 more)

### Community 37 - "Community 37"
Cohesion: 0.14
Nodes (17): d(), delete(), deleteCacheAndMetadata(), deleteEntry(), getAll(), getAllEntriesByQueueName(), getEndEntryFromIndex(), getFirstEntryByQueueName() (+9 more)

### Community 38 - "Community 38"
Cohesion: 0.29
Nodes (4): HomeSyncProps, AdminRealtimeProps, supabase, PersonalRealtimeProps

### Community 39 - "Community 39"
Cohesion: 0.19
Nodes (13): addEntry(), eu(), getDb(), getEntryCountByQueueName(), getFirstEntryId(), _getId(), getTimestamp(), isURLExpired() (+5 more)

### Community 40 - "Community 40"
Cohesion: 0.24
Nodes (9): Event, getEvents(), redis, sitemap(), TIMEZONE_SHORT_CODES, transformEventForUI(), GET(), HomeDataWrapper() (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.20
Nodes (10): SOLID React & Next.js Principles, SSoT via transformEventForUI, Dual Identity and Authentication Strategy, Keap CRM Real-Time Sync, llms.txt AI Optimization (AIO), Server Actions Data Access Layer, Upstash Redis Cache Layer, Clerk Theme Propagation (+2 more)

### Community 42 - "Community 42"
Cohesion: 0.40
Nodes (4): AuthSection(), AuthSectionProps, HeaderAlerts(), NotificationBell()

### Community 43 - "Community 43"
Cohesion: 0.27
Nodes (10): _addRequest(), clone(), fetchDidFail(), fromRequest(), pushRequest(), registerSync(), replayRequests(), shiftRequest() (+2 more)

### Community 44 - "Community 44"
Cohesion: 0.22
Nodes (6): useMetrics(), MetricKpiCard(), MetricsView(), MetricsViewProps, SimpleProgressBar(), TrendChart()

### Community 45 - "Community 45"
Cohesion: 0.21
Nodes (10): Footer(), SocialIcon(), SocialIconProps, useHomeLogic(), SOCIAL_LINKS, HomeClient(), HomeClientProps, RegisteredView (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.21
Nodes (14): PickerOption, SearchablePicker(), SearchablePickerProps, KeapTagPicker(), KeapTagPickerProps, Command(), CommandDialog(), CommandEmpty() (+6 more)

### Community 47 - "Community 47"
Cohesion: 0.40
Nodes (5): 6. 🏗️ Arquitectura DRY y Domain-Driven Colocation, 🔩 Componentes de Infraestructura Existentes (No Duplicar), Estructura de `/components`, Regla de Auditoría Obligatoria, Reglas DRY (Don't Repeat Yourself)

### Community 48 - "Community 48"
Cohesion: 0.17
Nodes (12): 1. 🖌️ Identidad Visual, Paleta de Colores y Tailwind CSS v4, 2. 🔤 Tipografía, 3. 📐 Formas, Sombras y Geometría (Borders & Layout), 4. ✨ Sistema de Animaciones, 5. 🏗️ Arquitectura de Componentes del Home (`/components/home`), 6. 🏢 Diseño Administrativo Multi-Tema & Camaleónico, Animaciones de Interacción (GSAP), Animaciones Nativas (Tailwind / CSS) (+4 more)

### Community 49 - "Community 49"
Cohesion: 0.24
Nodes (7): DRY and Domain-Driven Colocation, Hybrid Animation Philosophy, LCP & TBT Performance Optimization, animateCardsTransition Filter Orchestrator, DotScrollbar Elastic Scroll System, Tailwind v4 CSS Variable-Based Tokens, This is NOT the Next.js you know

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (5): 7. 🔩 Principios SOLID (Adaptados a React / Next.js), D — Dependency Inversion (Depende de abstracciones, no implementaciones), I — Interface Segregation (No fuerces props innecesarias), O — Open/Closed (Abierto para extensión, cerrado para modificación), S — Single Responsibility (Una sola razón para cambiar)

### Community 51 - "Community 51"
Cohesion: 0.20
Nodes (9): 🏗️ Arquitectura del Sistema, ⚡ Capa de Rendimiento (Redis), 🧩 Capas de la Aplicación, 🔐 Estrategia de Identidad Dual, Eventos Chu - Plataforma de Gestión de Eventos Premium, 🛠️ Gestión Operativa (Admin Dashboard), ⚙️ Integraciones y Flujo de Datos, 🔗 Sincronización Keap (CRM) (+1 more)

### Community 52 - "Community 52"
Cohesion: 0.29
Nodes (5): { createClient }, envFile, fs, lines, supabase

### Community 53 - "Community 53"
Cohesion: 0.33
Nodes (4): envFile, fs, lines, { Redis }

### Community 54 - "Community 54"
Cohesion: 0.29
Nodes (7): cacheDidUpdate(), cachedResponseWillBeUsed(), expireEntries(), _getCacheExpiration(), _getDateHeaderTimestamp(), _isResponseDateFresh(), updateTimestamp()

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (4): fs, p192, p512, path

## Knowledge Gaps
- **277 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+272 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Primitive UI Components` to `Community 33`, `Category and Event Dialogs`, `Global Header and Navigation`, `Public Registration and Attendees`, `Event Fetching and State`, `Admin Layout and SEO`, `Admin Data Tables`, `External Node Modules`, `Community 34`, `Community 42`, `Community 10`, `Community 44`, `Admin Login and Cards`, `Community 46`, `Community 45`, `Form Inputs and Textareas`?**
  _High betweenness centrality (0.242) - this node is a cross-community bridge._
- **Why does `fetch()` connect `Notification Bell and Alert UI` to `Searchable Dropdowns and Pickers`, `Admin Database Operations`, `Community 43`, `Community 39`?**
  _High betweenness centrality (0.176) - this node is a cross-community bridge._
- **Why does `keapFetch()` connect `Admin Database Operations` to `Notification Bell and Alert UI`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _280 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Database Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.07190635451505016 - nodes in this community are weakly interconnected._
- **Should `Category and Event Dialogs` be split into smaller, more focused modules?**
  _Cohesion score 0.09070714550166604 - nodes in this community are weakly interconnected._
- **Should `Public Registration and Attendees` be split into smaller, more focused modules?**
  _Cohesion score 0.05925925925925926 - nodes in this community are weakly interconnected._
# Graph Report - eventosCHU  (2026-05-22)

## Corpus Check
- 144 files · ~64,261 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 705 nodes · 1627 edges · 43 communities (39 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fffa9749`
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
- [[_COMMUNITY_Architecture and Principles Documentation|Architecture and Principles Documentation]]
- [[_COMMUNITY_Primitive UI Components|Primitive UI Components]]
- [[_COMMUNITY_TypeScript Project Configuration|TypeScript Project Configuration]]
- [[_COMMUNITY_Admin Login and Cards|Admin Login and Cards]]
- [[_COMMUNITY_Custom and Sidebar Scrollbars|Custom and Sidebar Scrollbars]]
- [[_COMMUNITY_Form Inputs and Textareas|Form Inputs and Textareas]]
- [[_COMMUNITY_Development Dependencies|Development Dependencies]]
- [[_COMMUNITY_Metrics Dashboard and KPIs|Metrics Dashboard and KPIs]]
- [[_COMMUNITY_Event Presentation Cards|Event Presentation Cards]]
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

## God Nodes (most connected - your core abstractions)
1. `cn()` - 144 edges
2. `Button()` - 28 edges
3. `insertAdminNotification()` - 17 edges
4. `compilerOptions` - 16 edges
5. `syncKeapTags()` - 16 edges
6. `formatEventForNotification()` - 14 edges
7. `Input()` - 14 edges
8. `dispatchSignal()` - 14 edges
9. `broadcastToUser()` - 13 edges
10. `updateRegistration()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  lib/utils.ts → package.json
- `MetricKpiCard()` --calls--> `cn()`  [EXTRACTED]
  app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx → lib/utils.ts
- `SimpleProgressBar()` --calls--> `cn()`  [EXTRACTED]
  app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx → lib/utils.ts
- `TrendChart()` --calls--> `cn()`  [EXTRACTED]
  app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx → lib/utils.ts
- `EventDetailItem()` --calls--> `cn()`  [EXTRACTED]
  components/events/event-card.tsx → lib/utils.ts

## Communities (43 total, 4 thin omitted)

### Community 0 - "Admin Database Operations"
Cohesion: 0.08
Nodes (64): supabaseAdmin, verifyAdminPermission(), adminAddEventToUser(), adminRemoveEventFromUser(), clerk, deleteRegistration(), deleteRegistrationByClerkId(), massUpdateRegistrationStatus() (+56 more)

### Community 1 - "Category and Event Dialogs"
Cohesion: 0.08
Nodes (51): createCategory(), deleteCategory(), updateCategory(), SearchInput(), DeleteEventDialog(), DeleteEventDialogProps, BG_COLOR_OPTIONS, EventDialog() (+43 more)

### Community 2 - "Event Fetching and State"
Cohesion: 0.24
Nodes (9): Event, getEvents(), redis, sitemap(), TIMEZONE_SHORT_CODES, transformEventForUI(), GET(), EventJsonLd() (+1 more)

### Community 3 - "Global Header and Navigation"
Cohesion: 0.10
Nodes (18): Header(), HeaderProps, AdminDashboard(), AuthSection(), AuthSectionProps, HeaderAlerts(), Logo(), LogoProps (+10 more)

### Community 4 - "Public Registration and Attendees"
Cohesion: 0.07
Nodes (34): getRegistrationsCount(), checkRegistration(), EventCard(), CitySelector(), CitySelectorProps, ContactFooterCard(), isSurveyCompleted(), NextStepsPanel() (+26 more)

### Community 5 - "Admin Layout and SEO"
Cohesion: 0.10
Nodes (18): metadata, raleway, SearchInputProps, HeaderAlertsProps, HeroSectionProps, WordRotator, GTMProvider(), ThemeProvider() (+10 more)

### Community 6 - "External Node Modules"
Cohesion: 0.07
Nodes (29): dependencies, @base-ui/react, canvas-confetti, class-variance-authority, @clerk/localizations, @clerk/nextjs, @clerk/ui, clsx (+21 more)

### Community 7 - "Admin Data Tables"
Cohesion: 0.15
Nodes (19): formatDateToShort(), formatSafeDate(), EventsTableProps, RegistrationsTableProps, Badge(), badgeVariants, EventFlag(), EventFlagProps (+11 more)

### Community 8 - "Searchable Dropdowns and Pickers"
Cohesion: 0.21
Nodes (14): PickerOption, SearchablePicker(), SearchablePickerProps, KeapTagPicker(), KeapTagPickerProps, Command(), CommandDialog(), CommandEmpty() (+6 more)

### Community 9 - "Shadcn Components Schema"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Architecture and Principles Documentation"
Cohesion: 0.15
Nodes (13): DRY and Domain-Driven Colocation, Hybrid Animation Philosophy, LCP & TBT Performance Optimization, SOLID React & Next.js Principles, SSoT via transformEventForUI, Keap CRM Real-Time Sync, llms.txt AI Optimization (AIO), Server Actions Data Access Layer (+5 more)

### Community 11 - "Primitive UI Components"
Cohesion: 0.12
Nodes (18): cn(), RegistrationForm(), Checkbox(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel() (+10 more)

### Community 12 - "TypeScript Project Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 13 - "Admin Login and Cards"
Cohesion: 0.18
Nodes (11): StatCard(), StatCardProps, StatsGrid(), StatsGridProps, Card(), CardAction(), CardContent(), CardDescription() (+3 more)

### Community 14 - "Custom and Sidebar Scrollbars"
Cohesion: 0.21
Nodes (7): Sidebar(), SIDEBAR_LINKS, SidebarProps, DotScrollbar(), DotScrollbarProps, SidebarScrollbar(), SidebarScrollbarProps

### Community 15 - "Form Inputs and Textareas"
Cohesion: 0.24
Nodes (9): InputGroup(), InputGroupAddon(), inputGroupAddonVariants, InputGroupButton(), inputGroupButtonVariants, InputGroupInput(), InputGroupText(), InputGroupTextarea() (+1 more)

### Community 16 - "Development Dependencies"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/canvas-confetti, @types/node, @types/react (+2 more)

### Community 17 - "Metrics Dashboard and KPIs"
Cohesion: 0.25
Nodes (6): useMetrics(), MetricKpiCard(), MetricsView(), MetricsViewProps, SimpleProgressBar(), TrendChart()

### Community 18 - "Event Presentation Cards"
Cohesion: 0.32
Nodes (5): EventCardProps, EventDetailItem(), EventProgressBar(), EventProgressBarProps, EventSoldOutOverlay()

### Community 19 - "Notification Bell and Alert UI"
Cohesion: 0.21
Nodes (11): Notification, formatRelativeTime(), NotificationBellProps, NotificationItem(), NotificationItemProps, Popover(), PopoverContent(), PopoverDescription() (+3 more)

### Community 20 - "PNPM Package Definition"
Cohesion: 0.25
Nodes (7): name, @tanstack/query-core, packageManager, pnpm, overrides, private, version

### Community 21 - "Build and Dev Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 22 - "Supabase Client and API Proxy"
Cohesion: 0.50
Nodes (3): config, response, supabase

### Community 31 - "Community 31"
Cohesion: 0.09
Nodes (22): 1. Inyección en el Layout (`app/(public)/layout.tsx`), ☀️ 1. Tema Light (Estándar/Default), 1. Variables de Estructura e Interfaz, 📚 2. Tema Dark ("Libro Viejo"), 2. Variables de Scrollbar y Navegación (GSAP), 3. Efectos Visuales CSS, 🌃 3. Tema Synthwave ("Retro-futurismo"), 📟 4. Tema Hacker ("Matrix") (+14 more)

### Community 32 - "Community 32"
Cohesion: 0.10
Nodes (21): 1. ⚡ Optimización de Rendimiento (LCP & TBT), 2. 🎨 Filosofía de Animación (Híbrida), 3. 🧩 SSoT (Única Fuente de Verdad), 4. 🗄️ Acceso a Datos, 5. 💅 Consistencia Visual, 6. 🏗️ Arquitectura DRY y Domain-Driven Colocation, 7. 🔩 Principios SOLID (Adaptados a React / Next.js), 8. 📚 Consulta Obligatoria de Skills Antes de Implementar (+13 more)

### Community 33 - "Community 33"
Cohesion: 0.19
Nodes (11): Footer(), SocialIcon(), SocialIconProps, PublicView(), useHomeLogic(), SOCIAL_LINKS, HomeClient(), HomeClientProps (+3 more)

### Community 34 - "Community 34"
Cohesion: 0.15
Nodes (12): ALL_LUCIDE_ICONS, CATEGORY_ICONS, CATEGORY_LABELS, CategoryTabs(), CategoryTabsProps, CheckRegistrationPanel(), HeroSection(), MonthTabs() (+4 more)

### Community 35 - "Community 35"
Cohesion: 0.24
Nodes (4): EventsSkeleton(), HeaderSkeleton(), HomeDataWrapper(), Skeleton()

### Community 36 - "Community 36"
Cohesion: 0.17
Nodes (12): 1. 🖌️ Identidad Visual, Paleta de Colores y Tailwind CSS v4, 2. 🔤 Tipografía, 3. 📐 Formas, Sombras y Geometría (Borders & Layout), 4. ✨ Sistema de Animaciones, 5. 🏗️ Arquitectura de Componentes del Home (`/components/home`), 6. 🏢 Diseño Administrativo Multi-Tema & Camaleónico, Animaciones de Interacción (GSAP), Animaciones Nativas (Tailwind / CSS) (+4 more)

### Community 37 - "Community 37"
Cohesion: 0.20
Nodes (9): 🏗️ Arquitectura del Sistema, ⚡ Capa de Rendimiento (Redis), 🧩 Capas de la Aplicación, 🔐 Estrategia de Identidad Dual, Eventos Chu - Plataforma de Gestión de Eventos Premium, 🛠️ Gestión Operativa (Admin Dashboard), ⚙️ Integraciones y Flujo de Datos, 🔗 Sincronización Keap (CRM) (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.33
Nodes (5): EventsCarousel(), EventsCarouselProps, MonthTabsProps, ANIM_CONFIG, ANIM_SELECTORS

### Community 39 - "Community 39"
Cohesion: 0.22
Nodes (9): 1. Base de Datos Relacional (PostgreSQL), 2. Canales de Progreso en Tiempo Real (Keap CRM Sync), 3. Lógica de Negocio en Inteligencia y Métricas, 🏛️ Arquitectura Técnica: Eventos HyenUk Chu, 📚 Documentación de Contexto Adicional, ⚡ Estrategia de SEO & AIO (Artificial Intelligence Optimization), 💡 Ideas y Patrones para el Futuro, 🗄️ Modelado de Datos y Sincronización Realtime (+1 more)

### Community 40 - "Community 40"
Cohesion: 0.22
Nodes (9): 🧱 `/components` (Biblioteca de Interfaces Reutilizables), `/components/events` (Motor Visual de Tarjetas), `/components/footer` & `/components/header`, `/components/home` (Bloques de la Página de Inicio), `/components/notifications`, `/components/providers` (Wrappers de Infraestructura), `/components/registration` (Motor de Formularios), `/components/seo` (+1 more)

### Community 41 - "Community 41"
Cohesion: 0.25
Nodes (8): `/app/actions` (Server Actions - El Motor Backend), `/app/api` (Endpoints de API tradicionales HTTP), 🌐 `/app` (App Router - Rutas y Server Actions), Archivos de Configuración Raíz, Archivos Principales y Rutas Raíz de `/app`, 📂 Estructura Exhaustiva del Proyecto, 🎣 `/hooks` (Lógica Reactiva del Cliente), 🛠️ `/lib` (Librerías, Backend Crudo y Utilidades Maestras)

### Community 42 - "Community 42"
Cohesion: 0.50
Nodes (4): Dual Identity and Authentication Strategy, Clerk Theme Propagation, Camaleonic Multi-Theme Engine, Camaleonic SVG Styling Rule

## Knowledge Gaps
- **237 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+232 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Primitive UI Components` to `Category and Event Dialogs`, `Community 33`, `Global Header and Navigation`, `Community 34`, `Admin Layout and SEO`, `Public Registration and Attendees`, `Admin Data Tables`, `Searchable Dropdowns and Pickers`, `Community 38`, `Community 35`, `External Node Modules`, `Admin Login and Cards`, `Custom and Sidebar Scrollbars`, `Form Inputs and Textareas`, `Metrics Dashboard and KPIs`, `Event Presentation Cards`, `Notification Bell and Alert UI`?**
  _High betweenness centrality (0.288) - this node is a cross-community bridge._
- **Why does `dependencies` connect `External Node Modules` to `PNPM Package Definition`?**
  _High betweenness centrality (0.101) - this node is a cross-community bridge._
- **Why does `clsx` connect `External Node Modules` to `Primitive UI Components`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _240 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Database Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.07955182072829131 - nodes in this community are weakly interconnected._
- **Should `Category and Event Dialogs` be split into smaller, more focused modules?**
  _Cohesion score 0.08069620253164557 - nodes in this community are weakly interconnected._
- **Should `Global Header and Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.10317460317460317 - nodes in this community are weakly interconnected._
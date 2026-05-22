# Graph Report - .  (2026-05-22)

## Corpus Check
- 147 files · ~64,122 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 614 nodes · 1536 edges · 31 communities (27 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.91)
- Token cost: 0 input · 0 output

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

## Communities (31 total, 4 thin omitted)

### Community 0 - "Admin Database Operations"
Cohesion: 0.08
Nodes (64): supabaseAdmin, verifyAdminPermission(), adminAddEventToUser(), adminRemoveEventFromUser(), clerk, deleteRegistration(), deleteRegistrationByClerkId(), massUpdateRegistrationStatus() (+56 more)

### Community 1 - "Category and Event Dialogs"
Cohesion: 0.10
Nodes (41): createCategory(), deleteCategory(), updateCategory(), DeleteEventDialogProps, BG_COLOR_OPTIONS, EventDialogProps, TIMEZONE_LABELS, AVAILABLE_ICONS (+33 more)

### Community 2 - "Event Fetching and State"
Cohesion: 0.06
Nodes (41): Event, getEvents(), redis, sitemap(), Footer(), SocialIcon(), SocialIconProps, ALL_LUCIDE_ICONS (+33 more)

### Community 3 - "Global Header and Navigation"
Cohesion: 0.06
Nodes (36): Header(), HeaderProps, AdminDashboard(), SearchInput(), DeleteEventDialog(), EventDialog(), ManageCategoriesDialog(), OperationProgressDialog() (+28 more)

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
Cohesion: 0.15
Nodes (20): PickerOption, SearchablePicker(), SearchablePickerProps, KeapTagPicker(), KeapTagPickerProps, Command(), CommandDialog(), CommandEmpty() (+12 more)

### Community 9 - "Shadcn Components Schema"
Cohesion: 0.09
Nodes (21): aliases, components, hooks, lib, ui, utils, iconLibrary, menuAccent (+13 more)

### Community 10 - "Architecture and Principles Documentation"
Cohesion: 0.13
Nodes (16): DRY and Domain-Driven Colocation, Hybrid Animation Philosophy, LCP & TBT Performance Optimization, SOLID React & Next.js Principles, SSoT via transformEventForUI, Dual Identity and Authentication Strategy, Keap CRM Real-Time Sync, llms.txt AI Optimization (AIO) (+8 more)

### Community 11 - "Primitive UI Components"
Cohesion: 0.15
Nodes (12): cn(), Checkbox(), DialogOverlay(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem() (+4 more)

### Community 12 - "TypeScript Project Configuration"
Cohesion: 0.10
Nodes (19): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+11 more)

### Community 13 - "Admin Login and Cards"
Cohesion: 0.23
Nodes (9): StatCard(), StatCardProps, Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader() (+1 more)

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
Cohesion: 0.43
Nodes (5): Notification, formatRelativeTime(), NotificationBellProps, NotificationItem(), NotificationItemProps

### Community 20 - "PNPM Package Definition"
Cohesion: 0.25
Nodes (7): name, @tanstack/query-core, packageManager, pnpm, overrides, private, version

### Community 21 - "Build and Dev Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, start

### Community 22 - "Supabase Client and API Proxy"
Cohesion: 0.50
Nodes (3): config, response, supabase

## Knowledge Gaps
- **170 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+165 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Primitive UI Components` to `Category and Event Dialogs`, `Event Fetching and State`, `Global Header and Navigation`, `Public Registration and Attendees`, `Admin Layout and SEO`, `External Node Modules`, `Admin Data Tables`, `Searchable Dropdowns and Pickers`, `Admin Login and Cards`, `Custom and Sidebar Scrollbars`, `Form Inputs and Textareas`, `Metrics Dashboard and KPIs`, `Event Presentation Cards`, `Notification Bell and Alert UI`?**
  _High betweenness centrality (0.380) - this node is a cross-community bridge._
- **Why does `dependencies` connect `External Node Modules` to `PNPM Package Definition`?**
  _High betweenness centrality (0.133) - this node is a cross-community bridge._
- **Why does `clsx` connect `External Node Modules` to `Primitive UI Components`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _173 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Database Operations` be split into smaller, more focused modules?**
  _Cohesion score 0.07955182072829131 - nodes in this community are weakly interconnected._
- **Should `Category and Event Dialogs` be split into smaller, more focused modules?**
  _Cohesion score 0.09588421528720036 - nodes in this community are weakly interconnected._
- **Should `Event Fetching and State` be split into smaller, more focused modules?**
  _Cohesion score 0.05505952380952381 - nodes in this community are weakly interconnected._
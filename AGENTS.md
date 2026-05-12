<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# 🤖 Reglas Maestras para Agentes IA (Eventos HyenUk Chu)

**CRÍTICO:** Como Agente de Inteligencia Artificial operando en este repositorio, debes acatar estrictamente las siguientes reglas arquitectónicas y de diseño. Cualquier desviación arruinará el SEO, el performance (Lighthouse) o la consistencia visual.

## 1. ⚡ Optimización de Rendimiento (LCP & TBT)
- **Nunca inyectes `GSAP` en el Root Layout o en el hilo principal de carga.** GSAP paraliza el celular (`Total Blocking Time`).
- Cualquier componente pesado o interactivo (Scrollbars, Carruseles, Rotadores de palabras) **debe** envolverse en un `next/dynamic` con `ssr: false` o cargarse asíncronamente después del esqueleto inicial.
- **Prohibido el `ssr: false` en Server Components**: En Next.js App Router, no puedes hacer un `dynamic(..., { ssr: false })` dentro de un componente de servidor puro. Debes crear un envoltorio `"use client"`.

## 2. 🎨 Filosofía de Animación (Híbrida)
- **Para Entradas (Initial Mount):** Usa exclusivamente Tailwind CSS (`animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-[x]`). Esto garantiza que el First Contentful Paint (FCP) sea casi 0 milisegundos.
- **Para Interacciones:** Usa GSAP (`useGSAP`) **solo** para animaciones accionadas por el usuario (scroll, hover, micro-nudges).

## 3. 🧩 SSoT (Única Fuente de Verdad)
- Nunca formatees fechas, ubicaciones o precios manualmente en un nuevo componente.
- **REGLA DE ORO:** Si vas a mostrar datos de un evento, debes importar y usar obligatoriamente `transformEventForUI()` de `@/lib/event-transformers.ts`. Esto garantiza que los humanos, Google (JSON-LD) y las IAs (llms.txt) lean exactamente las mismas palabras ("Por confirmar", "Evento sin costo").

## 4. 🗄️ Acceso a Datos
- No crees rutas `/api/...` tradicionales para el frontend. Todo el CRUD y la interacción con la base de datos se maneja vía **Server Actions** en `app/actions/`.
- La función principal `getEvents()` utiliza caché de **Redis (Upstash)**. Si creas una acción de escritura, recuerda limpiar el caché con `clearEventsCache()`.

## 5. 💅 Consistencia Visual
- Lee `DESIGN.md` antes de crear UI.
- No uses esquinas afiladas. Todo el diseño utiliza radios masivos (`rounded-[32px]`, `rounded-[48px]`, `rounded-full`).
- No inventes colores. Usa el Primary Blue (`#3154DC`) para llamadas a la acción primarias y el Link Blue (`#007AFF`) para enlaces secundarios.

## 6. 🏗️ Arquitectura DRY y Domain-Driven Colocation

Este proyecto sigue el paradigma oficial de Next.js App Router llamado **Colocation (Colocación por Dominio)**. Las reglas son absolutas:

### Estructura de `/components`
- La carpeta raíz de `components/` **solo puede contener orquestadores** (`header.tsx`, `footer.tsx`). Estos son archivos que delegan en sus subcarpetas de dominio.
- **Prohibido** crear archivos `.tsx` sueltos en la raíz de `components/`. Todo componente nuevo debe vivir en su carpeta de dominio correspondiente:
  - Lógica de tarjetas de evento → `components/events/`
  - Componentes del Home (Hero, Carrusel, etc.) → `components/home/`
  - Formularios de registro y modales → `components/registration/`
  - Alertas y notificaciones → `components/notifications/`
  - Wrappers de servicios externos (Analytics, etc.) → `components/providers/`
  - Componentes de SEO (JSON-LD) → `components/seo/`
  - Componentes base de Shadcn/Radix → `components/ui/`

### Reglas DRY (Don't Repeat Yourself)
- **Antes de crear** un nuevo componente, hook o función, busca si ya existe algo similar con `grep_search`. No dupliques lógica.
- **Antes de mover o refactorizar** cualquier archivo, ejecuta `grep_search` para encontrar todos los archivos que lo importan y actualiza **todos** sus imports simultáneamente.
- Si un componente se usa en más de un dominio, muévelo a `components/ui/` (si es visual genérico) o a `lib/` (si es lógica pura).
- **Los hooks del admin viven dentro del admin** (`app/admin/.../hooks/`). Los hooks del home viven en `hooks/home/`. No los mezcles.
- **Nunca repitas lógica de transformación de datos.** Toda transformación de eventos pasa por `transformEventForUI()` sin excepción.

### Regla de Auditoría Obligatoria
- Antes de modificar cualquier archivo, abre el archivo, léelo completo y ejecuta `grep_search` para entender su alcance. Si tienes dudas sobre si un cambio puede romper algo, **pregunta primero**.

## 7. 🔩 Principios SOLID (Adaptados a React / Next.js)

SOLID no es teoría de Java. Aquí está traducido a decisiones reales de este proyecto:

### S — Single Responsibility (Una sola razón para cambiar)
- Cada componente hace **una sola cosa**. `EventCard` solo pinta una tarjeta. `transformEventForUI` solo formatea datos. `getEvents` solo obtiene eventos.
- Si un componente necesita más de ~200 líneas, es señal de que hace demasiado y debe dividirse.
- **Prohibido**: un componente que a la vez hace fetch, transforma datos Y renderiza UI. Separa la lógica en un hook y deja el componente como vista pura.

### O — Open/Closed (Abierto para extensión, cerrado para modificación)
- Si necesitas un nuevo tipo de tarjeta de evento, **no modifiques `EventCard`**. Crea un componente que lo envuelva o extiende vía props.
- Si necesitas un nuevo estado de evento (ej. `WAITLIST`), añádelo en `lib/event-config.ts` — no pongas un `if (status === 'waitlist')` directo en el JSX de una tarjeta.
- Las reglas de formato van en `event-transformers.ts`. Las reglas de UI van en `event-config.ts`. Nunca al revés.

### I — Interface Segregation (No fuerces props innecesarias)
- Si un componente recibe más de **6-7 props**, es una señal de alerta. Probablemente está haciendo demasiado o necesita ser dividido.
- **Prohibido el Prop Drilling**: si necesitas pasar un dato por 3+ niveles de componentes, usa un hook de contexto o eleva la lógica a un Server Component.
- Ejemplo correcto: `EventCard` recibe `title`, `date`, `city` — datos simples y directos. Ejemplo incorrecto: pasarle el objeto `event` completo y que el componente lo desestructure internamente (eso rompe el encapsulamiento).

### D — Dependency Inversion (Depende de abstracciones, no implementaciones)
- Los componentes no deben importar `supabase` directamente. Toda interacción con BD pasa por **Server Actions** en `app/actions/`.
- Los componentes no formatean fechas con `new Date()` directo. Usan `formatSafeDate()` de `lib/date-utils.ts`.
- Los componentes no leen datos crudos de eventos. Usan `transformEventForUI()` de `lib/event-transformers.ts`.
- **La regla**: si una implementación de tercero cambia (Supabase → otra BD, Clerk → otro auth), solo debes cambiar el archivo de `lib/` o `actions/`, nunca tocar los componentes.

## 8. 📚 Consulta Obligatoria de Skills Antes de Implementar

Antes de escribir **cualquier** bloque de código nuevo (componente, hook, animación, query, etc.), debes consultar la carpeta de skills en `.agents/skills/` para verificar si existe una guía oficial que cubra esa tecnología.

### El Protocolo de Skills
1. **Identifica la tecnología** que vas a usar (GSAP, Clerk, Supabase, Next.js, Tailwind, Shadcn, etc.).
2. **Lee el `SKILL.md` correspondiente** antes de escribir una sola línea. No asumas que sabes la API de memoria — las versiones cambian y los skills tienen los patrones actualizados y probados en producción.
3. **Si encuentras una mejor manera** de implementar algo que la actual (patrón más performante, API más moderna, menor bundle size, mejor UX), **no la implementes en silencio**. Debes:
   - Explicar qué detectaste y por qué es mejor.
   - Mostrar la diferencia concreta (antes vs. después).
   - **Preguntar al usuario si desea implementar el cambio** antes de tocar nada.

### Skills disponibles en `.agents/skills/`
| Skill | Cuándo consultarlo |
|---|---|
| `gsap-react` | Cualquier animación en componentes React |
| `gsap-scrolltrigger` | Animaciones basadas en scroll |
| `gsap-performance` | Si la animación produce jank o bajo FPS |
| `gsap-plugins` | SplitText, Flip, Draggable, ScrollSmoother |
| `next-best-practices` | Patrones de RSC, data fetching, caché |
| `next-cache-components` | Directivas `use cache`, PPR, `cacheTag` |
| `clerk-nextjs-patterns` | Middleware, Server Actions con auth, caché |
| `clerk-custom-ui` | Temas, colores, fuentes en los modales de Clerk |
| `clerk-webhooks` | Sincronización de usuarios con Supabase |
| `shadcn` | Agregar, modificar o debuggear componentes Shadcn |
| `tailwind-v4-shadcn` | Problemas de tema, dark mode, CSS variables |
| `seo` | Meta tags, structured data, sitemap, robots |
| `supabase-postgres-best-practices` | Queries, índices, RLS, performance de BD |
| `react-best-practices` | Performance en componentes, memoización, bundles |
| `composition-patterns` | Compound components, render props, context |
| `accessibility` | WCAG 2.2, keyboard nav, screen readers |
| `frontend-design` | UI/UX, diseño de componentes nuevos |
| `deploy-to-vercel` | Deployments, preview deployments, variables de entorno |

### Ejemplo de cómo recomendar una mejora
> 💡 **Mejora detectada:** Noté que `events-carousel.tsx` recalcula los eventos filtrados en cada render sin memoización. Según el skill `react-best-practices`, esto puede causar re-renders innecesarios al cambiar el mes activo. La solución es envolver el cálculo en `useMemo`. ¿Deseas que lo implemente?

> 💡 **Nota sobre Experimentos:** Para funcionalidades experimentales o pruebas A/B, consulta la sección de **Vercel Flags** en `ARCHITECTURE.md` antes de proceder con una implementación tradicional.

*Si has entendido estas reglas, estás listo para programar sin romper la matrix.*

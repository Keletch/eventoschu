# Mapeo de Colores del Tema Light ☀️

Este documento detalla todos los colores hexadecimales y tokens semánticos del tema **Light** actual, divididos por las secciones del sitio web.

---

## 🎨 Paleta Base y Fallbacks Globales

| Token / Variable | Color Hex | Uso y Contexto General |
| :--- | :--- | :--- |
| `--background` | `#FFFFFF` | Fondo general de la página y del body. |
| `--foreground` | `#00030C` | Color principal de textos y contenido neutro oscuro. |
| `--surface` | `#F5F6F9` | Fondo de contenedores secundarios y tarjetas secundarias. |
| `--surface-foreground` | `#00030C` | Texto dentro de áreas de superficie secundaria. |
| `--surface-border` | `rgba(0, 0, 0, 0.05)` | Borde sutil para contenedores y tarjetas secundarias. |
| `--border` | `#F1F5F9` | Color estándar para bordes y separadores. |
| `--input` | `#F1F5F9` | Fondo de campos de entrada (inputs, selects). |
| `--ring` | `#3154DC` | Anillo de enfoque (focus indicator) para accesibilidad y botones. |
| `--primary` | `#3154DC` | Azul principal corporativo (llamadas a la acción primarias). |
| `--primary-foreground` | `#FFFFFF` | Texto o iconos sobre fondos de color primario (blanco). |
| `--secondary` | `#007AFF` | Azul secundario (enlaces, botones secundarios). |
| `--secondary-foreground` | `#FFFFFF` | Texto o iconos sobre fondos de color secundario. |
| `--muted` | `#F5F6F9` | Fondo para elementos deshabilitados o menos importantes. |
| `--muted-foreground` | `#6B7280` | Texto secundario/desvanecido (gris). |
| `--accent` | `#F1F5F9` | Fondo destacado sutil para elementos activos o hovered. |
| `--accent-foreground` | `#3154DC` | Texto destacado sobre fondo accent. |
| `--popover` | `#FFFFFF` | Fondo de menús flotantes, tooltips, modales y popovers. |
| `--popover-foreground` | `#00030C` | Texto dentro de los popovers o menús flotantes. |
| `--card` | `#FFFFFF` | Fondo de tarjetas generales. |
| `--card-foreground` | `#00030C` | Texto dentro de tarjetas generales. |

---

## 🏠 Sección 1: Home y Hero (Paso 1)

| Token / Variable | Color Hex | Uso Específico |
| :--- | :--- | :--- |
| `--hero-badge-bg` | `rgba(49, 84, 220, 0.1)` | Fondo del badge de categoría en la sección de bienvenida. |
| `--hero-badge-text` | `#3154DC` | Texto del badge de categoría en la sección de bienvenida. |
| `--hero-badge-border` | `rgba(49, 84, 220, 0.2)` | Borde del badge de categoría en el Hero. |
| `--hero-title` | `#000000` | Título del Hero (Club de Inversionistas). |
| `--hero-desc` | `#4B5563` | Subtítulo descriptivo del Hero. |
| `--hero-btn-bg` | `#3154DC` | Botón principal de llamada a la acción en el Hero. |
| `--hero-btn-text` | `#FFFFFF` | Texto del botón principal en el Hero. |
| `--tab-active-bg` | `#3154DC` | Fondo del botón de filtro/navegación activo. |
| `--tab-active-text` | `#FFFFFF` | Texto del botón de filtro/navegación activo. |
| `--category-tab-active-bg` | `#3154DC` | Fondo de la categoría de filtro activa. |
| `--category-tab-active-text`| `#FFFFFF` | Texto de la categoría de filtro activa. |
| `--tab-inactive-bg` | `#F5F6F9` | Fondo de las pestañas inactivas. |
| `--tab-inactive-text` | `#A3A3A3` | Texto de las pestañas inactivas. |
| `--tab-border` | `transparent` | Borde de las pestañas inactiva. |
| `--card-border` | `#FFFFFF` | Borde de las Event Cards. |
| `--card-title` | `#030712` | Título del evento dentro de las Event Cards. |
| `--card-text` | `#404040` | Texto secundario y descriptivo de la Event Card. |
| `--card-icon` | `#A3A3A3` | Iconos de información (fecha, hora, lugar) dentro de la Event Card. |
| `--card-badge-text` | `#2563EB` | Texto destacado de badges dentro del evento. |

---

## 📝 Sección 2: Formulario de Registro (Paso 2)

| Token / Variable | Color Hex | Uso Específico |
| :--- | :--- | :--- |
| `--form-card-bg` | `#FFFFFF` | Fondo del contenedor del formulario de registro. |
| `--form-card-border` | `#FFFFFF` | Borde del contenedor del formulario. |
| `--form-label` | `#03133F` | Color de las etiquetas (labels) del formulario. |
| `--form-input-bg` | `#FFFFFF` | Fondo de los campos de texto del formulario. |
| `--form-input-border` | `rgba(97, 107, 119, 0.4)` | Borde de los campos de texto del formulario. |
| `--form-input-text` | `#03133F` | Texto ingresado por el usuario en los campos del formulario. |
| `--form-btn-bg` | `#3154DC` | Fondo del botón de enviar del formulario. |
| `--form-btn-text` | `#FFFFFF` | Texto del botón de enviar. |

---

## ⚙️ Sección 3: Panel Administrativo

En el panel de administración (`app/(admin)`), el tema se comporta de forma camaleónica heredando los tokens semánticos globales del tema activo. Para el tema **Light**, estos son los mapeos correspondientes a los componentes del Admin:

| Componente Admin | Token Empleado | Color Hex Resultante | Uso en la Interfaz de Administración |
| :--- | :--- | :--- | :--- |
| **Sidebar / Menú** | `--sidebar-bg` | `#3154DC` | Fondo de la barra lateral de navegación administrativa. |
| **Texto Sidebar** | `--sidebar-foreground`| `#FFFFFF` | Enlaces y títulos de navegación en la barra lateral. |
| **Fondo Dashboard** | `--background` | `#FFFFFF` | Fondo principal de las páginas de reportes y listados. |
| **Tarjetas Métricas**| `--card` | `#FFFFFF` | Fondo de los resúmenes estadísticos (registros hoy, etc.). |
| **Bordes de Tablas** | `--border` | `#F1F5F9` | Cuadrícula y bordes de las tablas de usuarios y eventos. |
| **Fondo Tabla** | `--surface` | `#F5F6F9` | Encabezados de tabla y filas alternadas. |
| **Botón Acción** | `--primary` | `#3154DC` | Botones para crear eventos, descargar reportes, etc. |
| **Buscador** | `--input` | `#F1F5F9` | Fondo de la barra de búsqueda de registros. |

---

## 🔍 Reporte de Colores "Sueltos" (Hardcodeados) Detectados en el Código

Realicé un análisis exhaustivo en todos los archivos `.ts`, `.tsx` y `.css` del proyecto para ubicar cualquier color hardcodeado que no use variables CSS. A continuación se listan las ocurrencias detectadas:

### 🏠 Componentes del Frontend (Públicos)

1. **[user-data-card.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/components/home/user-data-card.tsx):**
   * **Línea 205:** `text-[#0F923D]` (Verde fijo para la llamada de Clerk de editar información).
   * **Línea 218:** `bg-[#00A650]` y hover `bg-[#008540]` (Verde fijo para el botón "Guardar cambios").
   * **Líneas 96, 211, 221:** Clases de Tailwind fijas como `text-slate-500/80`, `text-gray-400` y `text-gray-500`.

2. **[select.tsx (UI Component)](file:///c:/Users/LowMo/Documents/eventosCHU/components/ui/select.tsx):**
   * **Línea 33:** `border-neutral-200` y `bg-neutral-50/50` en el Trigger del Selector (esto hará que el selector tenga fondo blanco/grisáceo fijo incluso en temas oscuros, no adaptándose).
   * **Línea 40:** `text-gray-400` en el icono chevron del select.

3. **[next-steps-panel.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/components/home/next-steps-panel.tsx):**
   * **Línea 59:** `bg-amber-500` y `shadow-amber-500/20` (Naranja fijo para el círculo del primer paso).
   * **Línea 90:** `text-gray-400` para texto secundario.
   * **Línea 97:** `bg-green-500/10`, `text-green-600` y `border-green-500/20` (Verde fijo para el estado de registro completado).

4. **[header-alerts.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/components/header/header-alerts.tsx):**
   * **Línea 36:** `hover:bg-amber-50` (Fondo hover amarillo fijo).
   * **Líneas 38-39:** `text-amber-500` y `bg-amber-400` (Amarillo fijo de advertencia).
   * **Líneas 41, 44-45:** `bg-white`, `border-neutral-100`, `text-neutral-800` y `text-neutral-500` (Colores de fondo/borde/texto fijos para el popover de alerta de encuesta).
   * **Línea 51:** `bg-amber-500`, `hover:bg-amber-600` y `shadow-amber-500/20` (Botón amarillo de advertencia).

### ⚙️ Componentes de Administración

1. **[login/page.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/app/(admin)/admin/login/page.tsx):**
   * **Línea 123:** `bg-indigo-100/50` (Fondo decorativo azul/índigo difuminado).

2. **[dashboard/page.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/app/(admin)/admin/dashboard/page.tsx):**
   * **Líneas 196-206:** Skeleton loaders con fondos fijos como `bg-neutral-100`, `bg-neutral-50` y `bg-blue-50`.
   * **Líneas 427, 441, 687:** `text-neutral-400` y `hover:text-red-500` para botones y textos secundarios de filtros.

3. **[stats-grid.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/app/(admin)/admin/dashboard/components/stats/stats-grid.tsx):**
   * **Líneas 36-37:** `text-indigo-500` y `bg-indigo-500/10` para métricas (esto está hardcodeado e ignora la paleta del tema).

4. **[metrics-view.tsx](file:///c:/Users/LowMo/Documents/eventosCHU/app/(admin)/admin/dashboard/components/metrics/metrics-view.tsx):**
   * **Línea 83:** `text-blue-600` (Icono decorativo en métricas).

---

## 🚦 Excepciones de Estado (Permitidas por Regla de Negocio)

De acuerdo con la **Regla 5 (Excepción de Estado Semántico Universal)** de las directrices del proyecto, los siguientes colores de semáforo son estáticos para garantizar comprensión inmediata y no necesitan ser tokenizados:

* Estados Confirmados / Éxitos: `bg-green-500`, `text-green-600`, `bg-emerald-500`, `text-emerald-500`, `bg-emerald-500/10`, `border-emerald-500/20` (Usados en `notification-item.tsx`, `registrations-table.tsx` y `home-constants.ts`).
* Estados Pendientes / Alertas: `bg-amber-500`, `text-amber-500`, `bg-amber-500/10`, `border-amber-500/20` (Usados en tablas y barras de filtros).
* Estados Cancelados / Errores: `bg-rose-500/10`, `text-rose-600`, `text-red-500`, `text-red-600` (Usados para asteriscos obligatorios, botones de eliminar o errores de registro).

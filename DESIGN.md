# 🎨 Design System & UI Architecture (Eventos HyenUk Chu)

Este documento detalla la identidad visual, paleta de colores, tipografía y arquitectura de componentes extraída directamente del código fuente (`globals.css` y la carpeta `components/home`). Es la guía maestra para mantener la consistencia en el desarrollo futuro.

---

## 1. 🖌️ Identidad Visual, Paleta de Colores y Tailwind CSS v4

El proyecto está diseñado bajo **Tailwind CSS v4**, lo que significa que no existe un archivo `tailwind.config.js` para pre-configurar clases estáticas. Toda la paleta y tokens de diseño se declaran directamente como variables CSS nativas en `globals.css` y se mapean usando la directiva `@theme inline`.

El sitio utiliza una estética minimalista, de alta luminosidad ("Clean UI") para el portal público, y una arquitectura "Camaleónica" multi-tema para el panel administrativo.

### Colores Clave Dinámicos (Resueltos por Variable del Tema)
- **Primary / Brand Action (`var(--primary)`)**: El color principal del tema activo (ej: Azul `#3154DC` en Light, Verde `#00FF41` en Hacker, Púrpura `#bd00ff` en Synthwave). Usado en botones primarios, la barra de progreso, y elementos interactivos.
- **Secondary (`var(--secondary)`)**: Color clásico de enlace o acento secundario (ej: Azul de enlace `#007AFF` en Light, Cyan `#01cdfe` en Synthwave). Usado en textos con subrayado para acciones secundarias ("¿Ya te registraste?", "Inicia sesión").
- **Brand Accent Green (`#04C259`)**: Color de éxito estático (`--color-brand-accent` en v4). Usado de forma universal para estados de "Confirmado".
- **Background (`var(--background)`)**: El lienzo principal del tema actual (ej: Blanco `#FFFFFF` en Light, Café oscuro `#1A1614` en Dark, Negro `#000500` en Hacker).
- **Surface (`var(--surface)`)**: El color para bloques estructurales (Sidebar, Footer) que complementa al fondo.
- **Card (`var(--card)`)**: Fondo para Event Cards y modales. Debe contrastar de forma natural con `--background` sin depender de sombras pesadas.
- **Bordes (`var(--border)`)**: El color de delineación sutil para inputs y divisiones. Mapeado como `border-border` en Tailwind.

---

## 2. 🔤 Tipografía

El sitio está impulsado completamente por una familia tipográfica geométrica y moderna, configurada a nivel raíz en Next.js.

- **Fuente Base**: `Raleway` (vía `next/font/google`).
- **Títulos Gigantes (Hero)**: 
  - Pesos: Extra Bold (`font-extrabold`).
  - Tamaño adaptativo: `text-4xl` (Móvil) -> `text-[88px]` (Desktop).
  - Altura de línea ultra ajustada: `leading-[0.9]` y `tracking-tight` para que el texto se vea compacto y corporativo.
- **Subtítulos y Descripciones**:
  - Pesos: `font-medium` o `font-semibold`.
  - Tamaños: `text-lg` a `text-2xl` con `leading-relaxed` para máxima legibilidad.

---

## 3. 📐 Formas, Sombras y Geometría (Borders & Layout)

La plataforma ignora las esquinas afiladas. Todo el sistema geométrico se basa en radios de borde masivos ("Pill shapes" y "Squircle shapes"):

- **Secciones Gigantes**: El bloque gris de los eventos tiene un radio asimétrico: `rounded-[48px] rounded-tl-none rounded-tr-none md:rounded-tr-[48px]`. Esto crea un efecto de "tarjeta apilada" debajo de las pestañas de meses.
- **Tarjetas y Formularios**: 
  - Tienen `rounded-[32px]`.
  - **Sombras Dinámicas Adaptativas**: En el tema Light se utilizan sombras elegantes e imperceptibles (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]` para contenedores y `shadow-[0_20px_50px_rgba(0,0,0,0.05)]` para dar el efecto de flotación). En temas oscuros (`dark`, `synthwave`, `coffee`), las sombras se atenúan o desactivan, confiando en bordes sutiles (`border-border/50`) para delimitar profundidad. En el tema `hacker`, se reemplaza por un filtro fluorescente en hover (`filter: drop-shadow(2px_0px_0px_rgba(0,255,65,0.3))`).
  - **Campos y Selectores Dinámicos**: Formulario de creación/edición de eventos con selector de tags en formato chips. Al seleccionar la etiqueta `"Pago"`, un contenedor animado se despliega para ingresar la URL externa de compra y el texto personalizado del botón.
  - **Layout de Filtros en Dashboard**: Diseño responsivo flexible (`flex flex-col sm:flex-row gap-4 mt-3 mb-4 w-full`) para chips de filtros activos y botones utilitarios del admin. Evita encabalgamiento de líneas y solapamiento visual en interfaces móviles y de escritorio, sincronizando la entrada estética con la animación `tab-content-anim` de GSAP.
- **Botones y Badges**:
  - Botones principales: `rounded-2xl` (cuadrados curvos).
  - Badges (como el de "Lista de espera"): `rounded-full` (forma de píldora).

---

## 4. ✨ Sistema de Animaciones

Existe un sistema híbrido cuidadosamente orquestado para no bloquear el hilo principal (Optimizado para Core Web Vitals):

### Animaciones Nativas (Tailwind / CSS)
Encargadas de la *entrada inicial* (Entrance Animations) para evitar bloquear el tiempo de carga (LCP).
- **Entrada en Cascada (Staggered)**: Usando el plugin `tailwindcss-animate`, los elementos entran con `animate-in fade-in slide-in-from-bottom-8 duration-1000`.
- **Delays Matemáticos**: Título entra en `delay-[200ms]`, descripción en `delay-[400ms]`, botones en `delay-[500ms]`.
- **Máscaras CSS**: `.mask-fade-vertical` (en `globals.css`) crea un gradiente de transparencia arriba y abajo del Word Rotator para que las palabras desaparezcan suavemente.

### Animaciones de Interacción (GSAP)
Cargadas dinámicamente (`ssr: false`) para interacciones premium una vez que el sitio hidrató.
- **Micro-Nudge (Carrusel)**: Al cargar, GSAP hace un pequeño tirón (`scrollLeft: 40` y luego de vuelta a `0`) para enseñarle inconscientemente al usuario de móvil que el carrusel es deslizable horizontalmente.
- **Custom Scrollbar / DotScrollbar**: Componente de scrollbar unificado y elástico basado en puntos (dots) que reaccionan dinámicamente a la velocidad del scroll (aumentando la escala y el estiramiento vertical mediante transformaciones de GSAP).
- **Loading Wave (Ola de Carga)**: Cuando el sitio carga o cambia de pestaña, el `DotScrollbar` ejecuta una ola de carga fluida de lado a lado a lo largo de la línea guía, construida sobre un timeline secuencial de `gsap.set()` para evitar lag y flicker en la CPU.
- **Tokens de Scrollbar**: Su diseño visual está 100% tokenizado y es dinámico en base al tema activo:
  - `--scrollbar-dot`: Color del dot activo.
  - `--scrollbar-dot-muted`: Color de dots secundarios o inactivos.
  - `--scrollbar-sidebar-dot`: Color de dots en el menú lateral.
  - `--scrollbar-track`: Color del riel conductor.
- **Word Rotator**: Mueve las palabras verticalmente en el título de forma infinita.

---

## 5. 🏗️ Arquitectura de Componentes del Home (`/components/home`)

La página principal (`public-view.tsx`) es el epicentro visual. Se apila de arriba hacia abajo de la siguiente manera:

1. **`HeroSection`**:
   - Compuesto por un Badge superior (con pulso animado).
   - Título masivo `h1` que inyecta dinámicamente el `WordRotator`.
   - Subtítulo y doble CTA (Botón primario sólido azul, y botón secundario "Link").
2. **Sistema de Pestañas (Navegación)**:
   - **`CategoryTabs`**: Pestañas de alto nivel (Gira, Taller).
   - **`MonthTabs`**: Sub-pestañas flotantes blancas/grises (`rounded-t-2xl`) que se fusionan visualmente con la sección inferior.
3. **El Contenedor de Eventos (Bloque Gris Fondo `#F5F6F9`)**:
   - **`EventsCarousel`**: 
     - Contenedor con `overflow-x-auto snap-x snap-mandatory hide-scrollbar`.
     - Inyecta de forma dinámica las tarjetas `EventCard`.
     - Fading edges (`bg-gradient-to-r`) superpuestos a los lados para indicar más contenido.
     - Botones flotantes de navegación con flechas (`ChevronLeft/Right`) y una barra de progreso que se llena en base a la posición de scroll (`scroll-progress-fill`).
4. **Área de Registro**:
   - Renderizada en una enorme caja blanca flotante (`bg-[#FFFFFF] p-8 md:p-16`).
   - Contiene el formulario central y los botones contextuales de Clerk (para iniciar sesión fácil).
5. **Manejo de Estados Visuales**:
   - `EventsSkeleton`: Recrea perfectamente el esqueleto estructural (cajas grises genéricas de Tailwind `animate-pulse`) durante los tiempos muertos del servidor para evitar saltos de layout (CLS).
   - `CheckRegistrationPanel` (Modal Inferior/Panel Flotante): Para usuarios que quieren revisar el estado de su entrada existente.

---
 
## 6. 🏢 Diseño Administrativo Multi-Tema & Camaleónico

El panel administrativo (`/admin/dashboard`) utiliza un enfoque **Camaleónico**. A diferencia del Home que tiene una estética predeterminada clara, el admin debe ser 100% funcional y visualmente premium en los 5 temas integrados: `Light`, `Dark`, `Synthwave`, `Hacker` y `Coffee`.

### Reglas de Oro para Componentes Administrativos:
- **Prohibición Absoluta de Colores Literales**: Está estrictamente prohibido usar clases como `bg-white`, `bg-gray-50` o `text-neutral-400`. Estos colores estáticos "rompen" la interfaz al cambiar de tema, volviendo los textos ilegibles o los contenedores demasiado brillantes en modos oscuros.
- **Uso Obligatorio de Tokens Semánticos**:
  - Fondos de Contenedor: `bg-card` (se adapta al contenedor del tema activo).
  - Fondos Sutiles/Inputs: `bg-muted` o `bg-muted/50` (opacidad controlada).
  - Bordes: `border-border` o `border-border/50`.
  - Texto Secundario: `text-muted-foreground`.
  - Acentos de Marca: `text-primary` o `bg-primary` (toman el color de acción del tema activo).
- **Estados Dinámicos y Contraste**: Los estados de registro (ej. "Pendiente", "Confirmado") deben usar opacidades sobre colores base (ej: `bg-amber-500/10 text-amber-500`) para garantizar que el texto tenga el contraste requerido sobre el fondo de cualquier tema (Light, Dark, Synthwave, Hacker o Coffee).
- **Diálogos y Modales**: Deben usar `bg-card` para su fondo y asegurar que los encabezados o cierres tengan contraste mediante el uso de `bg-secondary` u opacidades controladas.

### Visualización de Datos y Gráficos SVG Camaleónicos:
- **Layout de Tendencias (Donut + Lista)**: Estructurado en un split 50/50. El 50% izquierdo dibuja un donut SVG interactivo con el acumulado central transparente y hover sobre segmentos. El 50% derecho renderiza la lista de días con micro-barras porcentuales. Ambos lados tienen interactividad cruzada en hover (resaltado mutuo).
- **Indicadores de Drill-Down**: Las tarjetas KPI interactivas revelan un micro-texto `Ver lista →` al hover. Las barras de progreso y listas de rendimiento muestran un badge discreto de `(Filtrar)` para guiar las acciones del administrador.
- **Badge de Aforo Especial**: El aforo ilimitado se representa mediante un badge violeta (`bg-purple-500/10 text-purple-400 border border-purple-500/20`) y el glifo `∞ Ilimitado`, asegurando legibilidad sin alterar el balance de contrastes del tema.

---
*Nota: Este diseño sigue la filosofía "CSS para layout y primeras impresiones, JS para interactividad profunda", asegurando que el diseño parezca Premium sin perjudicar el Lighthouse Score.*

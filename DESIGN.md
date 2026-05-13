# 🎨 Design System & UI Architecture (Eventos HyenUk Chu)

Este documento detalla la identidad visual, paleta de colores, tipografía y arquitectura de componentes extraída directamente del código fuente (`globals.css` y la carpeta `components/home`). Es la guía maestra para mantener la consistencia en el desarrollo futuro.

---

## 1. 🖌️ Identidad Visual y Paleta de Colores

El sitio utiliza una estética minimalista, de alta luminosidad ("Clean UI"), con gran uso de espacios en blanco (Whitespace) y bordes extremadamente redondeados que simulan una interfaz móvil premium (estilo Apple/Fintech).

### Colores Principales (Extraídos de `globals.css` y clases Tailwind)
- **Primary Blue (`#3154DC`)**: Color principal de la marca. Usado en botones primarios, la barra de progreso de scroll, avatares de banderas, y elementos interactivos (hover states).
- **Secondary Link Blue (`#007AFF`)**: Color clásico de "enlace iOS". Usado exclusivamente en textos con subrayado para acciones secundarias ("¿Ya te registraste?", "Inicia sesión para autocompletar").
- **Brand Accent Green (`#04C259`)**: Color de éxito, declarado nativamente en V4 (`--color-brand-accent`). Posiblemente usado para estados de "Confirmado".
- **Deep Black (`#00030C`)**: El negro principal para textos de alto contraste (Títulos, `h2`, textos fuertes). No es negro puro (`#000000`), tiene una pequeñísima saturación de azul.
- **Background Gray (`#F5F6F9`)**: El color de fondo de la gran sección de eventos. Crea un contraste sutil y limpio contra las tarjetas de eventos que son blancas.
- **Pure White (`#FFFFFF`)**: Usado en los contenedores flotantes, tarjetas de eventos (`EventCard`) y el bloque del formulario.

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
  - Sombras elegantes e imperceptibles: `shadow-[0_8px_30px_rgb(0,0,0,0.04)]` para contenedores y `shadow-[0_20px_50px_rgba(0,0,0,0.05)]` para dar el efecto de que el formulario está "flotando".
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
- **Custom Scrollbar**: Puntos laterales que cambian de escala, color (`#3154DC` a `#818CF8`) y generan ondas de pulso reactivas a la velocidad de desplazamiento del ratón.
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
 
## 6. 🏢 Diseño Administrativo Multi-Tema
 
El panel administrativo (`/admin/dashboard`) utiliza un enfoque **Camaleónico**. A diferencia del Home que tiene una estética mayoritariamente clara, el admin debe ser 100% funcional en temas `Light`, `Dark` y `Synthwave`.
 
### Reglas de Oro para Componentes Administrativos:
- **Prohibición de Colores Literales**: Está estrictamente prohibido usar clases como `bg-white`, `bg-gray-50` o `text-neutral-400`. Estos colores "rompen" la interfaz al cambiar a modo oscuro o Synthwave.
- **Tokens Semánticos Requeridos**:
  - Fondos de Contenedor: `bg-card` (se adapta al fondo del tema).
  - Fondos Sutiles/Inputs: `bg-muted/50` o `bg-muted/30`.
  - Bordes: `border-border` o `border-border/50`.
  - Texto Secundario: `text-muted-foreground`.
  - Acentos de Marca: `text-primary` o `bg-primary`.
- **Estados Dinámicos**: Los estados (ej. "Pendiente", "Confirmado") deben usar opacidades sobre colores base (`bg-amber-500/10 text-amber-500`) para garantizar que el texto siempre sea legible sobre el fondo del tema activo.
- **Diálogos y Modales**: Deben usar `bg-card` y asegurar que el `DialogHeader` tenga un contraste suficiente mediante `bg-secondary` o gradientes suaves de marca.
 
---
*Nota: Este diseño sigue la filosofía "CSS para layout y primeras impresiones, JS para interactividad profunda", asegurando que el diseño parezca Premium sin perjudicar el Lighthouse Score.*

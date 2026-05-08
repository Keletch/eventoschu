# 🏛️ Arquitectura Técnica: Eventos HyenUk Chu

Este documento detalla la estructura, flujo de datos y lógica de negocio del ecosistema de eventos del Club de Inversionistas. Diseñado para ser escalable, seguro y optimizado para SEO/IA.

---

## 📂 Estructura del Proyecto

### 1. `app/` (Rutas y Lógica de Servidor)
Next.js App Router. Divide la aplicación en tres grandes áreas:
- **Pública (`/`)**: Página principal con el carrusel de eventos y el formulario de registro. Utiliza `home-client.tsx` para la interactividad.
- **Administración (`/admin`)**: Dashboard protegido para la gestión de eventos, usuarios y notificaciones.
    - `dashboard/`: Contiene la lógica compleja del panel, dividida en `components/`, `hooks/` y `utils/`.
- **API (`/api`)**: Webhooks y endpoints técnicos (ej. integración con Clerk).

### 2. `app/actions/` (Server Actions - El Motor)
Lógica que se ejecuta exclusivamente en el servidor. No hay APIs REST tradicionales; todo es vía Actions para máxima seguridad.
- `events.ts`: CRUD de eventos y gestión de caché en Redis.
- `admin-mass-ops.ts`: Operaciones pesadas (migración de tags en Keap, purga de datos).
- `user-registration.ts`: Proceso complejo de inscripción, validación de Turnstile y guardado en base de datos.
- `keap.ts`: Sincronización bidireccional con Infusionsoft/Keap.

### 3. `components/` (Biblioteca de UI)
Dividida por dominios funcionales:
- `ui/`: Componentes base de Shadcn (botones, inputs, diálogos).
- `home/`: Específicos de la landing page (`events-carousel.tsx`, `next-steps-panel.tsx`).
- `seo/`: Inyección de metadatos dinámicos (`event-json-ld.tsx`).
- `registration/`: Partes modulares del formulario de inscripción.

### 4. `lib/` (Núcleo y Utilidades)
- `event-transformers.ts`: **Única Fuente de Verdad (SSoT)**. Centraliza cómo se formatea un evento para el usuario y la IA.
- `supabase-admin.ts`: Cliente de base de datos con privilegios elevados para procesos de backend.
- `event-config.ts`: Configuración lógica de estados de eventos (Confirmado, Pendiente, Sold Out).

---

## 🔄 Flujo de Datos y SEO

### La "Verdad" de los Eventos
1. **Origen**: Los datos crudos vienen de Supabase (`events`).
2. **Transformación**: El `event-transformers.ts` procesa fechas, precios y ubicaciones.
3. **Consumo**: 
    - **Humano**: El carrusel muestra las tarjetas con los datos transformados.
    - **IA/Robot**: El bloque JSON-LD en el HTML inicial entrega la misma información estructurada.

---

## 📊 Sistema de Métricas (En Desarrollo)
Ubicación planificada: `app/admin/dashboard/components/metrics/`.
El sistema procesará la tabla `registrations` para generar:
- **Tasa de Conversión**: Usuarios únicos vs Inscripciones confirmadas.
- **Análisis de Formulario**: Agregación de respuestas guardadas en `form_responses`.
- **Popularidad Geográfica**: Demanda por ciudad/país.

---

## 🛡️ Seguridad y Roles
- **Autenticación**: Gestionada por Clerk.
- **Autorización**: Las Server Actions verifican el rol del usuario mediante `admin-check.ts` antes de interactuar con Supabase.
- **Integridad**: Todas las mutaciones de datos críticos se registran en el sistema de notificaciones administrativas.

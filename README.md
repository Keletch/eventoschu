# Eventos Chu - Plataforma de Registro de Alta Fidelidad

![Version](https://img.shields.io/badge/version-2.1.0-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/stack-Next.js%20|%20Supabase%20|%20Clerk%20|%20GSAP-black?style=for-the-badge)
![Status](https://img.shields.io/badge/Production-calendario.chu.mx-blue?style=for-the-badge)

Este es un ecosistema de registro de alta fidelidad diseñado para gestionar la asistencia a las giras mundiales y eventos de **Hyenuk Chu**. La aplicación combina una estética premium con una arquitectura técnica robusta, centrada en la seguridad, la sincronización de identidad y la gestión administrativa en tiempo real.

## 🚀 Características de Vanguardia

### 👤 Gestión de Identidad & Sincronización (Identity-Sync)
- **Autenticación con Clerk:** Integración segura para el manejo de perfiles, permitiendo a los usuarios gestionar sus registros de forma centralizada.
- **Deep Identity-Sync:** Arquitectura que detecta cambios de correo principal en Clerk y los propaga automáticamente a Supabase, actualizando tanto la columna principal como los snapshots históricos en `event_data` (JSONB).
- **Persistent Notifications:** Sistema de alerta "Blue Banner" que notifica al usuario cuando su correo ha sido sincronizado. Utiliza una combinación de **Supabase Real-time** y **localStorage** para garantizar que el aviso persista hasta ser aceptado, incluso tras recargas o cambios de sesión.

### 🛡️ Flujo de Registro Inteligente
- **Re-validación Forzada:** Lógica de negocio que garantiza que cualquier re-intento de registro sobre un evento previo resetee el estado a `pending` (Pendiente), permitiendo a los administradores re-evaluar el cupo de forma segura.
- **Identidad Resiliente:** El sistema utiliza el `clerk_id` como ancla de identidad primaria, permitiendo cambios de email sin perder el historial de eventos o estados de confirmación.
- **Protección Anti-Bots:** Blindaje mediante **Cloudflare Turnstile** en todas las acciones críticas del servidor.

### 📊 Panel Administrativo & CRM
- **Sincronización con Keap (Infusionsoft):** Automatización de marketing mediante el etiquetado dinámico basado en los cambios de estado en el panel.
- **Real-time Monitoring:** El dashboard administrativo recibe actualizaciones instantáneas de nuevos registros mediante sockets de Supabase.

## 🛠️ Stack Tecnológico

- **Core:** Next.js 14 (App Router)
- **Auth:** Clerk (Production Instance: `calendario.chu.mx`)
- **Backend:** Supabase (PostgreSQL & Realtime)
- **DNS/Proxy:** Cloudflare (Optimized CNAMEs for Clerk & Supabase)
- **Animaciones:** GSAP (Core, ScrollTrigger, useGSAP)
- **Estilos:** Tailwind CSS & Shadcn/UI (Custom components)

## 📦 Despliegue en Producción

Para desplegar esta aplicación en un entorno de producción como Vercel, se requieren las siguientes variables de entorno:

### Clerk (Production Keys)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: `pk_live_...`
- `CLERK_SECRET_KEY`: `sk_live_...`

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### CRM & Seguridad
- `KEAP_API_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

## 🏗️ Hoja de Ruta (Arquitectura v3)

Actualmente, el proyecto se encuentra en una fase de **Monolito Estable**. El siguiente ciclo de desarrollo se centrará en:
1. **Modularización:** Descomposición de `page.tsx` en componentes atómicos y especializados.
2. **Component-Oriented Design:** Implementación de un sistema de diseño reutilizable para eliminar la duplicidad de lógica y estilos.
3. **Routing Independiente:** Separación del flujo de registro (Step 1) y el portal de usuario (Step 2) en rutas dedicadas (`/` y `/portal`).

---
© 2026 Eventos Chu. Ingeniería de software orientada a la excelencia y la experiencia de usuario premium.

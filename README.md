# Eventos Chu - Plataforma de Registro de Alta Fidelidad

![Version](https://img.shields.io/badge/version-2.1.1-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/stack-Next.js%20|%20Supabase%20|%20Clerk%20|%20GSAP%20|%20Redis-black?style=for-the-badge)
![Status](https://img.shields.io/badge/Production-calendario.chu.mx-blue?style=for-the-badge)

Este es un ecosistema de registro de alta fidelidad diseñado para gestionar la asistencia a las giras mundiales y eventos de **Hyenuk Chu**. La aplicación combina una estética premium con una arquitectura técnica robusta, centrada en la seguridad, la sincronización de identidad y la gestión administrativa en tiempo real.

## 🚀 Características de Vanguardia

### 👤 Gestión de Identidad & Sincronización (Identity-Sync)
- **Autenticación con Clerk:** Integración segura para el manejo de perfiles, permitiendo a los usuarios gestionar sus registros de forma centralizada.
- **Deep Identity-Sync:** Arquitectura que detecta cambios de correo principal en Clerk y los propaga automáticamente a Supabase, actualizando tanto la columna principal como los snapshots históricos en `event_data` (JSONB).
- **Persistent Notifications:** Sistema de alerta "Blue Banner" que notifica al usuario cuando su correo ha sido sincronizado. Utiliza una combinación de **Supabase Real-time** y **localStorage** para garantizar que el aviso persista hasta ser aceptado.

### 🛡️ Flujo de Registro Inteligente
- **Identidad Resiliente:** El sistema utiliza el `clerk_id` como ancla de identidad primaria, permitiendo cambios de email sin perder el historial de eventos o estados de confirmación.
- **Merge de Datos:** Fusión inteligente de registros nuevos con existentes para evitar duplicidad.
- **Protección Anti-Bots:** Blindaje mediante **Cloudflare Turnstile** en todas las acciones críticas del servidor.

### ⚡ Rendimiento & Caching
- **Upstash Redis:** Implementación de caché para la lista de eventos, reduciendo la latencia de carga y optimizando las consultas a la base de datos principal.

## 📦 Despliegue en Producción

Para desplegar esta aplicación en un entorno de producción (ej. Vercel), configura las siguientes variables de entorno:

### Autenticación (Clerk)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

### Base de Datos & Tiempo Real (Supabase)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optimización & Caché (Upstash)
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`

### CRM & Seguridad
- `KEAP_API_KEY`
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`
- `TURNSTILE_SECRET_KEY`

## 🏗️ Hoja de Ruta (Arquitectura v3)

Actualmente, el proyecto se encuentra en una fase de **Monolito Estable**. El siguiente ciclo de desarrollo se centrará en:
1. **Modularización:** Descomposición de `page.tsx` en componentes atómicos y especializados.
2. **Component-Oriented Design:** Implementación de un sistema de diseño reutilizable.
3. **Routing Independiente:** Separación del flujo de registro y el portal de usuario en rutas dedicadas.

---
© 2026 Eventos Chu. Ingeniería de software orientada a la excelencia y la experiencia de usuario premium.

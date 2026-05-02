# Eventos Chu - Plataforma de Gestión de Eventos Premium

Ecosistema de alto rendimiento diseñado para la gestión integral de eventos y giras de **Hyenuk Chu**. La plataforma combina una experiencia de usuario inmersiva con un centro de mando administrativo de nivel empresarial para el control total de inscripciones, sincronización de CRM y auditoría en tiempo real.

## 🏗️ Arquitectura del Sistema

La aplicación sigue una arquitectura moderna basada en **Next.js 15+ (App Router)**, priorizando la seguridad, la velocidad de respuesta y la escalabilidad.

### 🧩 Capas de la Aplicación
- **Lógica de Negocio (Server Actions)**: Procesamiento centralizado en el servidor para registros, gestión de estados, operaciones masivas y notificaciones, garantizando que la lógica sensible nunca se exponga al cliente.
- **Gestión de Estado (Hooks Especializados)**: Hooks personalizados (`useHomeLogic`, `useAdminDashboard`) que encapsulan la complejidad del estado local, persistencia y sincronización en tiempo real.
- **Componentes Modulares**: UI desacoplada y reutilizable (Estadísticas, Tablas, Selectores de búsqueda, Diálogos) construida con **Shadcn UI** y **Tailwind CSS**.
- **Motor de Animaciones (GSAP)**: Implementación de coreografías visuales avanzadas y micro-interacciones que elevan la percepción de marca.

## 🔐 Estrategia de Identidad Dual

El sistema implementa una separación clara de responsabilidades para maximizar la seguridad:
1. **Portal de Usuarios (Clerk Auth)**: Gestión de identidad robusta para los asistentes, permitiendo acceso seguro al perfil, historial de eventos y descarga de materiales.
2. **Panel Administrativo (Supabase Auth)**: Autenticación independiente y granular para moderadores, protegiendo el acceso a datos sensibles y herramientas de gestión masiva.

## ⚙️ Integraciones y Flujo de Datos

### 🔗 Sincronización Keap (CRM)
- Integración profunda con la API de Keap para la gestión automática de contactos.
- Sincronización bidireccional de etiquetas (Tags) basadas en el estado de la inscripción (Pendiente, Confirmado, Cancelado).
- Creación y actualización automática de contactos durante el proceso de registro o modificación administrativa.

### ⚡ Capa de Rendimiento (Redis)
- Implementación de **Upstash Redis** para el almacenamiento en caché de eventos y metadatos de etiquetas.
- Reducción drástica de latencia en consultas frecuentes, eliminando la carga innecesaria en la base de datos principal.

### 🛰️ Sistema de Auditoría y Notificaciones
- **Auditoría Centralizada**: Cada acción administrativa (añadir/quitar eventos, purgas, cambios de estado) queda registrada en una tabla de auditoría con el correo institucional del moderador.
- **Real-time Broadcast**: Uso de canales de Supabase Realtime para notificar a los administradores de nuevos registros o actualizaciones críticas de forma instantánea sin recargar la página.

## 🛠️ Gestión Operativa (Admin Dashboard)

- **Métricas en Tiempo Real**: Dashboards visuales con contadores live de inscripciones y estados.
- **Operaciones de Limpieza**: Herramientas para la eliminación segura de registros y purga de eventos, incluyendo la limpieza automática de tags en el CRM.
- **Búsqueda Avanzada**: Sistema de filtrado inteligente que permite localizar usuarios y eventos por múltiples criterios (contenido, fecha, estado, categoría).

---
**Desarrollado por Keletch (2026)**  
*Arquitectura diseñada para la excelencia operativa y la seguridad de datos.*

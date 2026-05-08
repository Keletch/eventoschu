# Arquitectura y Auditoría Global - Eventos CHU

Este documento describe la estructura, flujo de datos y decisiones técnicas del proyecto **Eventos CHU**. Su propósito es servir como guía para desarrolladores e IAs que necesiten auditar o extender la plataforma.

## 🏗️ Estructura de Carpetas

### `/app` (App Router de Next.js)
El núcleo de la aplicación. Utiliza el paradigma de Server Components por defecto.
- **`/actions`**: Lógica de servidor (Server Actions). Aquí reside la comunicación directa con Supabase. Esto asegura que las credenciales nunca viajen al cliente.
- **`/admin`**: Panel de gestión protegida para administradores.
- **`/api`**: Endpoints de API para integraciones (ej. webhooks de Clerk o Stripe).
- **`/registrado`**: Ruta dinámica para usuarios que consultan su estatus.

### `/components`
Componentes de UI modulares y reutilizables.
- **`/home`**: Componentes específicos de la página principal (vistas públicas vs. registradas).
- **`/seo`**: Componentes destinados exclusivamente a la comunicación con buscadores e IAs (ej. JSON-LD).
- **`/ui`**: Componentes atómicos (botones, inputs) basados en Shadcn UI.

### `/lib`
Configuraciones globales y utilidades.
- `supabase.ts` / `supabase-admin.ts`: Clientes de base de datos.
- `event-config.ts`: Textos dinámicos y lógica de negocio para los tipos de eventos.

## 🔄 Flujo de Datos e Integridad (AI-Ready)

### Extracción de Eventos
Los eventos se almacenan en Supabase. Para que las IAs lean información real y no "mentiras":
1.  **Server-Side Fetching**: Los datos se solicitan en el servidor (`app/page.tsx`).
2.  **Inyección de JSON-LD**: Se inyecta un bloque de datos estructurados (`schema.org`) en el HTML inicial. Así, los bots de IA ven los eventos antes de que se ejecute cualquier Javascript.

### Seguridad
- **Clerk**: Gestión de identidad y autenticación.
- **RBAC (Role Based Access Control)**: El acceso a `/admin` está restringido por metadatos de Clerk y políticas de Supabase (RLS).

## 🤖 Directrices para IAs (Robots & Sitemap)
- **`robots.ts`**: Permite el rastreo total de la zona pública (`/`) pero prohíbe explícitamente el acceso a `/admin`, `/api` y carpetas internas de Next.js.
- **`manifest.ts`**: Define la identidad PWA (nombre, colores, iconos) para que el sistema sea instalable y reconocido por dashboards como Vercel.

## 🛠️ Buenas Prácticas y Auditoría
- **Inmutabilidad**: Los registros históricos de encuestas guardan el texto literal que el usuario leyó, garantizando que el dato no cambie si el código se actualiza.
- **Aislamiento**: Los estilos están centralizados en `globals.css` usando Tailwind CSS 4 para evitar duplicidad.

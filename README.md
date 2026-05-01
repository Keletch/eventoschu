# Eventos Chu - Plataforma de Registro

Este es un sistema de registro para los eventos y giras de **Hyenuk Chu**. El objetivo del proyecto es gestionar de manera segura y fluida la inscripción de usuarios, integrando múltiples servicios para automatizar el proceso.

## 🛠️ ¿Qué tecnologías usé?

- **Next.js 14**: El núcleo de la aplicación.
- **Clerk**: Para que los usuarios puedan crear su cuenta y gestionar su perfil de forma segura.
- **Supabase**: Base de datos para guardar los registros y sistema de tiempo real para las notificaciones.
- **Upstash Redis**: Para que la lista de eventos cargue rápido mediante caché.
- **GSAP**: Para las animaciones y que la interfaz se sienta fluida.
- **Keap (Infusionsoft)**: Para enviar los datos de los registrados a la plataforma de correos.
- **Cloudflare Turnstile**: Para evitar que entren bots al formulario.

## ✨ Características clave

- **Sincronización de Identidad**: Si un usuario cambia su correo en Clerk, el sistema lo detecta y lo actualiza automáticamente en la base de datos para no perder su historial.
- **Panel Administrativo**: Los administradores pueden ver los registros en tiempo real y cambiar el estado (Confirmado/Pendiente) de cada persona.
- **Notificaciones**: Alertas visuales cuando hay cambios importantes o confirmaciones de cupo.
- **Diseño Responsivo**: Funciona correctamente en celulares, tablets y computadoras.

---
Proyecto desarrollado por **Keletch** (2026). Enfocado en crear herramientas funcionales y seguras para eventos reales.

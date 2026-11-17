import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/legal-document";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Aviso de Privacidad | Calendario de Eventos HyenUk Chu",
  description: "Cómo tratamos tus datos personales cuando te registras a los eventos del Club de Inversionistas.",
  alternates: { canonical: "/legal/privacidad" },
};

// Faltan los datos del responsable (razón social, NIT, dirección, teléfono, vigencia): se publican cuando la empresa los entregue.
export default function PrivacidadPage() {
  const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

  return (
    <LegalDocument
      title="Aviso de Privacidad"
      current="/legal/privacidad"
      intro={
        <p>
          Este aviso explica qué datos personales recoge <strong>calendario.chu.mx</strong> (el &quot;Calendario&quot;)
          de El Club de Inversionistas, para qué los usamos, con quién los compartimos y cómo puedes ejercer tus
          derechos, conforme a la Ley 1581 de 2012 y sus decretos reglamentarios. Contacto: {mail}.
        </p>
      }
    >
      <LegalSection id="datos" title="1. Datos que tratamos">
        <h3>Los que tú nos das</h3>
        <ul>
          <li>
            <strong>Registro a eventos:</strong> nombre, apellido, correo electrónico, teléfono (con indicativo) y país.
          </li>
          <li>
            <strong>Encuesta opcional:</strong> tu relación con el Club, tema de interés, nivel de experiencia en
            inversiones, principal obstáculo y una respuesta abierta.
          </li>
          <li>
            <strong>Datos propios de cada evento</strong> que el organizador solicite (por ejemplo, ciudad de
            asistencia), cuando aplique.
          </li>
          <li>
            <strong>Cuenta (opcional):</strong> si inicias sesión, nombre, correos verificados y foto de perfil que
            nos comparte el servicio de autenticación, incluido el inicio de sesión con Google.
          </li>
        </ul>
        <h3>Los que se generan al usar el sitio</h3>
        <ul>
          <li>Eventos en los que te registraste y estado de tu registro (confirmado, pendiente, lista de espera, cancelado).</li>
          <li>Etiquetas de compra y membresía en nuestro CRM, para confirmar pagos y mostrarte precios de miembro.</li>
          <li>
            Clics en botones de pago: guardamos el evento, la fecha y una <strong>huella cifrada (hash) de tu dirección IP</strong>,
            nunca la IP en claro.
          </li>
          <li>Datos técnicos y de navegación, descritos en la <a href="/legal/cookies">Política de Cookies</a>.</li>
        </ul>
        <p>
          <strong>No tratamos datos sensibles</strong> ni datos de tarjetas: los pagos se hacen en plataformas
          externas. El Calendario está dirigido a <strong>mayores de 18 años</strong>.
        </p>
      </LegalSection>

      <LegalSection id="finalidades" title="2. Para qué usamos tus datos">
        <ul>
          <li>Registrarte en el evento y gestionar el cupo, la lista de espera o la aprobación de tu solicitud.</li>
          <li>Enviarte la confirmación, accesos y avisos de cambios o cancelaciones del evento.</li>
          <li>Confirmar tus pagos y aplicar precios o cupones de miembro cuando corresponda.</li>
          <li>Permitirte consultar y, si tienes cuenta, modificar tu registro.</li>
          <li>Prevenir fraude, abuso y registros automatizados (bots).</li>
          <li>Atender tus solicitudes de soporte.</li>
          <li>Enviarte información de próximos eventos, contenidos educativos, programas y promociones del Club.</li>
          <li>Analizar la encuesta y las estadísticas de uso para mejorar eventos y contenidos, y medir campañas.</li>
        </ul>
        <p>
          Puedes pedir en cualquier momento que dejemos de enviarte comunicaciones comerciales escribiendo a {mail} o
          con el enlace para darte de baja de cada correo. Esto no afecta tu registro al evento.
        </p>
      </LegalSection>

      <LegalSection id="derechos" title="3. Tus derechos">
        <p>Como titular de los datos puedes:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos.</li>
          <li>Solicitar prueba de la autorización que nos diste.</li>
          <li>Ser informado sobre el uso que les hemos dado.</li>
          <li>Revocar la autorización y pedir que suprimamos tus datos, cuando no exista un deber legal o contractual de conservarlos.</li>
          <li>Acceder a ellos de forma gratuita.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC), después de haber hecho tu solicitud ante nosotros.</li>
        </ul>
      </LegalSection>

      <LegalSection id="solicitudes" title="4. Cómo hacer una consulta o reclamo">
        <p>
          Escribe a {mail} con tu nombre, el correo con el que te registraste, lo que solicitas y un documento que
          acredite tu identidad.
        </p>
        <ul>
          <li><strong>Consultas:</strong> respondemos en máximo 10 días hábiles, prorrogables 5 días hábiles más.</li>
          <li>
            <strong>Reclamos</strong> (corrección, actualización, supresión o incumplimiento): respondemos en máximo 15
            días hábiles, prorrogables 8 días hábiles más.
          </li>
        </ul>
        <p>Si tienes cuenta, también puedes corregir algunos datos de tu registro desde el propio Calendario.</p>
      </LegalSection>

      <LegalSection id="encargados" title="5. Con quién compartimos tus datos">
        <p>No vendemos tus datos. Los compartimos solo con proveedores que nos prestan servicio:</p>
        <ul>
          <li><strong>Supabase</strong>: base de datos donde se guardan los registros.</li>
          <li><strong>Clerk</strong>: inicio de sesión y gestión de cuentas (incluye Google como proveedor de identidad).</li>
          <li><strong>Keap (Infusionsoft)</strong>: CRM, correos de confirmación y comunicaciones del Club.</li>
          <li><strong>Vercel</strong> y <strong>Upstash</strong>: alojamiento del sitio, analítica de rendimiento y caché.</li>
          <li><strong>Google Tag Manager / Google</strong>: medición de uso y campañas.</li>
          <li><strong>Cloudflare Turnstile</strong>: verificación anti-bots del formulario.</li>
          <li><strong>Plataformas de pago</strong> externas, que tratan tus datos con su propia política.</li>
        </ul>
        <p>
          Varios de estos proveedores están fuera de Colombia (principalmente en Estados Unidos), por lo que tus datos
          se transfieren internacionalmente para prestarte el servicio.
        </p>
      </LegalSection>

      <LegalSection id="seguridad" title="6. Seguridad y cambios">
        <p>
          Protegemos tus datos con conexiones cifradas (HTTPS), acceso restringido al panel de administración,
          verificación anti-bots y registro de IP solo en forma cifrada. Podemos actualizar este aviso; la versión
          vigente siempre estará en esta página con su fecha.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

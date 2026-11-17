import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/legal-document";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Términos y Condiciones | Calendario de Eventos HyenUk Chu",
  description: "Reglas de uso del calendario y de registro a los eventos del Club de Inversionistas.",
  alternates: { canonical: "/legal/terminos" },
};

export default function TerminosPage() {
  const mail = <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>;

  return (
    <LegalDocument
      title="Términos y Condiciones"
      current="/legal/terminos"
      intro={
        <p>
          Estos términos regulan el uso de <strong>calendario.chu.mx</strong> y el registro a los eventos de HyenUk
          Chu y El Club de Inversionistas (&quot;nosotros&quot;). Al
          registrarte o usar el Calendario aceptas estos términos y nuestro{" "}
          <a href="/legal/privacidad">Aviso de Privacidad</a>.
        </p>
      }
    >
      <LegalSection id="servicio" title="1. Qué es el Calendario">
        <p>
          Un sitio para consultar los eventos presenciales y en línea del Club (giras, talleres, conferencias y
          encuentros) y registrarte en ellos. Puedes registrarte <strong>con o sin cuenta</strong>. Solo con una
          cuenta iniciada con el mismo correo del registro puedes modificar tu registro después.
        </p>
      </LegalSection>

      <LegalSection id="registro" title="2. Registro">
        <ul>
          <li>Debes ser mayor de 18 años y dar datos verdaderos y actualizados. Cada registro es personal.</li>
          <li>Registrarte no siempre asegura un lugar. Según el evento, tu registro puede quedar:
            <ul>
              <li><strong>Confirmado</strong>: evento libre con lugar disponible, o pago acreditado.</li>
              <li><strong>En revisión</strong>: el evento requiere aprobación del organizador.</li>
              <li><strong>Pago pendiente</strong>: el lugar se confirma al acreditarse el pago.</li>
              <li><strong>Lista de espera</strong>: el cupo está lleno; te avisaremos si se libera un lugar.</li>
            </ul>
          </li>
          <li>Podemos rechazar o cancelar registros duplicados, falsos, automatizados o que incumplan estos términos.</li>
          <li>El cupo es limitado y se asigna en el orden y bajo las reglas de cada evento.</li>
        </ul>
      </LegalSection>

      <LegalSection id="pagos" title="3. Eventos de pago, precios y cupones">
        <ul>
          <li>
            Los pagos se realizan en <strong>plataformas externas</strong>. Sus condiciones, medios de pago y
            facturación son responsabilidad de esa plataforma; nosotros no recibimos datos de tu tarjeta.
          </li>
          <li>Los precios se muestran en la moneda indicada en cada evento y pueden incluir o no impuestos según el país.</li>
          <li>
            Los <strong>precios y cupones de miembro</strong> son personales y dependen de que el correo con que
            compras coincida con tu membresía activa. Usar el correo de otra persona para obtener un beneficio que no
            te corresponde permite revocar el acceso, y es posible que no se reembolse el total pagado.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="cambios-evento" title="4. Cambios o cancelación del evento">
        <p>
          Podemos cambiar fecha, horario, sede, ponentes o modalidad por causas operativas o de fuerza mayor. Te
          avisaremos al correo registrado. No cubrimos gastos de traslado ni hospedaje.
        </p>
      </LegalSection>

      <LegalSection id="asistencia" title="5. En el evento">
        <ul>
          <li>Puede pedirse identificación oficial o el correo del registro para el acceso.</li>
          <li>Esperamos respeto hacia ponentes, staff y asistentes; podemos retirar a quien no lo tenga, sin reembolso.</li>
          <li>Sin autorización previa no está permitido grabar ni retransmitir las sesiones.</li>
        </ul>
      </LegalSection>

      <LegalSection id="educativo" title="6. Contenido educativo, no asesoría">
        <p>
          Los eventos y contenidos son <strong>educativos</strong>. No son asesoría financiera, de inversión, tributaria
          ni legal personalizada, ni una recomendación para comprar o vender instrumentos. Invertir y operar en
          mercados implica riesgo, incluso la pérdida del capital. Los resultados pasados no garantizan resultados
          futuros. Tú decides y respondes por tus inversiones.
        </p>
      </LegalSection>

      <LegalSection id="propiedad" title="7. Propiedad intelectual">
        <p>
          Las marcas, logotipos, textos, imágenes, materiales y presentaciones del Calendario y de los eventos
          pertenecen a sus titulares. No puedes copiarlos, venderlos ni distribuirlos sin permiso por escrito.
        </p>
      </LegalSection>

      <LegalSection id="uso" title="8. Uso correcto del sitio">
        <p>
          No intentes acceder a datos de otras personas, al panel de administración, ni saturar o automatizar el
          sitio. Podemos bloquear el acceso a quien lo haga, además de las acciones legales que procedan.
        </p>
      </LegalSection>

      <LegalSection id="responsabilidad" title="9. Responsabilidad">
        <p>
          Procuramos que el Calendario funcione sin interrupciones y con información correcta, pero puede haber
          fallas o errores. No somos responsables por servicios de terceros (pagos, inicio de sesión, plataformas de
          transmisión), ni por daños indirectos derivados del uso del sitio, salvo lo que disponga la ley aplicable.
        </p>
      </LegalSection>

      <LegalSection id="cambios" title="10. Cambios y contacto">
        <p>Podemos actualizar estos términos; la versión vigente es la publicada en esta página.</p>
        <p>Dudas o reclamaciones: {mail}.</p>
      </LegalSection>
    </LegalDocument>
  );
}

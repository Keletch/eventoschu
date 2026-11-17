import type { Metadata } from "next";
import { LegalDocument, LegalSection } from "@/components/legal/legal-document";
import { SUPPORT_EMAIL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Política de Cookies | Calendario de Eventos HyenUk Chu",
  description: "Qué cookies y almacenamiento local usa el calendario de eventos y cómo controlarlos.",
  alternates: { canonical: "/legal/cookies" },
};

const ROWS: { name: string; who: string; why: string; type: string }[] = [
  { name: "__session, __client_uat y similares", who: "Clerk", why: "Mantener tu sesión iniciada de forma segura.", type: "Necesaria" },
  { name: "Verificación anti-bots", who: "Cloudflare Turnstile", why: "Comprobar que el formulario lo envía una persona.", type: "Necesaria" },
  { name: "chu_registration, chu_active_step", who: "Calendario (almacenamiento local)", why: "Recordar tu registro para mostrarte tu confirmación al volver.", type: "Necesaria" },
  { name: "chu_temp_keap_tags", who: "Calendario (almacenamiento local)", why: "Recordar 5 minutos tu verificación de membresía para mostrarte el precio de miembro.", type: "Funcional" },
  { name: "theme", who: "Calendario (almacenamiento local)", why: "Recordar el tema visual que elegiste.", type: "Funcional" },
  { name: "Caché de la app (service worker)", who: "Calendario", why: "Cargar más rápido y permitir instalarlo como app.", type: "Funcional" },
  { name: "_ga, _gid y similares", who: "Google (vía Tag Manager)", why: "Medir visitas, registros y campañas de forma agregada.", type: "Analítica" },
  { name: "Sin cookies", who: "Vercel Analytics y Speed Insights", why: "Medir visitas y rendimiento de forma anónima.", type: "Analítica" },
];

export default function CookiesPage() {
  return (
    <LegalDocument
      title="Política de Cookies"
      current="/legal/cookies"
      intro={
        <p>
          Las cookies y el almacenamiento local son pequeños datos que el sitio guarda en tu navegador. Aquí te
          explicamos cuáles usa <strong>calendario.chu.mx</strong> y cómo controlarlos.
        </p>
      }
    >
      <LegalSection id="tipos" title="1. Qué usamos y para qué">
        <ul>
          <li><strong>Necesarias:</strong> sin ellas no funcionan el registro, la sesión ni la seguridad.</li>
          <li><strong>Funcionales:</strong> recuerdan tus preferencias para que no repitas pasos.</li>
          <li><strong>Analítica:</strong> nos dicen, en conjunto, cómo se usa el sitio para mejorarlo.</li>
        </ul>
        <p>No usamos cookies para venderte publicidad de terceros dentro del Calendario.</p>
      </LegalSection>

      <LegalSection id="detalle" title="2. Detalle">
        <div className="mt-2 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="bg-muted text-foreground">
              <tr>
                <th className="px-4 py-3 font-bold">Nombre</th>
                <th className="px-4 py-3 font-bold">Quién</th>
                <th className="px-4 py-3 font-bold">Para qué</th>
                <th className="px-4 py-3 font-bold">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ROWS.map((row) => (
                <tr key={row.name}>
                  <td className="px-4 py-3 font-mono text-xs text-foreground">{row.name}</td>
                  <td className="px-4 py-3">{row.who}</td>
                  <td className="px-4 py-3">{row.why}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{row.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Las cookies de terceros se rigen por las políticas de esos proveedores (Clerk, Cloudflare, Google y
          Vercel).
        </p>
      </LegalSection>

      <LegalSection id="control" title="3. Cómo controlarlas">
        <ul>
          <li>Puedes borrar o bloquear cookies y el almacenamiento local desde la configuración de tu navegador.</li>
          <li>
            Puedes desactivar la medición de Google con su{" "}
            <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer">
              complemento de inhabilitación
            </a>
            .
          </li>
          <li>Si bloqueas las necesarias, puede que no puedas registrarte, iniciar sesión ni ver tu confirmación.</li>
        </ul>
      </LegalSection>

      <LegalSection id="contacto" title="4. Cambios y contacto">
        <p>
          Actualizaremos esta política si agregamos o quitamos herramientas. Dudas:{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>. Consulta también el{" "}
          <a href="/legal/privacidad">Aviso de Privacidad</a>.
        </p>
      </LegalSection>
    </LegalDocument>
  );
}

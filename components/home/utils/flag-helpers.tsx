import { EventFlag } from "@/components/ui/event-flag";

/**
 * Devuelve el código ISO-2 de bandera según el nombre de la ciudad o país.
 */
export const getFlagCode = (title: string): string => {
  const t = (title || "").toLowerCase();
  if (t.includes("lima") || t.includes(" pe")) return "PE";
  if (t.includes("medellin") || t.includes("medellín") || t.includes(" co")) return "CO";
  if (t.includes("méxico") || t.includes("mexico") || t.includes("cdmx") || t.includes(" mx")) return "MX";
  if (t.includes("madrid") || t.includes("españa") || t.includes("espana")) return "ES";
  if (t.includes("miami") || t.includes(" usa")) return "US";
  return "";
};

/**
 * Renderiza el componente de bandera SVG a partir del código ISO-2.
 */
export function FlagIcon({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  return <EventFlag flag={code} className={className} />;
}


/**
 * 🧭 Tipo de evento (solo UI del admin).
 * No existe en la BD: se deriva de initial_status + capacity + tags (pago / pago_cupo)
 * + enlaces por membresía, y al elegirlo se escriben esos mismos campos.
 */
export type EventKind =
  | "libre" | "cupo" | "aprobacion" | "pagocupo"            // con registro
  | "venta" | "venta_miembros" | "venta_exclusiva";        // solo venta, sin registro

export type EventKindGroup = "registro" | "venta";

export const EVENT_KINDS: { id: EventKind; group: EventKindGroup; label: string; desc: string }[] = [
  { id: "libre", group: "registro", label: "Gratis sin límite", desc: "Se registran y quedan confirmados al instante." },
  { id: "cupo", group: "registro", label: "Gratis con cupo", desc: "Se confirman hasta llenar el cupo. Después entran en lista de espera." },
  { id: "aprobacion", group: "registro", label: "Aprobación manual", desc: "Todos entran en espera y tú confirmas. Al llenarse, la tarjeta se bloquea." },
  { id: "pagocupo", group: "registro", label: "Pago con cupo", desc: "Entran en espera y van al checkout. El pago en Keap los confirma solo." },
  { id: "venta", group: "venta", label: "Venta pública", desc: "La tarjeta solo muestra un botón de compra. Mismo enlace y precio para todos." },
  { id: "venta_miembros", group: "venta", label: "Precio para miembros", desc: "Todos pueden comprar; quien tiene el tag de Keap ve su propio enlace y precio." },
  { id: "venta_exclusiva", group: "venta", label: "Solo miembros", desc: "Solo quien tiene el tag de Keap puede comprar. El resto ve el botón bloqueado." },
];

export const UNLIMITED_CAPACITY = 9999;

export const isVentaKind = (kind: EventKind) => kind.startsWith("venta");

const hasTag = (event: any, systemTags: any[], slug: string) => {
  const tag = systemTags.find((t: any) => t.slug === slug);
  return !!tag && (event.tag_ids || []).includes(tag.id);
};

/** Enlaces por membresía (paid_links sin `type`; los que tienen `type` son configuraciones). */
export const membershipLinks = (event: any) => (event.paid_links || []).filter((l: any) => !l.type);

export function getEventKind(event: any, systemTags: any[]): EventKind {
  const isClosed = event.initial_status === "pending";
  if (isClosed) return hasTag(event, systemTags, "pago_cupo") ? "pagocupo" : "aprobacion";
  if (hasTag(event, systemTags, "pago")) {
    if (membershipLinks(event).length === 0) return "venta";
    return event.external_url ? "venta_miembros" : "venta_exclusiva";
  }
  return (event.capacity ?? UNLIMITED_CAPACITY) >= UNLIMITED_CAPACITY ? "libre" : "cupo";
}

/** Escribe en el evento los campos que definen el tipo, conservando el resto. */
export function applyEventKind(event: any, kind: EventKind, systemTags: any[]) {
  const pagoId = systemTags.find((t: any) => t.slug === "pago")?.id;
  const pagoCupoId = systemTags.find((t: any) => t.slug === "pago_cupo")?.id;
  const tagIds = (event.tag_ids || []).filter((id: string) => id !== pagoId && id !== pagoCupoId);
  const venta = isVentaKind(kind);
  if (venta && pagoId) tagIds.push(pagoId);
  if (kind === "pagocupo" && pagoCupoId) tagIds.push(pagoCupoId);

  const isClosed = kind === "aprobacion" || kind === "pagocupo";
  const hadCapacity = (event.capacity ?? UNLIMITED_CAPACITY) < UNLIMITED_CAPACITY;
  const capacity = kind === "libre" || venta ? UNLIMITED_CAPACITY : (hadCapacity ? event.capacity : 50);

  // Tag de espera: obligatorio en cerrados, opcional en "con cupo", sin uso en el resto.
  let pending = event.keap_pending_tag_id ?? null;
  if (isClosed && pending === null) pending = "";
  if (kind === "libre" || venta) pending = null;

  const next: any = { ...event, initial_status: isClosed ? "pending" : "confirmed", capacity, tag_ids: tagIds, keap_pending_tag_id: pending };

  if (venta) {
    const configs = (event.paid_links || []).filter((l: any) => l.type);
    const members = membershipLinks(event);
    if (kind === "venta") next.paid_links = configs;
    else next.paid_links = [...configs, ...(members.length ? members : [{ url: "", button_text: "", keap_tag_id: "", price: "" }])];
    // Solo miembros = sin enlace general: así la tarjeta bloquea a quien no tiene el tag.
    if (kind === "venta_exclusiva") next.external_url = "";
  }
  return next;
}

const isUrl = (v: any) => typeof v === "string" && /^https?:\/\/\S+/.test(v.trim());
// Enlaces de compra: se permite "#" o "Por definir" mientras no exista el enlace (la tarjeta lo muestra sin abrir nada)
const isFilled = (v: any) => typeof v === "string" && v.trim().length > 0;

/** Qué falta para poder guardar, según el tipo. Vacío = listo. */
export function missingForKind(event: any, kind: EventKind): string[] {
  const missing: string[] = [];
  if (isVentaKind(kind)) {
    if (kind !== "venta_exclusiva" && !isFilled(event.external_url)) missing.push("Enlace de compra");
    if (kind !== "venta" && !membershipLinks(event).some((l: any) => isFilled(l.url) && l.keap_tag_id)) {
      missing.push("Al menos un enlace para miembros (tag de Keap + enlace)");
    }
    return missing; // sin registro: Keap no se usa para inscritos
  }
  if (kind === "pagocupo") {
    const cfg = (event.paid_links || []).find((l: any) => l.type === "pago_cupo_config") || {};
    if (!isUrl(cfg.checkout_url || cfg.url)) missing.push("Enlace de pago (checkout)");
    if (cfg.use_external_waitlist && !isUrl(cfg.paid_waitlist_url)) missing.push("Página de lista de espera externa");
  }
  if (!event.keap_tag_id) missing.push("Tag de Keap para confirmados");
  if ((kind === "aprobacion" || kind === "pagocupo") && !event.keap_pending_tag_id) missing.push("Tag de Keap para lista de espera");
  return missing;
}

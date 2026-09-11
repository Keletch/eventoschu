import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { getConfirmedTagsWhitelist, clearEventsCache } from '@/app/actions/events';
import { getContactEmailById, keapFetch } from '@/app/actions/keap';
import { broadcastToAdmins, broadcastToPublic } from '@/app/actions/utils-realtime';
import { dispatchSignal } from '@/lib/services/signal-dispatcher';

/**
 * 🪝 Receptor de Webhooks de Keap (Infusionsoft)
 * 
 * 1. Responde al apretón de manos inicial de verificación (handshake):
 *    Keap envía un header 'X-Hook-Secret', el cual debemos devolver como header en la respuesta 200.
 * 
 * 2. Filtro ultraligero en memoria con Redis:
 *    Si el tag aplicado NO está en la lista blanca de eventos activos (`CONFIRMED_TAGS_WHITELIST_KEY`),
 *    se descarta inmediatamente en <2ms sin tocar Supabase.
 * 
 * 3. Si coincide con un evento:
 *    - Obtiene el correo del usuario en Keap.
 *    - Actualiza el estado a 'confirmed' en Supabase.
 *    - Invalida el caché de eventos en Redis (`clearEventsCache`).
 *    - Emite la señal Realtime para que los cupos bajen en vivo y el botón de rescate se apague.
 */
export async function POST(req: Request) {
  try {
    const headerList = await headers();
    const hookSecret = headerList.get('x-hook-secret');

    // 1. Handshake de verificación de Keap
    if (hookSecret) {
      const response = new NextResponse('Verified', { status: 200 });
      response.headers.set('X-Hook-Secret', hookSecret);
      return response;
    }

    const payload = await req.json().catch(() => null);
    if (!payload) {
      return NextResponse.json({ message: 'Empty payload' }, { status: 200 });
    }

    // El evento de Keap puede venir como objeto o array de eventos
    const events = Array.isArray(payload) ? payload : (payload.event_key ? [payload] : (payload.events || [payload]));

    for (const item of events) {
      // Keap REST Hook payload estructura:
      // event_key: 'contactGroup.applied'
      // object_keys: [{ id: contactId, groupId: tagId }] o contact: { id }, group: { id }
      const tagId = 
        item.object_keys?.[0]?.groupId?.toString() ||
        item.groupId?.toString() ||
        item.tagId?.toString() ||
        item.group?.id?.toString() ||
        item.tag?.id?.toString();

      const contactId = 
        item.object_keys?.[0]?.id?.toString() ||
        item.contactId?.toString() ||
        item.contact?.id?.toString();

      if (!tagId || !contactId) continue;

      // 2. ⚡ Filtro Ultra-Rápido en Redis (<2ms)
      const whitelist = await getConfirmedTagsWhitelist();
      if (!whitelist.includes(tagId)) {
        // Tag irrelevante para el calendario: descartar al instante sin tocar la base de datos
        continue;
      }

      // 3. Obtener el email del contacto desde Keap
      const contactEmail = await getContactEmailById(contactId);
      if (!contactEmail) continue;

      // 4. Buscar el evento activo que usa este tag de confirmación
      const { data: matchedEvents } = await supabaseAdmin
        .from('events')
        .select('id, title, keap_tag_id, keap_pending_tag_id')
        .eq('keap_tag_id', tagId)
        .eq('active', true);

      if (!matchedEvents || matchedEvents.length === 0) continue;

      // 5. Buscar el registro del usuario en Supabase
      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .select('id, clerk_id, email, selected_events, event_statuses')
        .eq('email', contactEmail)
        .maybeSingle();

      if (!reg) continue;

      let updated = false;
      const currentStatuses = { ...(reg.event_statuses || {}) };
      const pendingTagsToRemove: string[] = [];

      for (const ev of matchedEvents) {
        if (currentStatuses[ev.id] === 'pending') {
          currentStatuses[ev.id] = 'confirmed';
          updated = true;
          if (ev.keap_pending_tag_id) {
            pendingTagsToRemove.push(ev.keap_pending_tag_id);
          }
        }
      }

      // Si tenía tag de pendiente para este evento, removerlo en Keap para detener correos de carrito abandonado
      if (pendingTagsToRemove.length > 0) {
        for (const pTag of pendingTagsToRemove) {
          try {
            await keapFetch(`contacts/${contactId}/tags/${pTag}`, { method: 'DELETE' });
          } catch (delErr) {
            console.error(`Error removing pending tag ${pTag} from contact ${contactId}:`, delErr);
          }
        }
      }

      if (updated) {
        // Actualizar en Supabase
        await supabaseAdmin.from('registrations').update({
          event_statuses: currentStatuses,
          updated_at: new Date().toISOString()
        }).eq('id', reg.id);

        // 🧹 Invalidar caché de eventos y cupos en Redis
        await clearEventsCache();

        // 📢 Disparar señal Realtime atómica al usuario (actualiza en vivo el Step 2 sin recargar)
        const eventNames = matchedEvents.map(e => e.title).join(', ');
        const targetIds = [reg.id, reg.clerk_id, reg.email].filter(Boolean) as string[];

        Promise.all([
          dispatchSignal('EVENT_CONFIRMED', {
            targetIds,
            metadata: {
              email: reg.email,
              eventNames
            },
            realtimePayload: {
              event_statuses: currentStatuses,
              selected_events: reg.selected_events
            }
          }),
          broadcastToAdmins({
            type: 'EVENT_UPDATE',
            message: `Pago confirmado para ${reg.email} en ${eventNames}`
          }),
          broadcastToPublic()
        ]).catch(err => console.error("Realtime sync error on Keap webhook:", err));
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error en Keap webhook handler:", error);
    // Siempre devolver 200 a Keap para evitar que desactive el webhook por reintentos fallidos
    return NextResponse.json({ success: false, error: error.message }, { status: 200 });
  }
}

/**
 * Keap también puede realizar comprobaciones GET / HEAD durante pruebas o validaciones
 */
export async function GET(req: Request) {
  const headerList = await headers();
  const hookSecret = headerList.get('x-hook-secret');

  if (hookSecret) {
    const response = new NextResponse('Verified', { status: 200 });
    response.headers.set('X-Hook-Secret', hookSecret);
    return response;
  }

  return NextResponse.json({ status: 'Keap webhook endpoint active' }, { status: 200 });
}

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
  console.log("\n📥 [Keap Webhook] Petición recibida en /api/webhooks/keap");
  try {
    const headerList = await headers();
    const hookSecret = headerList.get('x-hook-secret');

    // 1. Handshake de verificación de Keap
    if (hookSecret) {
      console.log("🤝 [Keap Webhook] Handshake de verificación recibido. Respondiendo X-Hook-Secret...");
      const response = new NextResponse('Verified', { status: 200 });
      response.headers.set('X-Hook-Secret', hookSecret);
      return response;
    }

    const payload = await req.json().catch(() => null);
    console.log("📦 [Keap Webhook] Payload recibido:", JSON.stringify(payload, null, 2));

    if (!payload) {
      console.warn("⚠️ [Keap Webhook] Payload vacío");
      return NextResponse.json({ message: 'Empty payload' }, { status: 200 });
    }

    // El evento de Keap puede venir como objeto o array de eventos
    const events = Array.isArray(payload) ? payload : (payload.event_key ? [payload] : (payload.events || [payload]));
    console.log(`🔍 [Keap Webhook] Total de eventos a procesar: ${events.length}`);

    for (const item of events) {
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

      console.log(`🏷️ [Keap Webhook] Item parseado -> TagId: "${tagId}", ContactId: "${contactId}", EventKey: "${item.event_key}"`);

      if (!tagId || !contactId) {
        console.warn("⚠️ [Keap Webhook] Falta tagId o contactId en el item, se salta.");
        continue;
      }

      // 2. ⚡ Filtro Ultra-Rápido en Redis (<2ms)
      const whitelist = await getConfirmedTagsWhitelist();
      console.log(`📋 [Keap Webhook] Whitelist de tags confirmados en Redis:`, whitelist);
      const isWhitelisted = whitelist.includes(tagId);
      console.log(`🔎 [Keap Webhook] ¿El tag ${tagId} está en whitelist?: ${isWhitelisted}`);

      if (!isWhitelisted) {
        console.warn(`⏭️ [Keap Webhook] Tag ${tagId} descartado (no está en whitelist). Si este tag es de un evento recién creado, puede faltar refrescar la whitelist.`);
        continue;
      }

      // 3. Obtener el email del contacto desde Keap
      const contactEmail = await getContactEmailById(contactId);
      console.log(`📧 [Keap Webhook] Email obtenido de Keap para contactId ${contactId}: "${contactEmail}"`);
      if (!contactEmail) {
        console.warn(`⚠️ [Keap Webhook] No se pudo obtener email para contactId ${contactId}`);
        continue;
      }

      // 4. Buscar el evento activo que usa este tag de confirmación
      const { data: matchedEvents } = await supabaseAdmin
        .from('events')
        .select('id, title, keap_tag_id, keap_pending_tag_id')
        .eq('keap_tag_id', tagId)
        .eq('active', true);

      console.log(`🎪 [Keap Webhook] Eventos encontrados con keap_tag_id = ${tagId}:`, matchedEvents?.map(e => ({ id: e.id, title: e.title, pendingTag: e.keap_pending_tag_id })));

      if (!matchedEvents || matchedEvents.length === 0) {
        console.warn(`⚠️ [Keap Webhook] Ningún evento activo coincide con keap_tag_id ${tagId}`);
        continue;
      }

      // 5. Buscar el registro del usuario en Supabase (case-insensitive y sin espacios)
      const cleanContactEmail = contactEmail.trim().toLowerCase();
      const { data: reg } = await supabaseAdmin
        .from('registrations')
        .select('id, clerk_id, email, selected_events, event_statuses')
        .ilike('email', cleanContactEmail)
        .maybeSingle();

      console.log(`👤 [Keap Webhook] Registro en Supabase para "${cleanContactEmail}":`, reg ? { id: reg.id, statuses: reg.event_statuses, events: reg.selected_events } : "NO ENCONTRADO");

      if (!reg) {
        console.warn(`⚠️ [Keap Webhook] No existe registro en Supabase con email ${contactEmail}`);
        continue;
      }

      let updated = false;
      const currentStatuses = { ...(reg.event_statuses || {}) };
      const pendingTagsToRemove: string[] = [];

      for (const ev of matchedEvents) {
        console.log(`📊 [Keap Webhook] Evento ${ev.title} (${ev.id}) - Estado actual del usuario: "${currentStatuses[ev.id]}"`);
        if (currentStatuses[ev.id] === 'pending' || !currentStatuses[ev.id]) {
          currentStatuses[ev.id] = 'confirmed';
          updated = true;
          if (ev.keap_pending_tag_id) {
            pendingTagsToRemove.push(ev.keap_pending_tag_id);
          }
        } else {
          console.log(`ℹ️ [Keap Webhook] El usuario ya tenía estado "${currentStatuses[ev.id]}", no requiere cambio a pending->confirmed`);
        }
      }

      // Si tenía tag de pendiente para este evento, removerlo en Keap para detener correos de carrito abandonado
      if (pendingTagsToRemove.length > 0) {
        console.log(`🗑️ [Keap Webhook] Removiendo tags de pendiente en Keap:`, pendingTagsToRemove);
        for (const pTag of pendingTagsToRemove) {
          try {
            const delRes = await keapFetch(`contacts/${contactId}/tags/${pTag}`, { method: 'DELETE' });
            console.log(`🗑️ [Keap Webhook] Eliminación tag ${pTag} en Keap status: ${delRes.status}`);
          } catch (delErr) {
            console.error(`❌ [Keap Webhook] Error removing pending tag ${pTag} from contact ${contactId}:`, delErr);
          }
        }
      }

      if (updated) {
        console.log(`💾 [Keap Webhook] Guardando nuevos statuses en Supabase:`, currentStatuses);
        // Actualizar en Supabase
        const { error: upError } = await supabaseAdmin.from('registrations').update({
          event_statuses: currentStatuses,
          updated_at: new Date().toISOString()
        }).eq('id', reg.id);

        if (upError) {
          console.error("❌ [Keap Webhook] Error al actualizar registro en Supabase:", upError);
        } else {
          console.log("✅ [Keap Webhook] Registro actualizado exitosamente en Supabase");
        }

        // 🧹 Invalidar caché de eventos y cupos en Redis
        console.log("🧹 [Keap Webhook] Invalidando caché Redis de eventos...");
        await clearEventsCache();

        // 📢 Disparar señal Realtime atómica al usuario (actualiza en vivo el Step 2 sin recargar)
        const eventNames = matchedEvents.map(e => e.title).join(', ');
        const targetIds = [reg.id, reg.clerk_id, reg.email].filter(Boolean) as string[];
        console.log(`📢 [Keap Webhook] Emitiendo señal Realtime a:`, targetIds);

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
        ]).then(() => {
          console.log("✅ [Keap Webhook] Señales de Realtime emitidas");
        }).catch(err => console.error("❌ [Keap Webhook] Realtime sync error on Keap webhook:", err));
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("❌ [Keap Webhook] Error fatal en handler:", error);
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

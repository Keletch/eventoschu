import { supabaseAdmin } from "@/lib/supabase-admin";
import { broadcastToUser, broadcastToAdmins, broadcastToPublic } from "@/app/actions/utils-realtime";
import { USER_TEMPLATES, ADMIN_TEMPLATES } from "../notifications/templates";

/**
 * 🚀 SIGNAL DISPATCHER (El Cerebro del Sistema EDA)
 * Este servicio centraliza el envío de CUALQUIER señal en el sistema.
 */

interface SignalOptions {
  targetIds?: string | string[]; // IDs de usuario (Clerk o Supabase)
  adminSignal?: boolean;
  metadata?: any; // Datos adicionales para la plantilla (email, eventNames, etc.)
  realtimePayload?: any; // Datos crudos para actualizar la UI (statuses, events)
}

export async function dispatchSignal(
  templateId: string,
  options: SignalOptions = {}
) {
  const { targetIds, adminSignal = false, metadata = {}, realtimePayload = {} } = options;

  
  // 1. Obtener la plantilla
  const registry = adminSignal ? ADMIN_TEMPLATES : USER_TEMPLATES;
  const template = registry[templateId];
  
  if (!template) {
    console.error(`[SignalDispatcher] ❌ Template ${templateId} no encontrado.`);
    return { success: false, error: 'Template not found' };
  }

  // 2. Procesar mensajes dinámicos
  const title = typeof template.title === 'function' ? template.title(metadata) : template.title;
  const message = typeof template.message === 'function' ? template.message(metadata) : template.message;
  const msgId = globalThis.crypto.randomUUID();

  try {
    // 3. PERSISTENCIA (Base de Datos)
    const enrichedMetadata = {
      ...metadata,
      template_id: templateId,
      dispatched_at: new Date().toISOString(),
    };

    if (adminSignal) {

      const { error } = await supabaseAdmin.from('admin_notifications').insert([{
        title,
        message,
        type: template.type || 'info',
        metadata: enrichedMetadata
      }]);
      if (error) throw error;
    } else {
      const ids = Array.isArray(targetIds) ? targetIds : [targetIds || ''];
      const cleanIds = ids.filter(Boolean);
      
      if (cleanIds.length > 0) {
        // 🔍 Identificación estricta de IDs para la DB
        const clerkId = cleanIds.find(id => id.startsWith('user_'));
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const regId = cleanIds.find(id => uuidRegex.test(id));
        


        const { error: insError } = await supabaseAdmin.from('notifications').insert([{
          registration_id: regId || null,
          user_id: clerkId || null,
          title,
          message,
          type: template.type || 'info',
          is_admin: false,
          read: false,
          metadata: enrichedMetadata // 🚀 ¡Ahora disponible para usuarios también!
        }]);

        if (insError) throw insError;
      }
    }

    // 4. TIEMPO REAL (Broadcast)
    const broadcastPayload = {
      ...realtimePayload,
      msg_id: msgId,
      id: msgId,
      title,
      message,
      type: template.type,
      action: template.action,
      metadata: enrichedMetadata, // Enviar metadatos enriquecidos al cliente
      is_notification: true 
    };

    if (adminSignal) {

      await broadcastToAdmins(broadcastPayload);
    } else if (targetIds || metadata.email) {
      const finalTargetIds = Array.from(new Set([
        ...(Array.isArray(targetIds) ? targetIds : [targetIds || '']),
        metadata.email
      ])).filter(Boolean) as string[];


      await broadcastToUser(finalTargetIds, broadcastPayload);
    }

    // Siempre notificamos al público si la acción afecta disponibilidad
    if (template.action === 'REFRESH_UI' || templateId.includes('REGISTRATION')) {
      await broadcastToPublic();
    }

    return { success: true, msgId };
  } catch (err) {
    console.error(`[SignalDispatcher] ❌ Error en el despacho:`, err);
    return { success: false, error: err };
  }
}

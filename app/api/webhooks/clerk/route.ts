import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { updateUserEmail, upsertClerkUser } from '@/app/actions/auth-actions';
import { deleteRegistrationByClerkId } from '@/app/actions/admin-mass-ops';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET no configurado");
    return new Response('No secret', { status: 500 });
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('No headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Error verificando webhook:", err);
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;
  const { id: clerkId } = evt.data;

  try {
    // 1. Registro inicial (Vincular o Crear)
    if (eventType === 'user.created') {
      const emailObj = evt.data.email_addresses?.[0];
      const email = emailObj?.email_address;
      const { first_name, last_name } = evt.data;

      if (email && clerkId) {
        await upsertClerkUser({
          email,
          clerkId,
          firstName: first_name,
          lastName: last_name
        });
      }
    }

    // 2. Cambio de Email Principal
    if (eventType === 'user.updated') {
      const { email_addresses, primary_email_address_id } = evt.data;
      const primaryEmailObj = (email_addresses as any[])?.find((e: any) => e.id === primary_email_address_id);
      const newEmail = primaryEmailObj?.email_address;

      if (newEmail && clerkId) {
        const result = await updateUserEmail(clerkId, newEmail, true);
        if (!result.success) {
          console.error("❌ Fallo al actualizar email en Supabase/Keap:", result.error);
          return new Response(result.error, { status: 500 });
        }
      }
    }

    // 3. Eliminación de Usuario (Purga Total)
    if (eventType === 'user.deleted') {
      if (clerkId) {
        await deleteRegistrationByClerkId(clerkId);
      }
    }

    return new Response('Webhook procesado con éxito', { status: 200 });
  } catch (error: any) {
    console.error("❌ Error procesando webhook logic:", error.message);
    return new Response(error.message, { status: 500 });
  }
}

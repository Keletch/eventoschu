import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { WebhookEvent } from '@clerk/nextjs/server';
import { updateUserEmail } from '@/app/actions/auth-actions';
import { deleteRegistrationByClerkId } from '@/app/actions/admin-mass-ops';

export async function POST(req: Request) {
  // ... rest of the setup code remains the same ...
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return new Response('No secret', { status: 500 });

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) return new Response('No headers', { status: 400 });

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
    return new Response('Invalid signature', { status: 400 });
  }

  const eventType = evt.type;

  // 1. Cambio de Email Principal
  if (eventType === 'user.updated') {
    const { id: clerkId, email_addresses, primary_email_address_id } = evt.data;
    const primaryEmailObj = email_addresses.find(e => e.id === primary_email_address_id);
    const newEmail = primaryEmailObj?.email_address;

    if (newEmail && clerkId) {
      await updateUserEmail(clerkId, newEmail, true);
    }
  }

  // 2. Eliminación de Usuario
  if (eventType === 'user.deleted') {
    const { id: clerkId } = evt.data;
    if (clerkId) {

      await deleteRegistrationByClerkId(clerkId);
    }
  }

  return new Response('Webhook procesado', { status: 200 });
}

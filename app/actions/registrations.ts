"use server";

import { createClient } from "@supabase/supabase-js";

// Creamos un cliente de Supabase con permisos de servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { z } from "zod";
import { validateTurnstileToken } from "./turnstile";

// Security Schema: Strict validation for all inputs
const registrationSchema = z.object({
  first_name: z.string().trim().min(2, "Nombre muy corto").max(50, "Nombre muy largo"),
  last_name: z.string().trim().min(2, "Apellido muy corto").max(50, "Apellido muy largo"),
  email: z.string().trim().email("Email inválido").toLowerCase(),
  phone: z.string().trim().min(6, "Teléfono muy corto").max(20, "Teléfono muy largo").regex(/^[0-9\s-]+$/, "Formato de teléfono inválido"),
  phone_code: z.string().trim().min(1).max(10),
  residence_country: z.string().trim().max(100).optional(),
  selected_events: z.array(z.string()).min(1, "Debes seleccionar al menos una gira"),
});

export async function createRegistration(
  data: z.infer<typeof registrationSchema>,
  turnstileToken: string
) {
  try {
    // 1. Mandatory Bot Protection Check (Server-side)
    const verification = await validateTurnstileToken(turnstileToken);
    if (!verification.success) {
      return { success: false, error: "Fallo de verificación de seguridad. Intenta de nuevo." };
    }

    // 2. Data Validation & Sanitization
    const validatedData = registrationSchema.parse(data);

    // 3. Check if user already exists
    const { data: existing, error: searchError } = await supabaseAdmin
      .from('registrations')
      .select('id, selected_events, event_statuses')
      .eq('email', validatedData.email)
      .single();

    // Prepare initial statuses for new selections
    const initialStatuses: Record<string, string> = {};
    validatedData.selected_events.forEach((id: string) => {
      initialStatuses[id] = 'pending';
    });

    if (existing) {
      // Merge logic: combine existing events and statuses
      const mergedEvents = Array.from(new Set([...existing.selected_events, ...validatedData.selected_events]));
      const updatedStatuses = { ...(existing.event_statuses || {}), ...initialStatuses };
      
      const { error: updateError } = await supabaseAdmin
        .from('registrations')
        .update({
          ...validatedData,
          selected_events: mergedEvents,
          event_statuses: updatedStatuses,
          updated_at: new Date().toISOString()
        })
        .eq('email', validatedData.email);

      if (updateError) throw updateError;
      return { success: true, isUpdate: true, mergedEvents, eventStatuses: updatedStatuses };
    }

    // 4. New registration
    const { error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert([
        {
          ...validatedData,
          event_statuses: initialStatuses
        },
      ]);

    if (insertError) throw insertError;
    return { success: true, isUpdate: false, eventStatuses: initialStatuses };
  } catch (err: any) {
    console.error("Registration Error:", err);
    return { success: false, error: err.message };
  }
}

export async function getRegistrations() {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data };
  } catch (err: any) {
    console.error("Error al obtener registros:", err);
    return { success: false, error: err.message };
  }
}
export async function checkRegistration(email: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return { success: false, error: "No se encontró ningún registro con este correo." };
      throw error;
    }

    return { 
      success: true, 
      data: {
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        phoneCode: data.phone_code,
        country: data.residence_country,
      },
      selectedEvents: data.selected_events,
      eventStatuses: data.event_statuses || {}
    };
  } catch (error: any) {
    console.error("Check Registration Error:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteRegistration(id: string) {
  try {
    // 1. Get registration data before deleting to know which tags to remove
    const { data: reg, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('email, selected_events')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Identify tags to remove
    if (reg.selected_events && reg.selected_events.length > 0) {
      const { data: events } = await supabaseAdmin
        .from('events')
        .select('keap_tag_id')
        .in('id', reg.selected_events);

      if (events) {
        const tagsToRemove = events.map(e => e.keap_tag_id).filter(Boolean);
        if (tagsToRemove.length > 0) {
          // syncKeapTags with empty newTags will remove all current tags
          await syncKeapTags({ email: reg.email }, tagsToRemove, []);
        }
      }
    }

    // 3. Delete from Supabase
    const { error } = await supabaseAdmin
      .from('registrations')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Error deleting registration:", err);
    return { success: false, error: err.message };
  }
}

import { syncKeapTags } from "./keap";

export async function updateRegistration(id: string, data: any) {
  try {
    // 1. Get the current registration to compare events
    const { data: currentReg, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('selected_events, event_statuses, email')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Perform the update in Supabase
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // 3. Sync with Keap if selected_events OR event_statuses changed
    const oldEvents = currentReg.selected_events || [];
    const newEvents = data.selected_events || [];
    const oldStatuses = currentReg.event_statuses || {};
    const newStatuses = data.event_statuses || {};

    const eventsChanged = JSON.stringify(oldEvents) !== JSON.stringify(newEvents);
    const statusesChanged = JSON.stringify(oldStatuses) !== JSON.stringify(newStatuses);

    if (eventsChanged || statusesChanged) {
      // Get the tag IDs for the events involved
      const allEventIds = Array.from(new Set([...oldEvents, ...newEvents]));
      const { data: eventDetails } = await supabaseAdmin
        .from('events')
        .select('id, keap_tag_id')
        .in('id', allEventIds);

      if (eventDetails) {
        // Old tags: events that were selected AND were not cancelled
        const oldTags = oldEvents
          .filter((id: string) => oldStatuses[id] !== 'cancelled')
          .map((id: string) => eventDetails.find(e => e.id === id)?.keap_tag_id)
          .filter(Boolean);

        // New tags: events that are now selected AND are not cancelled
        const newTags = newEvents
          .filter((id: string) => newStatuses[id] !== 'cancelled')
          .map((id: string) => eventDetails.find(e => e.id === id)?.keap_tag_id)
          .filter(Boolean);

        // syncKeapTags will handle adding new ones and removing those no longer in the list
        await syncKeapTags({ email: data.email || currentReg.email }, oldTags, newTags);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

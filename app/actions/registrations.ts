"use server";

import { createClient } from "@supabase/supabase-js";

// Creamos un cliente de Supabase con permisos de servidor
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

import { z } from "zod";
import { validateTurnstileToken } from "./turnstile";
import { auth } from "@clerk/nextjs/server";

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

    // 3. Check for Clerk Authentication for sensitive updates
    const { userId } = await auth();
    const isAuthenticated = !!userId;

    let existing = null;
    let searchError = null;

    if (isAuthenticated) {
      const { data: byId, error: idError } = await supabaseAdmin
        .from('registrations')
        .select('id, email, first_name, last_name, phone, phone_code, residence_country, selected_events, event_statuses, event_data, survey_data, clerk_id')
        .eq('clerk_id', userId)
        .single();

      if (byId) {
        existing = byId;
        // SYNC EMAIL IF DIFFERENT: If ID matches but email changed in Clerk, update it now
        if (byId.email.toLowerCase().trim() !== validatedData.email.toLowerCase().trim()) {
          const newEmail = validatedData.email;
          const updatedEventData = byId.event_data || {};
          Object.keys(updatedEventData).forEach(eventId => {
            if (updatedEventData[eventId]) {
              updatedEventData[eventId].email = newEmail;
            }
          });

          await supabaseAdmin
            .from('registrations')
            .update({
              email: newEmail,
              event_data: updatedEventData,
              updated_at: new Date().toISOString()
            })
            .eq('id', byId.id);
          
          // PRO-ACTIVE KEAP SYNC: Ensure the new email has all confirmed tags
          const confirmedIds = (byId.selected_events || []).filter((id: string) => 
            byId.event_statuses?.[id] === 'confirmed'
          );
          if (confirmedIds.length > 0) {
            const { data: events } = await supabaseAdmin
              .from('events')
              .select('keap_tag_id')
              .in('id', confirmedIds);
            
            const confirmedTags = events?.map(e => e.keap_tag_id).filter(Boolean) || [];
            if (confirmedTags.length > 0) {
              await syncKeapTags({
                email: newEmail,
                firstName: byId.first_name,
                lastName: byId.last_name,
                phone: byId.phone,
                phoneCode: byId.phone_code
              }, [], confirmedTags);
            }
          }

        }
      }
    }

    // Fallback to email search if no clerk_id match (or not authenticated)
    if (!existing) {
      const { data: byEmail, error: emailError } = await supabaseAdmin
        .from('registrations')
        .select('id, email, first_name, last_name, phone, phone_code, residence_country, selected_events, event_statuses, event_data, survey_data, clerk_id')
        .eq('email', validatedData.email)
        .single();

      if (byEmail) {
        existing = byEmail;
        // If found by email but missing clerkId, link it now
        if (isAuthenticated && !byEmail.clerk_id) {
          await supabaseAdmin
            .from('registrations')
            .update({ clerk_id: userId, updated_at: new Date().toISOString() })
            .eq('id', byEmail.id);
        }
      } else {
        searchError = emailError;
      }
    }

    // Prepare initial statuses for new selections
    const initialStatuses: Record<string, string> = {};
    validatedData.selected_events.forEach((id: string) => {
      initialStatuses[id] = 'pending';
    });

    if (existing) {
      // Security: Only allow updating personal data if user is authenticated via Clerk
      // If not authenticated, we keep the existing data from the database
      const securePersonalData = isAuthenticated ? {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        phone: validatedData.phone,
        phone_code: validatedData.phone_code,
        residence_country: validatedData.residence_country
      } : {
        first_name: existing.first_name || validatedData.first_name,
        last_name: existing.last_name || validatedData.last_name,
        phone: existing.phone || validatedData.phone,
        phone_code: existing.phone_code || validatedData.phone_code,
        residence_country: existing.residence_country || validatedData.residence_country
      };

      // Security: Check if user is already registered for SOME or ALL selected events
      const alreadyRegisteredIds = validatedData.selected_events.filter((id: string) =>
        existing.selected_events.includes(id)
      );

      // Fetch names, country and category for the events they are already in
      const { data: existingEventsInfo } = await supabaseAdmin
        .from('events')
        .select('city, country, start_date, categories(name)')
        .in('id', alreadyRegisteredIds);

      const alreadyRegisteredNames = existingEventsInfo?.map((e: any) => {
        const d = new Date(e.start_date);
        const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const catName = e.categories?.name || "Evento";
        return `${e.city}, ${e.country} (${dateStr}) - ${catName}`;
      }).join(', ') || '';

      // If they are trying to register for ONLY events they already have, throw error
      if (alreadyRegisteredIds.length === validatedData.selected_events.length) {
        return {
          success: false,
          error: `Ese email ya está registrado en el evento: ${alreadyRegisteredNames}.`
        };
      }

      // 1. Force 'pending' status and update snapshots for ALL events selected in this submission
      // This ensures that even if an admin confirmed/cancelled before, a new registration attempt
      // puts the user back in the queue for those specific events.
      const updatedStatuses = { ...(existing.event_statuses || {}) };
      const updatedEventData = { ...(existing.event_data || {}) };

      validatedData.selected_events.forEach((id: string) => {
        updatedStatuses[id] = 'pending';
        updatedEventData[id] = {
          ...securePersonalData,
          email: validatedData.email
        };
      });

      const mergedEvents = Array.from(new Set([...existing.selected_events, ...validatedData.selected_events]));

      const { error: updateError } = await supabaseAdmin
        .from('registrations')
        .update({
          ...securePersonalData,
          clerk_id: userId, // Link the Clerk ID permanently
          selected_events: mergedEvents,
          event_statuses: updatedStatuses,
          event_data: updatedEventData,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);

      if (updateError) throw updateError;

      // 2. Fetch details for a better notification message
      const { data: updateEventsInfo } = await supabaseAdmin
        .from('events')
        .select('city, country, start_date, categories(name)')
        .in('id', validatedData.selected_events);

      const registeredCities = updateEventsInfo?.map((e: any) => {
        const d = new Date(e.start_date);
        const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        const catName = e.categories?.name || "Evento";
        return `${e.city}, ${e.country} (${dateStr}) - ${catName}`;
      }).join(', ') || 'los eventos';
      const message = `Tu registro para ${registeredCities} ha sido recibido y está pendiente de confirmación.`;

      return {
        success: true,
        isUpdate: true,
        message,
        mergedEvents,
        eventStatuses: updatedStatuses,
        eventData: updatedEventData,
        surveyData: existing.survey_data,
        userData: {
          id: existing.id,
          email: validatedData.email,
          firstName: validatedData.first_name,
          lastName: validatedData.last_name
        }
      };
    }

    // 4. New registration
    // Prepare event data snapshots for new registration
    const initialEventData: Record<string, any> = {};
    validatedData.selected_events.forEach((id: string) => {
      initialEventData[id] = {
        first_name: validatedData.first_name,
        last_name: validatedData.last_name,
        email: validatedData.email,
        phone: validatedData.phone,
        phone_code: validatedData.phone_code,
        residence_country: validatedData.residence_country
      };
    });

    const { data: insertedData, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert([
        {
          ...validatedData,
          clerk_id: userId, // Link the Clerk ID even on new registrations if authenticated
          event_statuses: initialStatuses,
          event_data: initialEventData
        },
      ])
      .select('id')
      .single();

    if (insertError) throw insertError;

    // Fetch details for the notification message
    const { data: newRegistrationInfo } = await supabaseAdmin
      .from('events')
      .select('city, country, start_date, categories(name)')
      .in('id', validatedData.selected_events);

    const registeredCities = newRegistrationInfo?.map((e: any) => {
      const d = new Date(e.start_date);
      const dateStr = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
      const catName = e.categories?.name || "Evento";
      return `${e.city}, ${e.country} (${dateStr}) - ${catName}`;
    }).join(', ') || 'los eventos';
    const message = `¡Hecho! Tu registro para ${registeredCities} ha sido recibido y está pendiente de confirmación.`;

    return {
      success: true,
      isUpdate: false,
      emailUpdated: false,
      message,
      eventStatuses: initialStatuses,
      eventData: initialEventData,
      surveyData: null,
      userData: {
        id: insertedData?.id,
        email: validatedData.email,
        firstName: validatedData.first_name,
        lastName: validatedData.last_name
      }
    };
  } catch (err: any) {
    console.error("Registration Error:", err);
    return { success: false, error: err.message };
  }
}

export async function getRegistrations() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("No autorizado. Debes iniciar sesión.");

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

export async function checkRegistration(email: string, clerkId?: string) {
  try {
    let data = null;

    // 1. Prioritize search by clerk_id if available
    if (clerkId) {
      const { data: byId } = await supabaseAdmin
        .from('registrations')
        .select('id, first_name, last_name, email, phone, phone_code, residence_country, selected_events, event_statuses, event_data, survey_data, clerk_id')
        .eq('clerk_id', clerkId)
        .single();

      if (byId) {
        data = byId;
        // SYNC EMAIL IF DIFFERENT: If ID matches but email changed in Clerk, update it now
        if (email && byId.email.toLowerCase().trim() !== email.toLowerCase().trim()) {
          const newEmailFormatted = email.toLowerCase().trim();
          const updatedEventData = byId.event_data || {};
          Object.keys(updatedEventData).forEach(eventId => {
            if (updatedEventData[eventId]) {
              updatedEventData[eventId].email = newEmailFormatted;
            }
          });

          await supabaseAdmin
            .from('registrations')
            .update({
              email: newEmailFormatted,
              event_data: updatedEventData,
              updated_at: new Date().toISOString()
            })
            .eq('id', byId.id);

          // PRO-ACTIVE KEAP SYNC: Ensure the new email has all confirmed tags
          const confirmedIds = (byId.selected_events || []).filter((id: string) => 
            byId.event_statuses?.[id] === 'confirmed'
          );
          if (confirmedIds.length > 0) {
            const { data: events } = await supabaseAdmin
              .from('events')
              .select('keap_tag_id')
              .in('id', confirmedIds);
            
            const confirmedTags = events?.map(e => e.keap_tag_id).filter(Boolean) || [];
            if (confirmedTags.length > 0) {
              await syncKeapTags({
                email: newEmailFormatted,
                firstName: byId.first_name,
                lastName: byId.last_name,
                phone: byId.phone,
                phoneCode: byId.phone_code
              }, [], confirmedTags);
            }
          }

          data.email = newEmailFormatted;
          data.event_data = updatedEventData;
        }
      }
    }

    // 2. Fallback to email search if no clerk_id match
    if (!data) {
      const { data: byEmail, error: emailError } = await supabaseAdmin
        .from('registrations')
        .select('id, first_name, last_name, email, phone, phone_code, residence_country, selected_events, event_statuses, event_data, survey_data, clerk_id')
        .eq('email', email.toLowerCase().trim())
        .single();

      if (byEmail) {
        data = byEmail;
        // SMART LINKING: If we found it by email and clerk_id is missing, inject it now!
        if (clerkId && !byEmail.clerk_id) {
          await supabaseAdmin
            .from('registrations')
            .update({ clerk_id: clerkId, updated_at: new Date().toISOString() })
            .eq('id', byEmail.id);
          // Update local data object so the response reflects the change
          data.clerk_id = clerkId;
        }
      }
      else if (emailError && emailError.code !== 'PGRST116') throw emailError;
    }

    if (!data) {
      return { success: false, error: "No se encontró ningún registro." };
    }

    return {
      success: true,
      exists: true,
      userData: {
        id: data.id,
        firstName: data.first_name,
        lastName: data.last_name,
        email: data.email,
        phone: data.phone,
        phoneCode: data.phone_code,
        country: data.residence_country,
      },
      clerkId: data.clerk_id,
      selectedEvents: data.selected_events || [],
      eventStatuses: data.event_statuses || {},
      eventData: data.event_data || {},
      surveyData: data.survey_data || null
    };
  } catch (error: any) {
    console.error("Check Registration Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getRegistrationsCount() {
  try {
    const { data, error } = await supabaseAdmin
      .from('registrations')
      .select('selected_events, event_statuses');

    if (error) throw error;

    const counts: Record<string, number> = {};
    data.forEach(reg => {
      if (reg.selected_events && reg.event_statuses) {
        reg.selected_events.forEach((id: string) => {
          if (reg.event_statuses[id] === 'confirmed') {
            counts[id] = (counts[id] || 0) + 1;
          }
        });
      }
    });

    return { success: true, data: counts };
  } catch (err: any) {
    console.error("Error counts:", err);
    return { success: false, error: err.message };
  }
}

// Función para guardar el formulario general (survey)
export async function saveSurveyData(email: string, surveyData: any) {
  try {
    const { userId } = await auth();
    
    // Security check: verify ownership if user is logged in
    const { data: existingReg } = await supabaseAdmin
      .from('registrations')
      .select('clerk_id')
      .eq('email', email.toLowerCase().trim())
      .single();
    
    if (existingReg?.clerk_id && existingReg.clerk_id !== userId) {
      throw new Error("No tienes permiso para actualizar esta encuesta.");
    }

    const { data, error } = await supabaseAdmin
      .from('registrations')
      .update({
        survey_data: surveyData,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim())
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
      return { success: false, error: "No se encontró el registro para actualizar. Verifica el correo." };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Survey Error:", err);
    return { success: false, error: err.message };
  }
}

export async function deleteRegistration(id: string) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Acción no autorizada.");

    // 1. Get registration data before deleting to know which tags to remove
    const { data: reg, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('email, selected_events, first_name, last_name')
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
          await syncKeapTags({ 
            email: reg.email,
            firstName: reg.first_name,
            lastName: reg.last_name
          }, tagsToRemove, []);
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
    const { userId } = await auth();
    if (!userId) throw new Error("Acción no autorizada.");

    // 1. Get the current registration to compare events and get identity for Keap
    const { data: currentReg, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('selected_events, event_statuses, email, first_name, last_name, phone, phone_code')
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
        // Old tags: events that were selected AND were confirmed
        const oldTags = oldEvents
          .filter((id: string) => oldStatuses[id] === 'confirmed')
          .map((id: string) => eventDetails.find(e => e.id === id)?.keap_tag_id)
          .filter(Boolean);

        // New tags: events that are now selected AND are confirmed
        const newTags = newEvents
          .filter((id: string) => newStatuses[id] === 'confirmed')
          .map((id: string) => eventDetails.find(e => e.id === id)?.keap_tag_id)
          .filter(Boolean);

        // syncKeapTags handles finding/creating the contact and adding/removing tags
        await syncKeapTags({ 
          email: data.email || currentReg.email,
          firstName: data.first_name || currentReg.first_name,
          lastName: data.last_name || currentReg.last_name,
          phone: data.phone || currentReg.phone,
          phoneCode: data.phone_code || currentReg.phone_code
        }, oldTags, newTags);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateEventSpecificData(email: string, eventId: string, newData: any) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Debes iniciar sesión para editar tu información.");

    // 1. Get current registration
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('event_data, clerk_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (fetchError) throw fetchError;

    // Security Check: Ensure user owns this registration
    if (existing.clerk_id && existing.clerk_id !== userId) {
      throw new Error("No tienes permiso para editar esta información.");
    }

    // 2. Update ONLY the specific event data in the JSON object
    const updatedEventData = {
      ...(existing.event_data || {}),
      [eventId]: {
        ...(existing.event_data?.[eventId] || {}),
        ...newData,
        email: email // Email remains constant
      }
    };

    // 3. Save back to Supabase
    const { error: updateError } = await supabaseAdmin
      .from('registrations')
      .update({
        event_data: updatedEventData,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim());

    if (updateError) throw updateError;

    return { success: true };
  } catch (err: any) {
    console.error("Update Event Data Error:", err);
    return { success: false, error: err.message };
  }
}

export async function updateUserEmail(clerkId: string, newEmail: string) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== clerkId) throw new Error("No autorizado");

    const emailFormatted = newEmail.toLowerCase().trim();

    // 1. Get current registration to update event_data snapshots and get identity for Keap
    const { data: existing, error: fetchError } = await supabaseAdmin
      .from('registrations')
      .select('event_data, selected_events, event_statuses, first_name, last_name, phone, phone_code')
      .eq('clerk_id', clerkId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

    let updatedEventData = existing?.event_data || {};
    if (existing?.event_data) {
      Object.keys(updatedEventData).forEach(eventId => {
        if (updatedEventData[eventId]) {
          updatedEventData[eventId].email = emailFormatted;
        }
      });
    }

    const { error } = await supabaseAdmin
      .from('registrations')
      .update({
        email: emailFormatted,
        event_data: updatedEventData,
        updated_at: new Date().toISOString()
      })
      .eq('clerk_id', clerkId);

    if (error) throw error;

    // PRO-ACTIVE KEAP SYNC: Sync confirmed tags to the new email
    if (existing) {
      const confirmedIds = (existing.selected_events || []).filter((id: string) => 
        existing.event_statuses?.[id] === 'confirmed'
      );
      if (confirmedIds.length > 0) {
        const { data: events } = await supabaseAdmin
          .from('events')
          .select('keap_tag_id')
          .in('id', confirmedIds);
        
        const confirmedTags = events?.map(e => e.keap_tag_id).filter(Boolean) || [];
        if (confirmedTags.length > 0) {
          await syncKeapTags({
            email: emailFormatted,
            firstName: existing.first_name,
            lastName: existing.last_name,
            phone: existing.phone,
            phoneCode: existing.phone_code
          }, [], confirmedTags);
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error("Sync Email Error:", err);
    return { success: false, error: err.message };
  }
}

export async function linkClerkAccount(email: string, clerkId: string) {
  try {
    const { userId } = await auth();
    if (!userId || userId !== clerkId) throw new Error("No autorizado");

    const { error } = await supabaseAdmin
      .from('registrations')
      .update({
        clerk_id: clerkId,
        updated_at: new Date().toISOString()
      })
      .eq('email', email.toLowerCase().trim())
      .is('clerk_id', null); // Only update if not already linked

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error("Link Account Error:", err);
    return { success: false, error: err.message };
  }
}

"use server";

/**
 * 🛠️ Cliente interno para Keap API
 * Evita la repetición de headers y URL base.
 */
export async function keapFetch(endpoint: string, options: RequestInit = {}) {
  const apiKey = process.env.KEAP_API_KEY;
  if (!apiKey) throw new Error("KEAP_API_KEY missing");

  const response = await fetch(`https://api.infusionsoft.com/crm/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      "X-Keap-API-Key": apiKey,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok && response.status !== 404) {
    const errorData = await response.json().catch(() => ({}));
    console.error(`❌ Keap API Error [${endpoint}]:`, errorData);
  }

  return response;
}

/**
 * 👤 Crea o recupera un contacto en Keap por email
 */
export async function getOrCreateContact(userData: any) {
  try {
    const searchRes = await keapFetch(`contacts?email=${encodeURIComponent(userData.email)}`);
    const searchData = await searchRes.json();
    
    if (searchData.contacts && searchData.contacts.length > 0) {
      return { success: true, contactId: searchData.contacts[0].id };
    }

    const fullPhone = `${userData.phoneCode || userData.phone_code || ""}${userData.phone || ""}`.replace(/\s+/g, '');
    const createRes = await keapFetch("contacts", {
      method: "POST",
      body: JSON.stringify({
        email_addresses: [{ email: userData.email, field: "EMAIL1" }],
        given_name: userData.firstName || userData.first_name || "Inscrito",
        family_name: userData.lastName || userData.last_name || "Chu",
        phone_numbers: [{ number: fullPhone, field: "PHONE1" }],
      }),
    });

    const newContact = await createRes.json();
    return { success: true, contactId: newContact.id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 🚀 Registro simplificado en Keap (Legacy Wrapper)
 */
export async function registerInKeap(userData: any, eventTagIds: string[]) {
  try {
    const { success, contactId, error } = await getOrCreateContact(userData);
    if (!success || !contactId) throw new Error(error);

    const tagPromises = eventTagIds.map(tagId => 
      keapFetch(`contacts/${contactId}/tags`, {
        method: "POST",
        body: JSON.stringify({ tagIds: [parseInt(tagId)] })
      })
    );

    await Promise.all(tagPromises);
    return { success: true, contactId };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 🏷️ Obtiene todos los tags de la cuenta
 */
export async function getKeapTags() {
  try {
    const res = await keapFetch("tags?limit=1000");
    const data = await res.json();
    
    if (!data.tags) throw new Error("No tags found");

    const formattedTags = data.tags.map((tag: any) => ({
      id: tag.id.toString(),
      name: tag.name,
      category: tag.category?.name || "Sin categoría"
    }));

    return { success: true, tags: formattedTags };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 🔄 Sincronización inteligente de Tags
 */
export async function syncKeapTags(userData: any, oldTagIds: string[], newTagIds: string[]) {
  try {
    const { success, contactId } = await getOrCreateContact(userData);
    if (!success || !contactId) return { success: false };

    const toAdd = newTagIds.filter(id => !oldTagIds.includes(id));
    const toRemove = oldTagIds.filter(id => !newTagIds.includes(id));

    for (const tagId of toAdd) {
      await keapFetch(`contacts/${contactId}/tags`, {
        method: "POST",
        body: JSON.stringify({ tagIds: [parseInt(tagId)] }),
      });
    }

    for (const tagId of toRemove) {
      await keapFetch(`contacts/${contactId}/tags/${tagId}`, { method: "DELETE" });
    }

    return { success: true };
  } catch (_error) {
    return { success: false };
  }
}

/**
 * 🛠️ Orquestador de transiciones de estado para Keap
 */
export async function processKeapStatusTransitions(
  userData: any,
  currentReg: any,
  updatedStatuses: Record<string, string>,
  allRelevantEventIds: string[],
  eventDetails: any[]
) {
  const tagsToRemove: string[] = [];
  const tagsToAdd: string[] = [];

  allRelevantEventIds.forEach(eventId => {
    const details = eventDetails.find((e: any) => e.id === eventId);
    if (!details) return;

    const newStatus = updatedStatuses[eventId];

    // Lógica determinista: Asegurar el estado correcto borrando el opuesto
    if (newStatus === 'confirmed') {
      if (details.keap_tag_id) tagsToAdd.push(details.keap_tag_id);
      if (details.keap_pending_tag_id) tagsToRemove.push(details.keap_pending_tag_id);
    } 
    else if (newStatus === 'pending') {
      if (details.keap_pending_tag_id) tagsToAdd.push(details.keap_pending_tag_id);
      if (details.keap_tag_id) tagsToRemove.push(details.keap_tag_id);
    } 
    else if (newStatus === 'cancelled') {
      if (details.keap_tag_id) tagsToRemove.push(details.keap_tag_id);
      if (details.keap_pending_tag_id) tagsToRemove.push(details.keap_pending_tag_id);
    }
  });

  if (tagsToRemove.length > 0 || tagsToAdd.length > 0) {
    // syncKeapTags ya se encarga de no duplicar si el tag ya está (vía Keap API)
    return await syncKeapTags(userData, tagsToRemove, tagsToAdd);
  }
  
  return { success: true };
}

/**
 * 🏷️ Obtiene los IDs de etiquetas asignadas a un contacto por su correo en Keap
 */
export async function getContactTagsByEmail(email: string) {
  try {
    const cleanEmail = email.toLowerCase().trim();
    const searchRes = await keapFetch(`contacts?email=${encodeURIComponent(cleanEmail)}`);
    if (!searchRes.ok) throw new Error("Error searching contact in Keap");
    
    const searchData = await searchRes.json();
    if (!searchData.contacts || searchData.contacts.length === 0) {
      return { success: true, tags: [] };
    }

    const contactId = searchData.contacts[0].id;
    const tagsRes = await keapFetch(`contacts/${contactId}/tags`);
    if (!tagsRes.ok) throw new Error("Error fetching tags for contact in Keap");
    
    const tagsData = await tagsRes.json();
    const tagIds = (tagsData.tags || []).map((t: any) => t.tag.id.toString());
    
    return { success: true, tags: tagIds };
  } catch (error: any) {
    console.error("❌ Error fetching user Keap tags:", error);
    return { success: false, error: error.message, tags: [] };
  }
}

/**
 * 👤 Obtiene el correo principal de un contacto de Keap por su contactId
 */
export async function getContactEmailById(contactId: string | number): Promise<string | null> {
  try {
    const res = await keapFetch(`contacts/${contactId}`);
    if (!res.ok) return null;
    const data = await res.json();
    const emailObj = (data.email_addresses || []).find((e: any) => e.field === "EMAIL1") || data.email_addresses?.[0];
    return emailObj?.email?.toLowerCase()?.trim() || null;
  } catch (error) {
    console.error("❌ Error fetching contact email by id in Keap:", error);
    return null;
  }
}

/**
 * 🪝 Registra el REST Hook global de tags en Keap
 */
export async function registerKeapTagHook(hookUrl: string) {
  try {
    const res = await keapFetch("hooks", {
      method: "POST",
      body: JSON.stringify({
        eventKey: "contactGroup.applied",
        hookUrl: hookUrl
      })
    });
    const data = await res.json();
    return { success: res.ok, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

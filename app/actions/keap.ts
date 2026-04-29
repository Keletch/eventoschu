"use server";

/**
 * Server Action to integrate with Keap (Infusionsoft) API
 * This keeps your API Key safe on the server.
 */
export async function registerInKeap(userData: any, eventTagIds: string[]) {
  const apiKey = process.env.KEAP_API_KEY;

  if (!apiKey) {
    console.error("KEAP_API_KEY is missing in environment variables");
    return { success: false, error: "Configuration error" };
  }

  try {
    // 1. Search for existing contact by email FIRST
    const searchResponse = await fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts?email=${encodeURIComponent(userData.email)}`, {
      headers: { "X-Keap-API-Key": apiKey }
    });
    const searchData = await searchResponse.json();
    
    let contactId = null;

    if (searchData.contacts && searchData.contacts.length > 0) {
      // Contact exists! We use the existing ID and skip creation
      contactId = searchData.contacts[0].id;
    } else {
      // Contact doesn't exist. Let's create it.
      const fullPhone = `${userData.phoneCode}${userData.phone}`.replace(/\s+/g, '');
      const createResponse = await fetch("https://api.infusionsoft.com/crm/rest/v1/contacts", {
        method: "POST",
        headers: {
          "X-Keap-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_addresses: [{ email: userData.email, field: "EMAIL1" }],
          given_name: userData.firstName,
          family_name: userData.lastName,
          phone_numbers: [{ number: fullPhone, field: "PHONE1" }],
        }),
      });

      const newContact = await createResponse.json();
      contactId = newContact.id;
    }

    if (!contactId) {
      throw new Error("Failed to find or create contact in Keap");
    }

    // 2. Apply all selected Tags
    // We do this sequentially or in parallel for all selected events
    const tagPromises = eventTagIds.map(tagId => 
      fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}/tags`, {
        method: "POST",
        headers: {
          "X-Keap-API-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tagIds: [parseInt(tagId)]
        }),
      })
    );

    await Promise.all(tagPromises);

    return { success: true, contactId: contactId };
  } catch (error: any) {
    console.error("Keap Integration Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Fetches all tags from Keap account.
 */
export async function getKeapTags() {
  const apiKey = process.env.KEAP_API_KEY;

  if (!apiKey) {
    return { success: false, error: "KEAP_API_KEY missing" };
  }

  try {
    const response = await fetch("https://api.infusionsoft.com/crm/rest/v1/tags?limit=1000", {
      headers: {
        "X-Keap-API-Key": apiKey,
      },
    });

    const data = await response.json();
    
    if (!data.tags) {
      throw new Error("No tags found or API error");
    }

    // Format tags for the UI
    const formattedTags = data.tags.map((tag: any) => ({
      id: tag.id.toString(),
      name: tag.name,
      category: tag.category?.name || "Sin categoría"
    }));

    return { success: true, tags: formattedTags };
  } catch (error: any) {
    console.error("Error fetching Keap tags:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Removes a specific tag from a contact in Keap.
 */
export async function removeTagFromContact(email: string, tagId: string) {
  const apiKey = process.env.KEAP_API_KEY;
  if (!apiKey) return { success: false };

  try {
    // 1. Find contact by email to get ID
    const searchRes = await fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts?email=${encodeURIComponent(email)}`, {
      headers: { "X-Keap-API-Key": apiKey }
    });
    const searchData = await searchRes.json();
    if (!searchData.contacts || searchData.contacts.length === 0) return { success: false };
    
    const contactId = searchData.contacts[0].id;

    // 2. Delete the tag
    await fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}/tags/${tagId}`, {
      method: "DELETE",
      headers: { "X-Keap-API-Key": apiKey }
    });

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

/**
 * Intelligent sync: Compares old and new tags and applies changes in Keap.
 */
export async function syncKeapTags(userData: any, oldTagIds: string[], newTagIds: string[]) {
  const apiKey = process.env.KEAP_API_KEY;
  if (!apiKey) return { success: false };

  try {
    // 1. Find or Create contact ID
    const searchRes = await fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts?email=${encodeURIComponent(userData.email)}`, {
      headers: { "X-Keap-API-Key": apiKey }
    });
    const searchData = await searchRes.json();
    
    let contactId = null;

    if (searchData.contacts && searchData.contacts.length > 0) {
      contactId = searchData.contacts[0].id;
    } else {
      // Contact doesn't exist. Let's create it.
      // We need to fetch the registration data from Supabase to get full details if userData is incomplete
      const createRes = await registerInKeap({
        email: userData.email,
        firstName: userData.first_name || userData.firstName || "Inscrito",
        lastName: userData.last_name || userData.lastName || "Chu",
        phone: userData.phone || "",
        phoneCode: userData.phone_code || ""
      }, []); // Empty tags initially, we sync them below
      
      if (!createRes.success) return { success: false, error: "Failed to create contact in Keap" };
      contactId = createRes.contactId;
    }

    if (!contactId) return { success: false };

    // Tags to add (present in new but not in old)
    const toAdd = newTagIds.filter(id => !oldTagIds.includes(id));
    // Tags to remove (present in old but not in new)
    const toRemove = oldTagIds.filter(id => !newTagIds.includes(id));

    // Execute additions
    for (const tagId of toAdd) {
      await fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}/tags`, {
        method: "POST",
        headers: { "X-Keap-API-Key": apiKey, "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: [parseInt(tagId)] }),
      });
    }

    // Execute removals
    for (const tagId of toRemove) {
      await fetch(`https://api.infusionsoft.com/crm/rest/v1/contacts/${contactId}/tags/${tagId}`, {
        method: "DELETE",
        headers: { "X-Keap-API-Key": apiKey }
      });
    }

    return { success: true };
  } catch (error) {
    return { success: false };
  }
}

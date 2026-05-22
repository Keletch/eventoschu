"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";

export async function uploadImage(formData: FormData) {
  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo." };
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "La imagen no debe superar los 2MB." };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { data, error } = await supabaseAdmin.storage
      .from("public_assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Error uploading to Supabase Storage:", error);
      return { success: false, error: "Error al subir la imagen al servidor." };
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from("public_assets")
      .getPublicUrl(filePath);

    return { success: true, url: publicUrlData.publicUrl };
  } catch (err: any) {
    console.error("Upload Error:", err);
    return { success: false, error: "Excepción al intentar subir la imagen." };
  }
}

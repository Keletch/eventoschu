"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { verifyAdminPermission } from "./admin-check";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
};

export async function uploadImage(formData: FormData) {
  const { isAdmin } = await verifyAdminPermission();
  if (!isAdmin) return { success: false, error: "No tienes permisos" };

  try {
    const file = formData.get("file") as File | null;
    if (!file) {
      return { success: false, error: "No se proporcionó ningún archivo." };
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { success: false, error: "La imagen no debe superar los 2MB." };
    }

    // La extensión sale del MIME permitido, no del nombre (evita subir .html/.svg al bucket público)
    const fileExt = ALLOWED_IMAGE_TYPES[file.type];
    if (!fileExt) {
      return { success: false, error: "Formato no permitido. Usa PNG, JPG, WEBP, GIF o AVIF." };
    }
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error } = await supabaseAdmin.storage
      .from("public_assets")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
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

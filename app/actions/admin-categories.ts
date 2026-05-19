"use server";

import { supabaseAdmin } from "@/lib/supabase-admin";
import { revalidatePath } from "next/cache";

export async function createCategory(name: string, parent_category_id: string | null = null, icon: string | null = null, slug?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .insert([
        {
          name,
          parent_category_id,
          icon,
          slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error creating category:", error);
    return { success: false, error: error.message };
  }
}

export async function deleteCategory(id: string) {
  try {
    const { error } = await supabaseAdmin
      .from("categories")
      .delete()
      .eq("id", id);

    if (error) throw error;

    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return { success: false, error: error.message };
  }
}

export async function updateCategory(id: string, name: string, parent_category_id: string | null = null, icon: string | null = null, slug?: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("categories")
      .update({
        name,
        parent_category_id,
        icon,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    revalidatePath("/admin/dashboard");
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating category:", error);
    return { success: false, error: error.message };
  }
}

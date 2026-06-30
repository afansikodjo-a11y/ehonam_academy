// ──────────────────────────────────────────────────────────────
// Téléversement d'images vers Supabase Storage (bucket public).
// Utilisé par l'admin pour les miniatures de cours.
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";

const BUCKET = "course-images";

/** Téléverse une image et renvoie son URL publique (ou une erreur). */
export async function uploadCourseImage(file: File): Promise<{ url?: string; error?: string }> {
  try {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `covers/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) return { error: error.message };

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  } catch (e: any) {
    return { error: e?.message || "Échec du téléversement." };
  }
}

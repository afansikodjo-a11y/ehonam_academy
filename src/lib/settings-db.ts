// Réglages applicatifs stockés en base (table clé/valeur `app_settings`).
// Utilisé pour l'ID du Pixel Facebook, éditable depuis /admin/campagnes
// sans redéploiement. Fallback sur la variable d'environnement si Supabase
// n'est pas configuré ou si le réglage n'a jamais été enregistré.
import { supabase } from "@/lib/supabase";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const isSupabaseConfigured = url.length > 0 && !url.includes("placeholder");

const FB_PIXEL_ID_KEY = "fb_pixel_id";

export async function fetchPixelId(): Promise<string> {
  const envFallback = process.env.NEXT_PUBLIC_FB_PIXEL_ID || "";
  if (!isSupabaseConfigured) return envFallback;
  const { data, error } = await supabase.from("app_settings").select("value").eq("key", FB_PIXEL_ID_KEY).maybeSingle();
  // Pas de ligne enregistrée -> repli sur la variable d'environnement.
  // Une ligne existante (même vide) reflète un choix explicite de l'admin
  // (ex. pixel désactivé volontairement) : elle ne doit PAS être ignorée
  // au profit de la variable d'environnement.
  if (error || !data) return envFallback;
  return (data.value || "").trim();
}

/** Enregistre l'ID du pixel (upsert). Un ID vide désactive le suivi. Retourne une erreur ou null. */
export async function updatePixelId(id: string) {
  const { error } = await supabase
    .from("app_settings")
    .upsert({ key: FB_PIXEL_ID_KEY, value: id.trim(), updated_at: new Date().toISOString() });
  return error;
}

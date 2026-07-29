// Lecture du journal interne des évènements pixel, pour le tableau de bord
// /admin/campagnes. Écriture exclusivement via /api/pixel-events (service
// role) — voir supabase/schema.sql (aucune policy d'insert publique).
import { supabase } from "@/lib/supabase";

export interface PixelEventRow {
  id: string;
  event_name: string;
  content_id: string | null;
  content_name: string | null;
  value: number | null;
  currency: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  fbclid: string | null;
  path: string | null;
  visitor_id: string | null;
  created_at: string;
}

/** Évènements des N derniers jours (admin uniquement, cf. RLS). */
export async function fetchPixelEvents(sinceDays: number): Promise<PixelEventRow[]> {
  const since = new Date(Date.now() - sinceDays * 86400000).toISOString();
  const { data, error } = await supabase
    .from("pixel_events")
    .select("*")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(5000);
  if (error || !data) return [];
  return data as PixelEventRow[];
}

/** Efface tout le journal des évènements pixel (admin uniquement, cf. RLS). */
export async function resetPixelEvents() {
  const { error } = await supabase.from("pixel_events").delete().gte("created_at", "1970-01-01T00:00:00Z");
  return error;
}

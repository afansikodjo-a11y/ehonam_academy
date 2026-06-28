// ──────────────────────────────────────────────────────────────
// Data-access layer for coaching (accompagnement) offers.
// Mirrors courses-db.ts: Supabase when configured, else falls back
// to the static list in coaching.ts.
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { coachingOffers as staticOffers, type CoachingOffer } from "@/lib/coaching";
import { isSupabaseConfigured } from "@/lib/courses-db";

export interface AdminCoachingOffer extends CoachingOffer {
  published: boolean;
}

interface OfferRow {
  id: string;
  title: string;
  tagline: string;
  description: string;
  price: string;
  price_numeric: number;
  format: string;
  highlights: string[];
  popular: boolean;
  gradient: string;
  published: boolean;
  created_at?: string;
}

function rowToOffer(r: OfferRow): AdminCoachingOffer {
  return {
    id: r.id,
    title: r.title,
    tagline: r.tagline,
    description: r.description,
    price: r.price,
    priceNumeric: r.price_numeric,
    format: r.format,
    highlights: Array.isArray(r.highlights) ? r.highlights : [],
    popular: r.popular,
    gradient: r.gradient,
    published: r.published,
  };
}

function offerToRow(o: AdminCoachingOffer) {
  return {
    id: o.id,
    title: o.title,
    tagline: o.tagline,
    description: o.description,
    price: o.price,
    price_numeric: o.priceNumeric,
    format: o.format,
    highlights: o.highlights,
    popular: o.popular,
    gradient: o.gradient,
    published: o.published,
  };
}

/** Published coaching offers for the public site (falls back to static). */
export async function fetchPublishedCoaching(): Promise<CoachingOffer[]> {
  if (!isSupabaseConfigured) return staticOffers;
  const { data, error } = await supabase
    .from("coaching_offers")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return staticOffers;
  return (data as OfferRow[]).map(rowToOffer);
}

/** All offers including drafts — admin only. */
export async function fetchAllCoaching(): Promise<AdminCoachingOffer[]> {
  const { data, error } = await supabase
    .from("coaching_offers")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as OfferRow[]).map(rowToOffer);
}

/** Create or update an offer (upsert by id). Returns an error or null. */
export async function upsertCoaching(offer: AdminCoachingOffer) {
  const { error } = await supabase.from("coaching_offers").upsert(offerToRow(offer));
  return error;
}

/** Delete an offer by id. Returns an error or null. */
export async function deleteCoaching(id: string) {
  const { error } = await supabase.from("coaching_offers").delete().eq("id", id);
  return error;
}

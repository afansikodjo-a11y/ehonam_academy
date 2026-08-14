// ──────────────────────────────────────────────────────────────
// Liste d'attente pour les formations/accompagnements clôturés.
// L'inscription passe par /api/waitlist (pas d'insert direct côté client)
// pour pouvoir déclencher la notification WhatsApp admin. La lecture (admin
// uniquement) suit le pattern de courses-db.ts : client anon + RLS is_admin().
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import type { ItemType } from "@/lib/purchases-db";

export interface WaitlistSignupInput {
  itemType: ItemType;
  itemId: string;
  itemTitle: string;
  name: string;
  email: string;
  phone: string;
}

export interface WaitlistSignupRow {
  id: string;
  item_type: ItemType;
  item_id: string;
  item_title: string;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

/** Envoie une inscription à la liste d'attente. Retourne un message d'erreur ou null. */
export async function submitWaitlistSignup(input: WaitlistSignupInput): Promise<string | null> {
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      return data?.error || "Impossible d'enregistrer votre inscription.";
    }
    return null;
  } catch {
    return "Impossible d'enregistrer votre inscription.";
  }
}

/** Tous les inscrits à la liste d'attente — admin only. */
export async function fetchWaitlistSignups(): Promise<WaitlistSignupRow[]> {
  const { data, error } = await supabase
    .from("waitlist_signups")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as WaitlistSignupRow[];
}

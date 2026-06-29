// ──────────────────────────────────────────────────────────────
// Purchases data-access: each user only sees/records their own.
// Used by the checkout (record) and the student space (list).
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";

export type ItemType = "course" | "coaching";

export interface Purchase {
  id: string;
  itemType: ItemType;
  itemId: string;
  title: string;
  price: string;
  createdAt: string;
}

interface PurchaseRow {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  title: string;
  price: string;
  created_at: string;
}

function rowToPurchase(r: PurchaseRow): Purchase {
  return {
    id: r.id,
    itemType: r.item_type,
    itemId: r.item_id,
    title: r.title,
    price: r.price,
    createdAt: r.created_at,
  };
}

/** Record a purchase for the currently signed-in user (idempotent). */
export async function recordPurchase(p: {
  itemType: ItemType;
  itemId: string;
  title: string;
  price: string;
}): Promise<Error | null> {
  if (!isSupabaseConfigured) return new Error("Supabase non configuré");
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return new Error("Vous devez être connecté");
  const { error } = await supabase.from("purchases").upsert(
    {
      user_id: user.id,
      item_type: p.itemType,
      item_id: p.itemId,
      title: p.title,
      price: p.price,
    },
    { onConflict: "user_id,item_type,item_id" }
  );
  return error;
}

/** All purchases of the signed-in user (newest first). RLS limits to own rows. */
export async function fetchMyPurchases(): Promise<Purchase[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as PurchaseRow[]).map(rowToPurchase);
}

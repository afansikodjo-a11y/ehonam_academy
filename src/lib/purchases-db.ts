// ──────────────────────────────────────────────────────────────
// Purchases data-access: each user only sees/records their own;
// admins can read all and grant/revoke certificates.
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
  email: string;
  certified: boolean;
  certifiedAt: string | null;
  createdAt: string;
}

interface PurchaseRow {
  id: string;
  user_id: string;
  item_type: ItemType;
  item_id: string;
  title: string;
  price: string;
  email: string | null;
  certified: boolean | null;
  certified_at: string | null;
  created_at: string;
}

function rowToPurchase(r: PurchaseRow): Purchase {
  return {
    id: r.id,
    itemType: r.item_type,
    itemId: r.item_id,
    title: r.title,
    price: r.price,
    email: r.email || "",
    certified: !!r.certified,
    certifiedAt: r.certified_at,
    createdAt: r.created_at,
  };
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

/** All purchases — admin only (RLS allows admins to read every row). */
export async function fetchAllPurchases(): Promise<Purchase[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("purchases")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as PurchaseRow[]).map(rowToPurchase);
}

/** Grant or revoke the certificate for a purchase — admin only. */
export async function setCertified(purchaseId: string, value: boolean) {
  const { error } = await supabase
    .from("purchases")
    .update({ certified: value, certified_at: value ? new Date().toISOString() : null })
    .eq("id", purchaseId);
  return error;
}

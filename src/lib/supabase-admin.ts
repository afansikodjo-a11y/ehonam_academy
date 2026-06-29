// ──────────────────────────────────────────────────────────────
// Server-only Supabase client using the SERVICE ROLE key.
// Bypasses RLS — use ONLY in trusted server code (API routes/webhook),
// e.g. to grant a purchase to a user after a confirmed payment.
// NEVER import this in client components.
// ──────────────────────────────────────────────────────────────

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export const isServiceConfigured =
  url.length > 0 && !url.includes("placeholder") && serviceKey.length > 0;

export const supabaseAdmin = createClient(url, serviceKey || "placeholder", {
  auth: { autoRefreshToken: false, persistSession: false },
});

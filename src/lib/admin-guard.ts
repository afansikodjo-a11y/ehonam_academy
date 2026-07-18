// ──────────────────────────────────────────────────────────────
// Server-only guard for admin-only API routes. Verifies the caller's
// bearer token and that their profile is_admin — using the caller's
// OWN session (role authenticated), so it works even if service_role
// is missing table grants (see supabase/schema.sql fix).
// ──────────────────────────────────────────────────────────────

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

type AdminGuardOk = { user: User; supa: SupabaseClient };
type AdminGuardErr = { error: string; status: number };

export async function requireAdmin(request: Request): Promise<AdminGuardOk | AdminGuardErr> {
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!token) return { error: "Non authentifié.", status: 401 };

  const supa = createClient(SUPA_URL, ANON, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const { data: userData, error: userErr } = await supa.auth.getUser(token);
  if (userErr || !userData.user) return { error: "Session invalide. Reconnectez-vous.", status: 401 };

  const { data: profile, error: profileErr } = await supa
    .from("profiles")
    .select("is_admin")
    .eq("id", userData.user.id)
    .maybeSingle();
  if (profileErr || !profile?.is_admin) return { error: "Accès réservé aux administrateurs.", status: 403 };

  return { user: userData.user, supa };
}

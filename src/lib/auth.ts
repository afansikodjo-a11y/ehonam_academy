// ──────────────────────────────────────────────────────────────
// Auth helpers shared by the unified login + admin guards.
// Role is read from the `profiles` table (is_admin).
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";

/** Returns true if a user is currently signed in. */
export async function hasSession(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data } = await supabase.auth.getSession();
  return !!data.session;
}

/** Returns true if the signed-in user is an admin (profiles.is_admin). */
export async function isCurrentUserAdmin(): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: sess } = await supabase.auth.getSession();
  const user = sess.session?.user;
  if (!user) return false;
  const { data, error } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !data) return false;
  return !!data.is_admin;
}

/** Where to send a user after login, based on their role. */
export async function destinationAfterLogin(): Promise<string> {
  return (await isCurrentUserAdmin()) ? "/admin" : "/";
}

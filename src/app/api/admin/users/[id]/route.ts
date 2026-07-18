import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-guard";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";

// Supprime définitivement un compte (auth.users) — les tables profiles,
// purchases, lesson_comments et lesson_progress ont toutes une FK
// "on delete cascade" vers auth.users : leurs données pour cet utilisateur
// disparaissent automatiquement avec lui.
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { user } = guard;

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Identifiant manquant." }, { status: 400 });
  if (id === user.id) {
    return NextResponse.json({ error: "Vous ne pouvez pas supprimer votre propre compte." }, { status: 400 });
  }
  if (!isServiceConfigured) {
    return NextResponse.json({ error: "Service non configuré (clé service_role manquante)." }, { status: 500 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (error) {
    console.error("[admin/users delete] échec:", error);
    return NextResponse.json({ error: "Suppression échouée." }, { status: 500 });
  }

  return NextResponse.json({ deleted: true });
}

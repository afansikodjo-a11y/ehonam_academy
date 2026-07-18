import { NextResponse } from "next/server";
import type { User } from "@supabase/supabase-js";
import { requireAdmin } from "@/lib/admin-guard";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";

function parsePrice(price: string): number {
  const digits = (price || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

// Liste tous les comptes inscrits, avec rôle et récapitulatif d'achats.
// - Les comptes viennent de l'API Admin Auth (service_role) : indépendante
//   des GRANTs Postgres, donc pas affectée par le correctif service_role.
// - Le rôle (profiles) et les achats (purchases) sont lus avec la SESSION
//   DE L'APPELANT (role authenticated), qui a déjà les bons droits via RLS.
export async function GET(request: Request) {
  const guard = await requireAdmin(request);
  if ("error" in guard) return NextResponse.json({ error: guard.error }, { status: guard.status });
  const { supa } = guard;

  if (!isServiceConfigured) {
    return NextResponse.json({ error: "Service non configuré (clé service_role manquante)." }, { status: 500 });
  }

  try {
    let page = 1;
    const perPage = 200;
    let authUsers: User[] = [];
    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
      if (error) throw error;
      authUsers = authUsers.concat(data.users);
      if (data.users.length < perPage) break;
      page++;
    }

    const [{ data: profiles }, { data: purchaseRows }] = await Promise.all([
      supa.from("profiles").select("id, is_admin"),
      supa.from("purchases").select("user_id, item_type, item_id, title, price, certified, created_at"),
    ]);

    const adminIds = new Set((profiles || []).filter((p) => p.is_admin).map((p) => p.id));

    const purchasesByUser = new Map<string, typeof purchaseRows>();
    for (const p of purchaseRows || []) {
      const list = purchasesByUser.get(p.user_id) || [];
      list.push(p);
      purchasesByUser.set(p.user_id, list);
    }

    const users = authUsers.map((u) => {
      const meta = (u.user_metadata || {}) as Record<string, unknown>;
      const purchases = purchasesByUser.get(u.id) || [];
      const totalSpent = purchases.reduce((s, p) => s + parsePrice(p.price), 0);
      return {
        id: u.id,
        email: u.email || "",
        fullName: (meta.full_name as string) || (meta.name as string) || "",
        provider: u.app_metadata?.provider || "email",
        isAdmin: adminIds.has(u.id),
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at || null,
        emailConfirmed: !!u.email_confirmed_at,
        purchaseCount: purchases.length,
        totalSpent,
        purchases: purchases.map((p) => ({
          title: p.title,
          itemType: p.item_type,
          price: p.price,
          certified: p.certified,
          createdAt: p.created_at,
        })),
      };
    });

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ users });
  } catch (err: any) {
    console.error("[admin/users] exception:", err);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

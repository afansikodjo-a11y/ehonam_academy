import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const MONEROO_SECRET = process.env.MONEROO_SECRET_KEY || "";
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Initialise un paiement Moneroo pour l'utilisateur connecté et renvoie l'URL
// de paiement. L'accès est accordé plus tard par le webhook (après paiement).
export async function POST(request: Request) {
  try {
    if (!MONEROO_SECRET) {
      return NextResponse.json({ error: "Paiement non configuré (clé Moneroo manquante)." }, { status: 500 });
    }

    const supa = createClient(SUPA_URL, ANON);

    // 1. Authentifie l'utilisateur via son token Supabase
    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    const { data: userData, error: userErr } = await supa.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Session invalide. Reconnectez-vous." }, { status: 401 });
    }
    const user = userData.user;

    // 2. Récupère l'article et son prix EN BASE (lecture publique des éléments publiés)
    const body = await request.json();
    const itemType: "course" | "coaching" = body.itemType === "coaching" ? "coaching" : "course";
    const itemId = String(body.itemId || "");
    if (!itemId) return NextResponse.json({ error: "Article manquant." }, { status: 400 });

    const table = itemType === "coaching" ? "coaching_offers" : "courses";
    const { data: item, error: itemErr } = await supa
      .from(table)
      .select("title, price, price_numeric")
      .eq("id", itemId)
      .maybeSingle();

    if (itemErr) {
      console.error("[checkout] erreur lecture article:", itemErr, { table, itemId });
      return NextResponse.json({ error: "Erreur d'accès aux données." }, { status: 500 });
    }
    if (!item) {
      return NextResponse.json({ error: `Article introuvable (${itemType} : ${itemId}).` }, { status: 404 });
    }

    const amount = Number((item as { price_numeric: number }).price_numeric) || 0;
    if (amount <= 0) return NextResponse.json({ error: "Prix invalide." }, { status: 400 });

    // 3. Identité client pour Moneroo (prénom/nom requis)
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "") as string;
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || (user.email ? user.email.split("@")[0] : "Client");
    const lastName = parts.slice(1).join(" ") || "Client";

    const origin = new URL(request.url).origin;

    // 4. Initialise le paiement
    const res = await fetch("https://api.moneroo.io/v1/payments/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MONEROO_SECRET}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "XOF",
        description: ((item as { title: string }).title || "Achat Ehonam Academy").slice(0, 140),
        customer: { email: user.email, first_name: firstName, last_name: lastName },
        return_url: `${origin}/mon-espace?paiement=succes`,
        metadata: {
          user_id: user.id,
          user_email: user.email || "",
          item_type: itemType,
          item_id: itemId,
          title: (item as { title: string }).title || "",
          price: (item as { price: string }).price || "",
        },
      }),
    });

    const data = await res.json().catch(() => ({}));
    const checkoutUrl = data?.data?.checkout_url;
    if (!res.ok || !checkoutUrl) {
      console.error("[checkout] Moneroo init échec:", data);
      return NextResponse.json({ error: "Échec de l'initialisation du paiement." }, { status: 502 });
    }

    return NextResponse.json({ checkoutUrl });
  } catch (err: any) {
    console.error("[checkout] exception:", err);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

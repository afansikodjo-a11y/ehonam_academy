import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";
import { MYAPP_PAY_BASE_URL, MYAPP_PAY_SECRET, MYAPP_PAY_METHOD, MYAPP_PAY_COUNTRY } from "@/lib/myapppay";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Initialise un paiement myapp-pay pour l'utilisateur connecté et renvoie
// l'URL de paiement. L'accès est accordé plus tard par le webhook (après
// paiement), avec /api/confirm-payment comme filet de sécurité au retour.
export async function POST(request: Request) {
  try {
    if (!MYAPP_PAY_SECRET) {
      return NextResponse.json({ error: "Paiement non configuré (clé myapp-pay manquante)." }, { status: 500 });
    }
    if (!isServiceConfigured) {
      return NextResponse.json({ error: "Paiement non configuré (service serveur manquant)." }, { status: 500 });
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

    if (!(await checkRateLimit("checkout", user.id))) {
      return NextResponse.json(
        { error: "Trop de tentatives de paiement. Réessayez dans un instant." },
        { status: 429 }
      );
    }

    // 2. Récupère l'article et son prix EN BASE (lecture publique des éléments publiés)
    const body = await request.json();
    const itemType: "course" | "coaching" = body.itemType === "coaching" ? "coaching" : "course";
    const itemId = String(body.itemId || "");
    if (!itemId) return NextResponse.json({ error: "Article manquant." }, { status: 400 });

    // Pays/méthode choisis par le client dans <CheckoutModal> parmi les moyens
    // réellement actifs (voir /api/payment-methods) ; myapp-pay ne fournit
    // aucune sélection sur sa page hébergée, ce choix doit être fait avant.
    // myapp-pay revalide de toute façon le couple à la création (400
    // no_provider_available si invalide) — pas de re-vérification ici, ces
    // champs ne pèsent pas sur le montant facturé (lu en base juste au-dessus).
    const method = String(body.method || "") || MYAPP_PAY_METHOD;
    const country = String(body.country || "").toUpperCase() || MYAPP_PAY_COUNTRY;

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

    // 3. Identité client pour myapp-pay
    const fullName = (user.user_metadata?.full_name || user.user_metadata?.name || "") as string;
    const title = (item as { title: string }).title || "";
    const price = (item as { price: string }).price || "";

    const origin = new URL(request.url).origin;

    // 4. Initialise le paiement
    const res = await fetch(`${MYAPP_PAY_BASE_URL}/payments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${MYAPP_PAY_SECRET}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Idempotency-Key": crypto.randomUUID(),
      },
      body: JSON.stringify({
        amount,
        method,
        country,
        currency: "XOF",
        description: title.slice(0, 500) || "Achat Ehonam Academy",
        customer: { email: user.email, fullName: fullName || undefined },
        returnUrl: `${origin}/mon-espace?paiement=succes`,
      }),
    });

    const data = await res.json().catch(() => ({}));
    const checkoutUrl = data?.checkoutUrl;
    const paymentId = data?.id || "";
    if (!res.ok || !checkoutUrl || !paymentId) {
      console.error("[checkout] myapp-pay init échec:", data);
      const reason =
        data?.error === "no_provider_available"
          ? "Ce moyen de paiement n'est pas disponible pour le moment. Choisissez-en un autre."
          : "Échec de l'initialisation du paiement.";
      return NextResponse.json({ error: reason }, { status: 502 });
    }

    // 5. Enregistre la correspondance paiement ↔ utilisateur/article — myapp-pay
    // ne renvoie aucune métadonnée, donc cette table est l'unique source de
    // vérité utilisée par le webhook et /api/confirm-payment.
    const { error: intentErr } = await supabaseAdmin.from("payment_intents").insert({
      provider: "myapp-pay",
      provider_payment_id: paymentId,
      user_id: user.id,
      item_type: itemType,
      item_id: itemId,
      title,
      price,
      amount_numeric: amount,
      email: user.email || "",
    });
    if (intentErr) {
      console.error("[checkout] échec enregistrement payment_intent:", intentErr);
      return NextResponse.json({ error: "Échec de l'initialisation du paiement." }, { status: 500 });
    }

    return NextResponse.json({ checkoutUrl, paymentId });
  } catch (err: any) {
    console.error("[checkout] exception:", err);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

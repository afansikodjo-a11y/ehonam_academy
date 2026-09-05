import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyNewPurchase } from "@/lib/notify";
import { checkRateLimit } from "@/lib/rate-limit";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";
import { MYAPP_PAY_SECRET, MYAPP_PAY_SUCCESS_STATUS, fetchMyappPayPayment } from "@/lib/myapppay";

const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Confirmation synchrone au retour de paiement : on revérifie la transaction
// auprès de myapp-pay (avec la clé secrète) puis on enregistre l'achat au nom
// de l'utilisateur connecté. C'est un filet de sécurité indépendant du
// webhook — le statut renvoyé dans l'URL de retour n'est jamais fiable
// (modifiable côté navigateur, précisé par la doc myapp-pay elle-même).
export async function POST(request: Request) {
  try {
    if (!MYAPP_PAY_SECRET || !isServiceConfigured) {
      return NextResponse.json({ error: "Paiement non configuré." }, { status: 500 });
    }

    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const paymentId = String(body.paymentId || "").trim();
    if (!paymentId) return NextResponse.json({ error: "Paiement manquant." }, { status: 400 });

    const supa = createClient(SUPA_URL, ANON);
    const { data: userData, error: userErr } = await supa.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }
    const user = userData.user;

    if (!(await checkRateLimit("confirm", user.id))) {
      return NextResponse.json({ error: "Trop de requêtes. Réessayez dans un instant." }, { status: 429 });
    }

    // Revérifie la transaction auprès de myapp-pay
    const tx = await fetchMyappPayPayment(paymentId);
    if (!tx) {
      console.error("[confirm-payment] vérification échouée pour", paymentId);
      return NextResponse.json({ granted: false, reason: "verify_failed" }, { status: 200 });
    }
    if (tx.status !== MYAPP_PAY_SUCCESS_STATUS) {
      return NextResponse.json({ granted: false, status: tx.status }, { status: 200 });
    }

    // myapp-pay ne renvoie pas de métadonnées : la correspondance utilisateur/
    // article vient de payment_intents (créée lors de /api/checkout).
    const { data: intent, error: intentErr } = await supabaseAdmin
      .from("payment_intents")
      .select("user_id, item_type, item_id, title, price, email, amount_numeric")
      .eq("provider", "myapp-pay")
      .eq("provider_payment_id", paymentId)
      .maybeSingle();

    if (intentErr || !intent) {
      console.error("[confirm-payment] payment_intent introuvable:", intentErr, { paymentId });
      return NextResponse.json({ granted: false, reason: "no_item" }, { status: 200 });
    }

    // Sécurité : un paiement ne peut être réclamé que par son propriétaire
    if (intent.user_id !== user.id) {
      return NextResponse.json({ granted: false, reason: "owner_mismatch" }, { status: 403 });
    }

    const paidAmount = Number(tx.amount ?? tx.amountGross ?? 0);
    if (paidAmount !== Number(intent.amount_numeric)) {
      console.error("[confirm-payment] montant incohérent:", { paidAmount, expected: intent.amount_numeric, paymentId });
      return NextResponse.json({ granted: false, reason: "amount_mismatch" }, { status: 200 });
    }

    const { data: inserted, error: insErr } = await supabaseAdmin
      .from("purchases")
      .upsert(
        { user_id: user.id, item_type: intent.item_type, item_id: intent.item_id, title: intent.title, price: intent.price, email: intent.email || user.email || "" },
        { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }
      )
      .select();
    if (insErr) {
      console.error("[confirm-payment] enregistrement échoué:", insErr);
      return NextResponse.json({ error: "Enregistrement échoué." }, { status: 500 });
    }

    // Notifie l'admin uniquement si une nouvelle ligne a été créée (pas de doublon).
    if (inserted && inserted.length > 0) {
      await notifyNewPurchase({ title: intent.title, price: intent.price, email: intent.email || user.email || "", itemType: intent.item_type });
    }

    return NextResponse.json({ granted: true, itemType: intent.item_type, itemId: intent.item_id });
  } catch (err: any) {
    console.error("[confirm-payment] exception:", err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}

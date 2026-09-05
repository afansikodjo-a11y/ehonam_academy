import { NextResponse } from "next/server";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";
import { notifyNewPurchase } from "@/lib/notify";
import {
  MYAPP_PAY_SECRET,
  MYAPP_PAY_WEBHOOK_SECRET,
  MYAPP_PAY_SUCCESS_STATUS,
  verifyMyappPaySignature,
  fetchMyappPayPayment,
} from "@/lib/myapppay";

// Webhook myapp-pay : la signature est vérifiée strictement (l'algorithme est
// documenté précisément, contrairement à Moneroo où le format pouvait varier),
// puis la transaction est REVÉRIFIÉE via GET /payments/:id avant d'accorder
// quoi que ce soit — jamais confiance dans le seul payload reçu.
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();

    if (!MYAPP_PAY_WEBHOOK_SECRET) {
      console.error("[myapppay-webhook] MYAPP_PAY_WEBHOOK_SECRET non configuré");
      return NextResponse.json({ error: "Serveur non configuré" }, { status: 500 });
    }

    const signature = request.headers.get("x-myapp-signature") || "";
    if (!verifyMyappPaySignature(MYAPP_PAY_WEBHOOK_SECRET, bodyText, signature)) {
      console.warn("[myapppay-webhook] signature invalide ou expirée");
      return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
    }

    const event = request.headers.get("x-myapp-event") || "";
    if (event !== "payment.succeeded") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const payload = JSON.parse(bodyText);
    const paymentId = payload?.id;
    if (!paymentId) return NextResponse.json({ error: "id de paiement manquant" }, { status: 400 });

    if (!isServiceConfigured || !MYAPP_PAY_SECRET) {
      console.error("[myapppay-webhook] serveur non configuré (service role / clé myapp-pay)");
      return NextResponse.json({ error: "Serveur non configuré" }, { status: 500 });
    }

    // Revérifie la transaction auprès de myapp-pay (jamais confiance dans le
    // seul payload webhook, même signé) avant d'accorder quoi que ce soit.
    const tx = await fetchMyappPayPayment(paymentId);
    if (!tx || tx.status !== MYAPP_PAY_SUCCESS_STATUS) {
      console.error("[myapppay-webhook] vérification non confirmée:", tx);
      return NextResponse.json({ received: true, granted: false }, { status: 200 });
    }

    // myapp-pay ne renvoie pas de métadonnées : on retrouve l'utilisateur et
    // l'article via la table payment_intents créée lors de /api/checkout.
    const { data: intent, error: intentErr } = await supabaseAdmin
      .from("payment_intents")
      .select("user_id, item_type, item_id, title, price, email, amount_numeric")
      .eq("provider", "myapp-pay")
      .eq("provider_payment_id", paymentId)
      .maybeSingle();

    if (intentErr || !intent) {
      console.error("[myapppay-webhook] payment_intent introuvable:", intentErr, { paymentId });
      return NextResponse.json({ received: true, granted: false }, { status: 200 });
    }

    // Défense en profondeur : le montant payé doit correspondre à celui
    // demandé à la création (protège contre une transaction détournée).
    const paidAmount = Number(tx.amount ?? tx.amountGross ?? 0);
    if (paidAmount !== Number(intent.amount_numeric)) {
      console.error("[myapppay-webhook] montant incohérent:", { paidAmount, expected: intent.amount_numeric, paymentId });
      return NextResponse.json({ received: true, granted: false }, { status: 200 });
    }

    const { data: inserted, error } = await supabaseAdmin
      .from("purchases")
      .upsert(
        {
          user_id: intent.user_id,
          item_type: intent.item_type,
          item_id: intent.item_id,
          title: intent.title,
          price: intent.price,
          email: intent.email,
        },
        { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }
      )
      .select();

    if (error) {
      console.error("[myapppay-webhook] enregistrement achat échoué:", error);
      return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
    }

    if (inserted && inserted.length > 0) {
      await notifyNewPurchase({ title: intent.title, price: intent.price, email: intent.email || "", itemType: intent.item_type });
    }

    return NextResponse.json({ received: true, granted: true }, { status: 200 });
  } catch (err) {
    console.error("[myapppay-webhook] exception:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

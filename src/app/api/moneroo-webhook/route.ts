import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";

const WEBHOOK_SECRET = process.env.MONEROO_WEBHOOK_SECRET || "";
const MONEROO_SECRET = process.env.MONEROO_SECRET_KEY || "";

// Moneroo webhook: on a successful payment, verify the signature, re-fetch the
// transaction (metadata isn't included in the webhook), then grant the purchase.
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();

    // 1. Vérifie la signature (HMAC-SHA256 hex du corps brut)
    const signature = request.headers.get("x-moneroo-signature") || "";
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== "placeholder-webhook-secret") {
      const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(bodyText).digest("hex");
      if (expected !== signature) {
        console.error("[webhook] signature invalide");
        return NextResponse.json({ error: "Signature invalide" }, { status: 401 });
      }
    }

    const payload = JSON.parse(bodyText);
    if (payload?.event !== "payment.success") {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const paymentId = payload?.data?.id;
    if (!paymentId) return NextResponse.json({ error: "id de paiement manquant" }, { status: 400 });

    if (!isServiceConfigured || !MONEROO_SECRET) {
      console.error("[webhook] serveur non configuré (service role / clé Moneroo)");
      return NextResponse.json({ error: "Serveur non configuré" }, { status: 500 });
    }

    // 2. Re-vérifie la transaction pour récupérer le statut + les métadonnées
    const verifyRes = await fetch(`https://api.moneroo.io/v1/payments/${paymentId}/verify`, {
      headers: { Authorization: `Bearer ${MONEROO_SECRET}`, Accept: "application/json" },
    });
    const verifyData = await verifyRes.json().catch(() => ({}));
    const tx = verifyData?.data;

    if (!verifyRes.ok || !tx || tx.status !== "success") {
      console.error("[webhook] vérification non confirmée:", verifyData);
      // 200 pour éviter les ré-essais en boucle ; rien n'est accordé.
      return NextResponse.json({ received: true, granted: false }, { status: 200 });
    }

    const md = tx.metadata || {};
    if (!md.user_id || !md.item_id || !md.item_type) {
      console.error("[webhook] métadonnées manquantes:", md);
      return NextResponse.json({ received: true, granted: false }, { status: 200 });
    }

    // 3. Accorde l'achat (idempotent)
    const { error } = await supabaseAdmin.from("purchases").upsert(
      {
        user_id: md.user_id,
        item_type: md.item_type,
        item_id: md.item_id,
        title: md.title || "",
        price: md.price || (tx.amount ? `${tx.amount} ${tx.currency || "XOF"}` : ""),
        email: md.user_email || tx.customer?.email || "",
      },
      { onConflict: "user_id,item_type,item_id" }
    );

    if (error) {
      console.error("[webhook] enregistrement achat échoué:", error);
      return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
    }

    return NextResponse.json({ received: true, granted: true }, { status: 200 });
  } catch (err: any) {
    console.error("[webhook] exception:", err);
    return NextResponse.json({ error: "Erreur interne", details: err.message }, { status: 500 });
  }
}

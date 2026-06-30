import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";
import { notifyNewPurchase } from "@/lib/notify";

const WEBHOOK_SECRET = process.env.MONEROO_WEBHOOK_SECRET || "";
const MONEROO_SECRET = process.env.MONEROO_SECRET_KEY || "";

// Moneroo webhook: on a successful payment, verify the signature, re-fetch the
// transaction (metadata isn't included in the webhook), then grant the purchase.
export async function POST(request: Request) {
  try {
    const bodyText = await request.text();

    // 1. Vérification de signature (best-effort, non bloquante).
    // La vraie sécurité vient de la RE-VÉRIFICATION de la transaction via
    // l'API Moneroo plus bas (avec la clé secrète) : on n'accorde l'accès que
    // si Moneroo confirme un paiement "success". On ne bloque donc pas sur la
    // signature (dont le format exact peut varier).
    const signature = request.headers.get("x-moneroo-signature") || "";
    if (WEBHOOK_SECRET && WEBHOOK_SECRET !== "placeholder-webhook-secret") {
      const expected = crypto.createHmac("sha256", WEBHOOK_SECRET).update(bodyText).digest("hex");
      if (expected !== signature) {
        console.warn("[webhook] signature non concordante — re-vérification via l'API Moneroo");
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
    const verifyRes = await fetch(`https://api.moneroo.io/v1/payments/${encodeURIComponent(paymentId)}/verify`, {
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
    const title = md.title || "";
    const price = md.price || (tx.amount ? `${tx.amount} ${tx.currency || "XOF"}` : "");
    const email = md.user_email || tx.customer?.email || "";

    const { data: inserted, error } = await supabaseAdmin
      .from("purchases")
      .upsert(
        { user_id: md.user_id, item_type: md.item_type, item_id: md.item_id, title, price, email },
        { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }
      )
      .select();

    if (error) {
      console.error("[webhook] enregistrement achat échoué:", error);
      return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
    }

    // Notifie l'admin uniquement si une nouvelle ligne a été créée (pas de doublon).
    if (inserted && inserted.length > 0) {
      await notifyNewPurchase({ title, price, email, itemType: md.item_type });
    }

    return NextResponse.json({ received: true, granted: true }, { status: 200 });
  } catch (err) {
    console.error("[webhook] exception:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

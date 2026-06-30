import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyNewPurchase } from "@/lib/notify";

const MONEROO_SECRET = process.env.MONEROO_SECRET_KEY || "";
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Statuts Moneroo considérés comme "payé"
const SUCCESS_STATUSES = ["success", "successful", "completed", "paid"];

// Confirmation synchrone au retour de paiement : on revérifie la transaction
// auprès de Moneroo (avec la clé secrète) puis on enregistre l'achat au nom de
// l'utilisateur connecté. C'est un filet de sécurité indépendant du webhook.
export async function POST(request: Request) {
  try {
    if (!MONEROO_SECRET) {
      return NextResponse.json({ error: "Paiement non configuré." }, { status: 500 });
    }

    const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
    if (!token) return NextResponse.json({ error: "Non authentifié." }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const paymentId = String(body.paymentId || "").trim();
    if (!paymentId) return NextResponse.json({ error: "Paiement manquant." }, { status: 400 });

    // Client agissant AU NOM de l'utilisateur → respecte la RLS
    // (policy "Users insert own purchases" : auth.uid() = user_id).
    const supa = createClient(SUPA_URL, ANON, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userData, error: userErr } = await supa.auth.getUser(token);
    if (userErr || !userData.user) {
      return NextResponse.json({ error: "Session invalide." }, { status: 401 });
    }
    const user = userData.user;

    // Revérifie la transaction auprès de Moneroo
    const verifyRes = await fetch(`https://api.moneroo.io/v1/payments/${paymentId}/verify`, {
      headers: { Authorization: `Bearer ${MONEROO_SECRET}`, Accept: "application/json" },
    });
    const verifyData = await verifyRes.json().catch(() => ({}));
    const tx = verifyData?.data;
    const status = String(tx?.status || "").toLowerCase();

    if (!verifyRes.ok || !tx) {
      console.error("[confirm-payment] vérification échouée:", verifyData);
      return NextResponse.json({ granted: false, reason: "verify_failed" }, { status: 200 });
    }
    if (!SUCCESS_STATUSES.includes(status)) {
      return NextResponse.json({ granted: false, status }, { status: 200 });
    }

    const md = tx.metadata || {};
    // Sécurité : un paiement ne peut être réclamé que par son propriétaire
    if (md.user_id && md.user_id !== user.id) {
      return NextResponse.json({ granted: false, reason: "owner_mismatch" }, { status: 403 });
    }

    const itemType = md.item_type === "coaching" ? "coaching" : "course";
    const itemId = String(md.item_id || "");
    if (!itemId) return NextResponse.json({ granted: false, reason: "no_item" }, { status: 200 });

    const title = md.title || "";
    const price = md.price || (tx.amount ? `${tx.amount} ${tx.currency || "XOF"}` : "");
    const email = md.user_email || user.email || "";

    const { data: inserted, error: insErr } = await supa
      .from("purchases")
      .upsert(
        { user_id: user.id, item_type: itemType, item_id: itemId, title, price, email },
        { onConflict: "user_id,item_type,item_id", ignoreDuplicates: true }
      )
      .select();
    if (insErr) {
      console.error("[confirm-payment] enregistrement échoué:", insErr);
      return NextResponse.json({ error: "Enregistrement échoué." }, { status: 500 });
    }

    // Notifie l'admin uniquement si une nouvelle ligne a été créée (pas de doublon).
    if (inserted && inserted.length > 0) {
      await notifyNewPurchase({ title, price, email, itemType });
    }

    return NextResponse.json({ granted: true, itemType, itemId });
  } catch (err: any) {
    console.error("[confirm-payment] exception:", err);
    return NextResponse.json({ error: "Erreur interne." }, { status: 500 });
  }
}

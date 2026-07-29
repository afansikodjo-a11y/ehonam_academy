import { NextResponse } from "next/server";
import { supabaseAdmin, isServiceConfigured } from "@/lib/supabase-admin";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Journal interne des évènements pixel (ViewContent, InitiateCheckout, ...),
// tagués UTM/fbclid, pour le tableau de bord /admin/campagnes. Écrit en
// service_role : aucune policy d'insertion publique n'existe sur la table.
const ALLOWED_EVENTS = new Set([
  "ViewContent",
  "InitiateCheckout",
  "AddPaymentInfo",
  "CompleteRegistration",
  "Purchase",
]);

export async function POST(request: Request) {
  try {
    const allowed = await checkRateLimit("pixelEvent", clientIp(request));
    if (!allowed) return NextResponse.json({ error: "Trop de requêtes" }, { status: 429 });

    if (!isServiceConfigured) return NextResponse.json({ ok: true }, { status: 200 });

    const body = await request.json().catch(() => ({}));
    const eventName = body?.event_name;
    if (typeof eventName !== "string" || !ALLOWED_EVENTS.has(eventName)) {
      return NextResponse.json({ error: "Évènement invalide" }, { status: 400 });
    }

    const asString = (v: unknown) => (typeof v === "string" && v ? v.slice(0, 300) : null);
    const asNumber = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : null);
    const contentIds = Array.isArray(body?.content_ids) ? body.content_ids : null;

    const { error } = await supabaseAdmin.from("pixel_events").insert({
      event_name: eventName,
      content_id: contentIds && contentIds[0] != null ? String(contentIds[0]).slice(0, 300) : asString(body?.content_id),
      content_name: asString(body?.content_name),
      value: asNumber(body?.value),
      currency: asString(body?.currency),
      utm_source: asString(body?.utm_source),
      utm_medium: asString(body?.utm_medium),
      utm_campaign: asString(body?.utm_campaign),
      utm_content: asString(body?.utm_content),
      utm_term: asString(body?.utm_term),
      fbclid: asString(body?.fbclid),
      path: asString(body?.path),
      visitor_id: asString(body?.visitor_id),
    });

    if (error) {
      console.error("[pixel-events] enregistrement échoué:", error);
      return NextResponse.json({ error: "Enregistrement échoué" }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error("[pixel-events] exception:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

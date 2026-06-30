import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";

// Supabase is only "really" configured when the env var is set to a real URL
// (not the placeholder fallback in lib/supabase.ts).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const isSupabaseConfigured = supabaseUrl.length > 0 && !supabaseUrl.includes("placeholder");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit("contact", clientIp(request)))) {
      return NextResponse.json(
        { error: "Trop de messages envoyés. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const phone = (body.phone || "").toString().trim();
    const subject = (body.subject || "Autre").toString().trim();
    const message = (body.message || "").toString().trim();

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom, votre email et votre message." },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("contacts").insert({
        name,
        email,
        phone: phone || null,
        subject,
        message,
        created_at: new Date().toISOString(),
      });

      if (error) {
        console.error("[Contact] Erreur d'enregistrement Supabase:", error);
        return NextResponse.json(
          { error: "Échec de l'envoi du message. Veuillez réessayer." },
          { status: 500 }
        );
      }
    } else {
      // Demo mode: no backend wired yet — log so nothing is lost in dev.
      console.log("[Contact] (mode démo) message reçu:", { name, email, phone, subject, message });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Contact] Exception:", err);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

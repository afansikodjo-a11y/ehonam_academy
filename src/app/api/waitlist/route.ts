import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkRateLimit, clientIp } from "@/lib/rate-limit";
import { notifyWaitlistSignup } from "@/lib/notify";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const isSupabaseConfigured = supabaseUrl.length > 0 && !supabaseUrl.includes("placeholder");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_ITEM_TYPES = new Set(["course", "coaching"]);

export async function POST(request: Request) {
  try {
    if (!(await checkRateLimit("waitlist", clientIp(request)))) {
      return NextResponse.json(
        { error: "Trop de demandes. Réessayez dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const itemType = (body.itemType || "").toString().trim();
    const itemId = (body.itemId || "").toString().trim();
    const itemTitle = (body.itemTitle || "").toString().trim();
    const name = (body.name || "").toString().trim();
    const email = (body.email || "").toString().trim();
    const phone = (body.phone || "").toString().trim();

    if (!ALLOWED_ITEM_TYPES.has(itemType) || !itemId) {
      return NextResponse.json({ error: "Article invalide." }, { status: 400 });
    }
    if (!name || !email || !phone) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom, votre email et votre téléphone." },
        { status: 400 }
      );
    }
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from("waitlist_signups").insert({
        item_type: itemType,
        item_id: itemId,
        item_title: itemTitle,
        name,
        email,
        phone,
      });

      if (error) {
        console.error("[Waitlist] Erreur d'enregistrement Supabase:", error);
        return NextResponse.json(
          { error: "Échec de l'inscription. Veuillez réessayer." },
          { status: 500 }
        );
      }
    } else {
      console.log("[Waitlist] (mode démo) inscription reçue:", { itemType, itemId, itemTitle, name, email, phone });
    }

    await notifyWaitlistSignup({ title: itemTitle, itemType, name, email });

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err: any) {
    console.error("[Waitlist] Exception:", err);
    return NextResponse.json({ error: "Erreur interne du serveur." }, { status: 500 });
  }
}

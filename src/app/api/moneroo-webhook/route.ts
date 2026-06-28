import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// Secret webhook key provided by Moneroo to verify origin authenticity
const MONEROO_WEBHOOK_SECRET = process.env.MONEROO_WEBHOOK_SECRET || "default_local_secret";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("moneroo-signature") || "";

    // 1. Signature Verification (Recommended for security)
    if (MONEROO_WEBHOOK_SECRET !== "default_local_secret") {
      const hmac = crypto.createHmac("sha256", MONEROO_WEBHOOK_SECRET);
      const computedSignature = hmac.update(bodyText).digest("hex");
      
      if (computedSignature !== signature) {
        return NextResponse.json(
          { error: "Signature de webhook invalide" },
          { status: 401 }
        );
      }
    }

    const payload = JSON.parse(bodyText);
    const { event, data } = payload;

    console.log(`[Moneroo Webhook] Événement reçu: ${event}`, data);

    // 2. Process Successful Payment Event
    if (event === "payment.success") {
      const transactionId = data.id;
      const amount = data.amount;
      const currency = data.currency;
      const customerEmail = data.customer?.email;
      
      // Retrieve custom metadata sent during checkout creation
      const courseId = data.metadata?.course_id;
      const userId = data.metadata?.user_id;

      if (!courseId || !customerEmail) {
        return NextResponse.json(
          { error: "Métadonnées de transaction manquantes (course_id ou email)" },
          { status: 400 }
        );
      }

      // 3. Grant access to the course in Supabase database
      const { error: purchaseError } = await supabase
        .from("purchases")
        .insert({
          user_id: userId || null,
          email: customerEmail,
          course_id: courseId,
          amount_paid: amount,
          currency: currency,
          transaction_id: transactionId,
          status: "completed",
          created_at: new Date().toISOString()
        });

      if (purchaseError) {
        console.error("[Moneroo Webhook] Erreur lors de l'enregistrement Supabase:", purchaseError);
        return NextResponse.json(
          { error: "Échec de l'enregistrement de l'achat" },
          { status: 500 }
        );
      }

      console.log(`[Moneroo Webhook] Accès accordé pour le cours ${courseId} à l'utilisateur ${customerEmail}`);
    }

    // Acknowledge receipt of webhook with a 200 OK
    return NextResponse.json({ received: true }, { status: 200 });

  } catch (err: any) {
    console.error("[Moneroo Webhook] Exception détectée:", err);
    return NextResponse.json(
      { error: "Erreur interne du serveur", details: err.message },
      { status: 500 }
    );
  }
}

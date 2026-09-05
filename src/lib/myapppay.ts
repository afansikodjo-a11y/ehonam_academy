import { createHmac, timingSafeEqual } from "node:crypto";
import type { MyappPayMethods } from "@/lib/payment-methods";

// ──────────────────────────────────────────────────────────────
// Processeur de paiement myapp-pay (remplace Moneroo).
// Doc : https://www.myapp-pay.com/docs
// ──────────────────────────────────────────────────────────────

export const MYAPP_PAY_BASE_URL = "https://www.myapp-pay.com/api/v1";
export const MYAPP_PAY_SECRET = process.env.MYAPP_PAY_SECRET_KEY || "";
export const MYAPP_PAY_WEBHOOK_SECRET = process.env.MYAPP_PAY_WEBHOOK_SECRET || "";

// Secours uniquement : utilisé si le client ne précise pas de méthode (ancien
// cache) ou si GET /payment-methods est indisponible. En temps normal, le
// client choisit son pays/méthode dans <CheckoutModal> parmi les moyens
// réellement actifs (voir fetchMyappPayMethods ci-dessous).
export const MYAPP_PAY_METHOD = process.env.MYAPP_PAY_METHOD || "mtn_ci";
export const MYAPP_PAY_COUNTRY = process.env.MYAPP_PAY_COUNTRY || "CI";

/** Un paiement est considéré payé uniquement dans cet état (doc "Référence des statuts"). */
export const MYAPP_PAY_SUCCESS_STATUS = "success";

/**
 * Vérifie la signature HMAC-SHA256 d'un webhook myapp-pay.
 * En-tête attendu : "t=<timestamp unix>,v1=<hex>", calculé sur `${timestamp}.${rawBody}`.
 * Portage direct de l'exemple Node.js fourni par la documentation.
 */
export function verifyMyappPaySignature(
  secret: string,
  rawBody: string,
  header: string,
  toleranceSeconds = 300
): boolean {
  if (!secret || !header) return false;
  try {
    const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
    const timestamp = Number(parts.t);
    if (!timestamp || Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

    const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`, "utf8").digest("hex");

    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(parts.v1 || "", "hex");
    return a.length === b.length && timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export interface MyappPayPayment {
  id: string;
  status: string;
  method?: string;
  amount?: number;
  amountGross?: string;
  amountNet?: string;
  currency?: string;
  checkoutUrl?: string;
  description?: string;
  createdAt?: string;
  paidAt?: string | null;
  failureReason?: string | null;
}

/** GET /payments/:id — revérification serveur-à-serveur (jamais confiance au seul webhook/retour navigateur). */
export async function fetchMyappPayPayment(paymentId: string): Promise<MyappPayPayment | null> {
  const res = await fetch(`${MYAPP_PAY_BASE_URL}/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${MYAPP_PAY_SECRET}`, Accept: "application/json" },
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

/** GET /payment-methods — moyens de paiement réellement actifs sur le compte (par pays) + carte. */
export async function fetchMyappPayMethods(): Promise<MyappPayMethods | null> {
  try {
    const res = await fetch(`${MYAPP_PAY_BASE_URL}/payment-methods`, {
      headers: { Authorization: `Bearer ${MYAPP_PAY_SECRET}`, Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

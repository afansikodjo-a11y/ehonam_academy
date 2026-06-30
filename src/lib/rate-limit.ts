// ──────────────────────────────────────────────────────────────
// Rate limiting (côté serveur) basé sur Upstash Redis.
// Compatible Vercel KV / Marketplace (variables UPSTASH_* ou KV_*).
// Dégradation propre : si Redis n'est PAS configuré, on n'impose rien
// (le service continue de fonctionner). Idéal avant provisionnement.
// ──────────────────────────────────────────────────────────────

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

const redis = url && token ? new Redis({ url, token }) : null;

// Limites par usage (fenêtre glissante).
const limiters = redis
  ? {
      // Formulaire de contact : non authentifié → on serre la vis.
      contact: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "10 m"), prefix: "rl:contact", analytics: false }),
      // Initialisation de paiement (appelle Moneroo).
      checkout: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "10 m"), prefix: "rl:checkout", analytics: false }),
      // Confirmation au retour (appelle Moneroo verify).
      confirm: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "10 m"), prefix: "rl:confirm", analytics: false }),
    }
  : null;

export type RateLimitKind = "contact" | "checkout" | "confirm";

/** true = autorisé. No-op (autorise) si Redis non configuré ou en cas d'erreur. */
export async function checkRateLimit(kind: RateLimitKind, identifier: string): Promise<boolean> {
  if (!limiters) return true; // non configuré → on n'impose rien
  try {
    const { success } = await limiters[kind].limit(identifier);
    return success;
  } catch {
    // En cas d'erreur Redis, on ne bloque pas le service légitime.
    return true;
  }
}

/** Extrait une IP de la requête (best-effort, derrière proxy Vercel). */
export function clientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "anon";
}

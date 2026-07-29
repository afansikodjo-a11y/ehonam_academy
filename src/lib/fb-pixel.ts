import { getAttribution, getOrCreateVisitorId } from "@/lib/attribution";

// Petit helper pour envoyer des évènements au Pixel Facebook (suivi des
// campagnes Ads). Ne fait rien si le pixel n'est pas configuré/chargé.
// Journalise aussi l'évènement en interne (Supabase) pour le tableau de
// bord /admin/campagnes, tagué avec l'attribution UTM/fbclid de la session.
export function trackFbEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);

  // keepalive : certains évènements (ex. AddPaymentInfo) sont immédiatement
  // suivis d'une redirection window.location.href vers Moneroo — sans
  // keepalive, la requête serait annulée avant d'atteindre le serveur.
  fetch("/api/pixel-events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify({
      event_name: event,
      ...params,
      ...getAttribution(),
      path: window.location.pathname,
      visitor_id: getOrCreateVisitorId(),
    }),
  }).catch(() => {});
}

/** "35 000 FCFA" → 35000. Utilisé pour renseigner "value" dans les évènements. */
export function parsePriceFCFA(price: string): number {
  const digits = (price || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

// Petit helper pour envoyer des évènements au Pixel Facebook (suivi des
// campagnes Ads). Ne fait rien si le pixel n'est pas configuré/chargé.
export function trackFbEvent(event: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const fbq = (window as unknown as { fbq?: (...args: unknown[]) => void }).fbq;
  if (typeof fbq === "function") fbq("track", event, params);
}

/** "35 000 FCFA" → 35000. Utilisé pour renseigner "value" dans les évènements. */
export function parsePriceFCFA(price: string): number {
  const digits = (price || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

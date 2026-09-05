// ──────────────────────────────────────────────────────────────
// Type + libellés d'affichage pour les moyens de paiement myapp-pay.
// Fichier "client-safe" (aucune dépendance serveur) : importable depuis
// un composant "use client" comme depuis une route API.
// ──────────────────────────────────────────────────────────────

export interface MyappPayMethods {
  /** true si au moins un provider carte est actif (valable pour tout pays). */
  card: boolean;
  /** Pays (ISO 3166-1 alpha-2) → liste des méthodes Mobile Money actives. */
  countries: Record<string, string[]>;
}

export const COUNTRY_NAMES: Record<string, string> = {
  BJ: "Bénin",
  BF: "Burkina Faso",
  CI: "Côte d'Ivoire",
  CM: "Cameroun",
  GN: "Guinée",
  ML: "Mali",
  NE: "Niger",
  SN: "Sénégal",
  TG: "Togo",
};

const METHOD_LABELS: Record<string, string> = {
  mtn_ci: "MTN Mobile Money",
  moov_ci: "Moov Money",
  mtn_open: "MTN Mobile Money",
  moov: "Moov Money",
  sbin: "SBIN",
  mtn_open_gn: "MTN Mobile Money",
  airtel_ne: "Airtel Money",
  moov_tg: "Moov Money",
  togocel: "T-Money (Togocel)",
  moov_burkina: "Moov Money",
  mtn_cameroun: "MTN Mobile Money",
  orange_money_mali: "Orange Money",
  moov_mali: "Moov Money",
  free_money_sn: "Free Money",
  expresso_sn: "Expresso Money",
};

export function countryLabel(code: string): string {
  return COUNTRY_NAMES[code] || code;
}

export function methodLabel(code: string): string {
  if (METHOD_LABELS[code]) return METHOD_LABELS[code];
  return code
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

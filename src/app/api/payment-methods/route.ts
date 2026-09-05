import { NextResponse } from "next/server";
import { fetchMyappPayMethods } from "@/lib/myapppay";

// Liste publique (aucune donnée sensible) des moyens de paiement actifs sur le
// compte myapp-pay — sert à construire le sélecteur pays/méthode côté client.
// Petit cache mémoire pour éviter d'appeler myapp-pay à chaque ouverture de
// la modale de paiement.
let cache: { data: unknown; expiresAt: number } | null = null;
const CACHE_MS = 5 * 60 * 1000;

export async function GET() {
  if (cache && cache.expiresAt > Date.now()) {
    return NextResponse.json(cache.data);
  }

  const methods = await fetchMyappPayMethods();
  if (!methods) {
    return NextResponse.json({ error: "Indisponible pour le moment." }, { status: 503 });
  }

  cache = { data: methods, expiresAt: Date.now() + CACHE_MS };
  return NextResponse.json(methods);
}

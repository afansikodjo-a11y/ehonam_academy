"use client";

import { useEffect } from "react";
import { captureAttributionFromUrl } from "@/lib/attribution";

/**
 * Capture les paramètres UTM/fbclid de l'URL d'arrivée (first-touch) pour
 * qu'ils accompagnent chaque évènement pixel envoyé pendant la session —
 * voir trackFbEvent (src/lib/fb-pixel.ts) et /admin/campagnes.
 */
export default function AttributionCapture() {
  useEffect(() => {
    captureAttributionFromUrl();
  }, []);

  return null;
}

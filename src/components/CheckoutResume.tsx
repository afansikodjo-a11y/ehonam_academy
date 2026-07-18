"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { takePendingCheckout } from "@/lib/pending-checkout";

/**
 * Filet de sécurité pour le retour d'une connexion Google lancée depuis
 * CheckoutModal. Si Supabase renvoie l'utilisateur ailleurs que sur la page
 * d'origine (URL de retour non déclarée dans sa liste blanche, etc.), on
 * détecte quand même la session active et on le renvoie terminer son achat.
 */
export default function CheckoutResume() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const pending = takePendingCheckout();
    if (!pending) return;
    // Déjà sur la bonne page : elle gère elle-même son propre ?checkout=1.
    if (pathname === pending.returnPath) return;

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace(`${pending.returnPath}?checkout=1`);
      }
    });
  }, [pathname, router]);

  return null;
}

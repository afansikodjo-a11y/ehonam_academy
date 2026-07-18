"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isCurrentUserAdmin } from "@/lib/auth";
import { takeAwaitingLoginRedirect } from "@/lib/pending-login-redirect";

/**
 * Filet de sécurité pour le retour d'une connexion Google lancée depuis
 * /login. Si Supabase ignore l'URL de retour demandée (liste blanche non à
 * jour, changement de domaine…) et renvoie l'utilisateur ailleurs — par ex.
 * la page d'accueil — on détecte quand même la session active et on
 * l'envoie sur la bonne page selon son rôle (dashboard admin / mon espace).
 */
export default function AuthLandingResume() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!takeAwaitingLoginRedirect()) return;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return;
      const dest = (await isCurrentUserAdmin()) ? "/admin/dashboard" : "/mon-espace";
      if (pathname !== dest) router.replace(dest);
    });
  }, [pathname, router]);

  return null;
}

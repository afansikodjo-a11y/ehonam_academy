"use client";

import { useEffect, useState } from "react";
import { Shield, Loader2, AlertCircle, CreditCard, Mail, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { type ItemType } from "@/lib/purchases-db";
import GoogleIcon from "@/components/GoogleIcon";
import { setPendingCheckout } from "@/lib/pending-checkout";

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  itemTitle: string;
  price: string;
  itemType: ItemType;
  itemId: string;
  /** Unused now (success is handled on return from Moneroo) — kept for compatibility. */
  successMessage?: string;
}

const inputClass =
  "w-full rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/60 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition-colors";

type Phase = "checking" | "auth" | "confirm-email" | "processing" | "error";

/**
 * Achat en un seul tunnel : si l'utilisateur n'est pas connecté, la modale crée son
 * compte (ou le connecte) sur place, puis initie immédiatement le paiement Moneroo —
 * sans jamais renvoyer vers une page de connexion séparée.
 */
export default function CheckoutModal({ open, onClose, itemTitle, price, itemType, itemId }: CheckoutModalProps) {
  const [phase, setPhase] = useState<Phase>("checking");
  const [authMode, setAuthMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const initiateCheckout = async (accessToken: string) => {
    setPhase("processing");
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ itemType, itemId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data.error || "Le paiement n'a pas pu être initié.");
      }
      // Mémorise l'ID du paiement pour le confirmer au retour (filet de
      // sécurité indépendant du webhook).
      if (data.paymentId) {
        try {
          localStorage.setItem("ea_pending_payment", String(data.paymentId));
        } catch {}
      }
      window.location.href = data.checkoutUrl; // → page de paiement Moneroo
    } catch (e: any) {
      setError(e.message || "Le paiement n'a pas pu être initié.");
      setPhase("error");
    }
  };

  useEffect(() => {
    if (!open) return;
    setError("");
    setEmail("");
    setPassword("");
    setAuthMode("signup");
    setPhase("checking");
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (data.session) {
        initiateCheckout(data.session.access_token);
      } else {
        setPhase("auth");
      }
    });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError("");

    if (authMode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setAuthLoading(false);
        setError(signUpError.message || "Inscription impossible.");
        return;
      }
      if (data.session) {
        setAuthLoading(false);
        await initiateCheckout(data.session.access_token);
        return;
      }
      // Pas de session ni d'erreur : soit un nouveau compte en attente de
      // confirmation par email, soit un email déjà enregistré (Supabase ne fait
      // pas la différence pour éviter l'énumération de comptes). On tente une
      // connexion silencieuse avec les mêmes identifiants pour couvrir ce cas.
      const { data: signInData } = await supabase.auth.signInWithPassword({ email, password });
      setAuthLoading(false);
      if (signInData.session) {
        await initiateCheckout(signInData.session.access_token);
        return;
      }
      setPhase("confirm-email");
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setAuthLoading(false);
    if (signInError || !data.session) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    await initiateCheckout(data.session.access_token);
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    // On revient sur la page courante avec ?checkout=1 pour rouvrir la modale et
    // reprendre le paiement automatiquement une fois la session Google active.
    // On mémorise aussi l'achat en cours : si Supabase ignore l'URL de retour
    // demandée (ex. non déclarée dans sa liste blanche) et renvoie l'utilisateur
    // ailleurs, <CheckoutResume> saura quand même où reprendre le paiement.
    setPendingCheckout({ itemType, itemId, returnPath: window.location.pathname });
    const redirectTo = `${window.location.origin}${window.location.pathname}?checkout=1`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
    if (oauthError) {
      setGoogleLoading(false);
      setError("Connexion avec Google impossible pour le moment.");
    }
  };

  if (!open) return null;

  const isSignup = authMode === "signup";

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl border-white/10 overflow-hidden shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-orange-500 via-emerald-500 to-teal-500"></div>

        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-black text-white">PAIEMENT SÉCURISÉ</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xs font-bold px-2 py-1 rounded bg-white/5"
          >
            Fermer
          </button>
        </div>

        <div className="px-6 pt-5 text-center">
          <span className="text-xs text-gray-500">Montant</span>
          <h3 className="text-2xl font-black text-white mt-1">{price}</h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{itemTitle}</p>
        </div>

        {phase === "checking" && (
          <div className="p-10 text-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
          </div>
        )}

        {phase === "processing" && (
          <div className="p-10 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-emerald-400 animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="text-md font-bold text-white flex items-center justify-center gap-2">
                <CreditCard className="w-4 h-4" />
                Redirection vers le paiement…
              </h4>
              <p className="text-xs text-gray-400">
                Vous allez être redirigé vers la page sécurisée Moneroo (Carte / Mobile Money).
              </p>
            </div>
          </div>
        )}

        {phase === "confirm-email" && (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Mail className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-300">
              Si c'est un nouveau compte : vérifiez votre email pour le confirmer, puis revenez ici pour payer.
              <br className="hidden sm:block" />
              Si vous avez déjà un compte : le mot de passe saisi ne correspond pas.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  setAuthMode("login");
                  setError("");
                  setPhase("auth");
                }}
                className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
              >
                J'ai déjà un compte
              </button>
              <button
                onClick={onClose}
                className="px-6 py-3 rounded-xl font-bold text-gray-300 bg-white/5 border border-white/10 text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {phase === "error" && (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-rose-500/15 flex items-center justify-center mx-auto border border-rose-500/30">
              <AlertCircle className="w-7 h-7 text-rose-400" />
            </div>
            <p className="text-sm text-gray-300">{error}</p>
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
            >
              Réessayer plus tard
            </button>
          </div>
        )}

        {phase === "auth" && (
          <div className="p-6 space-y-4">
            <p className="text-xs text-gray-400 text-center">
              {isSignup
                ? "Créez votre compte pour finaliser votre achat — ça prend 10 secondes."
                : "Connectez-vous pour finaliser votre achat."}
            </p>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full py-3 rounded-xl font-semibold text-gray-800 bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center gap-2.5 shadow-sm transition-colors disabled:opacity-70"
            >
              {googleLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-500" /> : <GoogleIcon />}
              Continuer avec Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-white/10"></div>
              <span className="text-xs text-gray-500">ou</span>
              <div className="h-px flex-1 bg-white/10"></div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vous@email.com"
                  className={inputClass}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> Mot de passe
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isSignup ? "Au moins 6 caractères" : "••••••••"}
                  className={inputClass}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
              >
                {authLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignup ? "Création…" : "Connexion…"}
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    {isSignup ? "Créer mon compte et payer" : "Me connecter et payer"}
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400">
              {isSignup ? "Déjà un compte ? " : "Pas encore de compte ? "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode(isSignup ? "login" : "signup");
                  setError("");
                }}
                className="font-semibold text-emerald-400 hover:text-emerald-300"
              >
                {isSignup ? "Se connecter" : "Créer un compte"}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

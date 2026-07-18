"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, LogIn, AlertCircle, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import GoogleIcon from "@/components/GoogleIcon";

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Route by role after a successful auth: admin → dashboard, student → space.
  const completeLogin = async () => {
    router.replace((await isCurrentUserAdmin()) ? "/admin" : "/mon-espace");
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    // Surface OAuth/redirect errors returned in the URL.
    const hash = window.location.hash.replace(/^#/, "");
    const search = window.location.search.replace(/^\?/, "");
    const params = new URLSearchParams(hash || search);
    if (params.get("error")) {
      setError("Connexion impossible : " + (params.get("error_description") || "accès refusé") + ".");
      window.history.replaceState({}, "", window.location.pathname);
    }

    let active = true;
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (active && event === "SIGNED_IN" && session) completeLogin();
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setInfo("");

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setLoading(false);
        setError(error.message || "Inscription impossible.");
        return;
      }
      if (!data.session) {
        // Email confirmation required.
        setLoading(false);
        setInfo("Compte créé ! Vérifiez votre email pour confirmer, puis connectez-vous.");
        setMode("login");
        return;
      }
      await completeLogin();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }
    await completeLogin();
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/login` },
    });
    if (error) {
      setGoogleLoading(false);
      setError("Connexion avec Google impossible pour le moment.");
    }
  };

  const isSignup = mode === "signup";

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-20">
      <div className="glass-panel p-8 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn"></div>

        <div className="flex items-center justify-center gap-2 mb-2">
          <LogIn className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
            {isSignup ? "Inscription" : "Connexion"}
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1 text-center">
          {isSignup ? "Créer votre compte" : "Connectez-vous à votre compte"}
        </h1>
        <p className="text-sm text-gray-400 mb-6 text-center">
          {isSignup ? "Accédez à vos formations et accompagnements." : "Un seul accès, quel que soit votre type de compte."}
        </p>

        {!isSupabaseConfigured ? (
          <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Supabase n'est pas configuré. Renseigne <code className="font-mono">.env.local</code> puis redémarre le serveur.
            </span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Google */}
            <button
              type="button"
              onClick={handleGoogle}
              disabled={googleLoading}
              className="w-full py-3 rounded-xl font-semibold text-gray-800 bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center gap-2.5 shadow-sm transition-colors disabled:opacity-70"
            >
              {googleLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
              ) : (
                <GoogleIcon />
              )}
              Continuer avec Google
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-200 dark:bg-white/10"></div>
              <span className="text-xs text-gray-500">ou</span>
              <div className="h-px flex-1 bg-gray-200 dark:bg-white/10"></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              {!isSignup && (
                <div className="flex justify-end -mt-1">
                  <Link href="/mot-de-passe-oublie" className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                    Mot de passe oublié ?
                  </Link>
                </div>
              )}

              {info && (
                <div className="flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                  <Check className="w-4 h-4 shrink-0" />
                  {info}
                </div>
              )}
              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {isSignup ? "Création…" : "Connexion…"}
                  </>
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    {isSignup ? "Créer mon compte" : "Se connecter"}
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400">
              {isSignup ? "Déjà un compte ? " : "Pas encore de compte ? "}
              <button
                type="button"
                onClick={() => {
                  setMode(isSignup ? "login" : "signup");
                  setError("");
                  setInfo("");
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

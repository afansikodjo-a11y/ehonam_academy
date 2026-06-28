"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Loader2, Check, AlertCircle, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { destinationAfterLogin } from "@/lib/auth";

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [hasRecovery, setHasRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // The Supabase client auto-processes the recovery token in the URL hash and
  // fires PASSWORD_RECOVERY / establishes a session. Wait for it (max 4s).
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecking(false);
      return;
    }
    let settled = false;
    const finish = (ok: boolean) => {
      if (!settled) {
        settled = true;
        setHasRecovery(ok);
        setChecking(false);
      }
    };
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) finish(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) finish(true);
    });
    const timer = setTimeout(() => finish(false), 4000);
    return () => {
      clearTimeout(timer);
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError(error.message || "Échec de la mise à jour.");
      return;
    }
    setDone(true);
  };

  const goToSpace = async () => {
    router.replace(await destinationAfterLogin());
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="glass-panel p-8 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn"></div>

        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Nouveau mot de passe</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-6">Choisir un nouveau mot de passe</h1>

        {checking ? (
          <div className="py-8 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : done ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-300">Votre mot de passe a bien été mis à jour.</p>
            <button
              onClick={goToSpace}
              className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
            >
              Continuer
            </button>
          </div>
        ) : !hasRecovery ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Lien invalide ou expiré. Demandez un nouveau lien de réinitialisation.</span>
            </div>
            <Link
              href="/mot-de-passe-oublie"
              className="inline-block px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
            >
              Renvoyer un lien
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Nouveau mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Confirmer le mot de passe
              </label>
              <input
                type="password"
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
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
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mise à jour…
                </>
              ) : (
                "Mettre à jour le mot de passe"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

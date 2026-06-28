"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, Mail, Loader2, LogIn, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { destinationAfterLogin } from "@/lib/auth";

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Already signed in → route by role.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(async ({ data }) => {
      if (data.session) router.replace(await destinationAfterLogin());
    });
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.replace(await destinationAfterLogin());
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <div className="glass-panel p-8 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn"></div>

        <div className="flex items-center gap-2 mb-2">
          <LogIn className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Connexion</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Connectez-vous à votre compte</h1>
        <p className="text-sm text-gray-400 mb-6">Un seul accès, quel que soit votre type de compte.</p>

        {!isSupabaseConfigured ? (
          <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Supabase n'est pas configuré. Renseigne <code className="font-mono">.env.local</code> puis redémarre le serveur.
            </span>
          </div>
        ) : (
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
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <div className="flex justify-end -mt-1">
              <Link
                href="/mot-de-passe-oublie"
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
              >
                Mot de passe oublié ?
              </Link>
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
                  Connexion…
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

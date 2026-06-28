"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, Check, AlertCircle, KeyRound } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      setError("Impossible d'envoyer l'email. Réessayez dans un instant.");
      return;
    }
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour à la connexion
      </Link>

      <div className="glass-panel p-8 rounded-3xl border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn"></div>

        <div className="flex items-center gap-2 mb-2">
          <KeyRound className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Mot de passe oublié</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white mb-1">Réinitialiser le mot de passe</h1>
        <p className="text-sm text-gray-400 mb-6">
          Saisissez votre email : nous vous enverrons un lien pour en choisir un nouveau.
        </p>

        {!isSupabaseConfigured ? (
          <div className="flex items-start gap-2 text-sm text-amber-300 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>Supabase n'est pas configuré.</span>
          </div>
        ) : sent ? (
          <div className="py-4 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto border border-emerald-500/30">
              <Check className="w-7 h-7 text-emerald-400" />
            </div>
            <p className="text-sm text-gray-300">
              Si un compte existe pour <span className="text-white font-semibold">{email}</span>, un lien de
              réinitialisation vient d'être envoyé. Pensez à vérifier vos spams.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md text-sm"
            >
              Retour à la connexion
            </Link>
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
                  Envoi…
                </>
              ) : (
                "Envoyer le lien"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

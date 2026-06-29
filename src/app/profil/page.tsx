"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Lock,
  Loader2,
  Save,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";

type Flash = { type: "ok" | "error"; text: string } | null;

const inputClass =
  "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors";
const labelClass = "flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2";

function initials(name: string, email: string): string {
  const base = name.trim() || email.trim();
  if (!base) return "?";
  const parts = base.split(/[\s@.]+/).filter(Boolean);
  return (parts[0]?.[0] || "" + (parts[1]?.[0] || "")).slice(0, 2).toUpperCase() || base[0].toUpperCase();
}

export default function ProfilePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState<Flash>(null);

  const [pwd, setPwd] = useState("");
  const [pwd2, setPwd2] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<Flash>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) {
        router.replace("/login");
        return;
      }
      const m = (u.user_metadata || {}) as Record<string, string>;
      setEmail(u.email || "");
      setFullName(m.full_name || m.name || "");
      setPhone(m.phone || "");
      setAvatarUrl(m.avatar_url || m.picture || "");
      setReady(true);
    });
  }, [router]);

  const saveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingInfo(true);
    setInfoMsg(null);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName.trim(), phone: phone.trim() },
    });
    setSavingInfo(false);
    setInfoMsg(
      error
        ? { type: "error", text: error.message || "La mise à jour a échoué." }
        : { type: "ok", text: "Vos informations ont été enregistrées." }
    );
  };

  const savePwd = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);
    if (pwd.length < 6) {
      setPwdMsg({ type: "error", text: "Le mot de passe doit contenir au moins 6 caractères." });
      return;
    }
    if (pwd !== pwd2) {
      setPwdMsg({ type: "error", text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setSavingPwd(true);
    const { error } = await supabase.auth.updateUser({ password: pwd });
    setSavingPwd(false);
    if (error) {
      setPwdMsg({ type: "error", text: error.message || "La modification a échoué." });
    } else {
      setPwd("");
      setPwd2("");
      setPwdMsg({ type: "ok", text: "Votre mot de passe a été modifié." });
    }
  };

  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-400">
        Supabase n'est pas configuré.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <Link
        href="/mon-espace"
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Mon espace
      </Link>

      <div className="flex items-center gap-4 mb-10">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border border-white/10"
          />
        ) : (
          <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center text-xl font-black text-white">
            {initials(fullName, email)}
          </div>
        )}
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-4 h-4" />
            Mon profil
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-0.5">
            {fullName || "Votre profil"}
          </h1>
        </div>
      </div>

      {/* Informations personnelles */}
      <form onSubmit={saveInfo} className="glass-panel rounded-3xl border-white/5 p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-white mb-1">Informations personnelles</h2>
        <p className="text-sm text-gray-400 mb-6">Modifiez votre nom et votre numéro de téléphone.</p>

        <div className="space-y-5">
          <div>
            <label className={labelClass}>
              <User className="w-3.5 h-3.5" /> Nom complet
            </label>
            <input
              className={inputClass}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex : Ehonam AFANSI"
              autoComplete="name"
            />
          </div>

          <div>
            <label className={labelClass}>
              <Phone className="w-3.5 h-3.5" /> Téléphone
            </label>
            <input
              className={inputClass}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex : +228 91 28 25 90"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          <div>
            <label className={labelClass}>
              <Mail className="w-3.5 h-3.5" /> Adresse e-mail
            </label>
            <input
              className={`${inputClass} opacity-60 cursor-not-allowed`}
              value={email}
              disabled
              readOnly
            />
            <p className="text-xs text-gray-500 mt-1.5">L'adresse e-mail ne peut pas être modifiée ici.</p>
          </div>
        </div>

        {infoMsg && (
          <div
            className={`mt-5 flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${
              infoMsg.type === "ok"
                ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                : "text-rose-300 bg-rose-500/10 border border-rose-500/20"
            }`}
          >
            {infoMsg.type === "ok" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span>{infoMsg.text}</span>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={savingInfo}
            className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2 disabled:opacity-60"
          >
            {savingInfo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Enregistrer
          </button>
        </div>
      </form>

      {/* Sécurité */}
      <form onSubmit={savePwd} className="glass-panel rounded-3xl border-white/5 p-6 sm:p-8">
        <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-1">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          Sécurité
        </h2>
        <p className="text-sm text-gray-400 mb-6">Définissez un nouveau mot de passe pour votre compte.</p>

        <div className="space-y-5">
          <div>
            <label className={labelClass}>
              <Lock className="w-3.5 h-3.5" /> Nouveau mot de passe
            </label>
            <input
              type="password"
              className={inputClass}
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Au moins 6 caractères"
              autoComplete="new-password"
            />
          </div>

          <div>
            <label className={labelClass}>
              <Lock className="w-3.5 h-3.5" /> Confirmer le mot de passe
            </label>
            <input
              type="password"
              className={inputClass}
              value={pwd2}
              onChange={(e) => setPwd2(e.target.value)}
              placeholder="Retapez le mot de passe"
              autoComplete="new-password"
            />
          </div>
        </div>

        {pwdMsg && (
          <div
            className={`mt-5 flex items-start gap-2 text-sm rounded-xl px-4 py-3 ${
              pwdMsg.type === "ok"
                ? "text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                : "text-rose-300 bg-rose-500/10 border border-rose-500/20"
            }`}
          >
            {pwdMsg.type === "ok" ? (
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            )}
            <span>{pwdMsg.text}</span>
          </div>
        )}

        <div className="mt-6">
          <button
            type="submit"
            disabled={savingPwd}
            className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2 disabled:opacity-60"
          >
            {savingPwd ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
            Modifier le mot de passe
          </button>
        </div>
      </form>
    </div>
  );
}

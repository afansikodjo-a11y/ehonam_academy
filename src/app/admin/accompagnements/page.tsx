"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Plus, Pencil, Trash2, LogOut, Sparkles, Eye, EyeOff,
  Loader2, AlertCircle, X, Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  fetchAllCoaching, upsertCoaching, deleteCoaching,
  type AdminCoachingOffer,
} from "@/lib/coaching-db";
import { isSupabaseConfigured } from "@/lib/courses-db";
import AdminTabs from "@/components/AdminTabs";
import { isCurrentUserAdmin } from "@/lib/auth";

const COLORS: Record<string, string> = {
  Vert: "from-emerald-600/20 to-teal-600/20",
  Orange: "from-orange-600/20 to-amber-600/20",
  "Bleu-vert": "from-teal-600/20 to-emerald-600/20",
};

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-widest";

function freshForm() {
  return {
    id: "",
    title: "",
    tagline: "",
    description: "",
    price: "",
    priceNumeric: 0,
    format: "",
    colorKey: "Vert",
    popular: false,
    published: true,
    highlights: [""] as string[],
  };
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminCoachingPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<AdminCoachingOffer[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  const [form, setForm] = useState(freshForm());
  const [editing, setEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      if (!(await isCurrentUserAdmin())) {
        router.replace("/");
        return;
      }
      setAuthed(true);
      setReady(true);
      load();
    });
  }, [router]);

  const load = async () => {
    setLoadingList(true);
    setList(await fetchAllCoaching());
    setLoadingList(false);
  };

  const startNew = () => {
    setForm(freshForm());
    setEditing(false);
    setError("");
    setShowForm(true);
  };

  const startEdit = (o: AdminCoachingOffer) => {
    const colorKey = Object.keys(COLORS).find((k) => COLORS[k] === o.gradient) ?? "Vert";
    setForm({
      id: o.id,
      title: o.title,
      tagline: o.tagline,
      description: o.description,
      price: o.price,
      priceNumeric: o.priceNumeric,
      format: o.format,
      colorKey,
      popular: !!o.popular,
      published: o.published,
      highlights: o.highlights.length ? [...o.highlights] : [""],
    });
    setEditing(true);
    setError("");
    setShowForm(true);
  };

  // ─── Highlights editor ────────────────────────────────────
  const setHighlights = (highlights: string[]) => setForm((f) => ({ ...f, highlights }));
  const addHighlight = () => setHighlights([...form.highlights, ""]);
  const removeHighlight = (i: number) => setHighlights(form.highlights.filter((_, j) => j !== i));
  const setHighlight = (i: number, value: string) =>
    setHighlights(form.highlights.map((h, j) => (j === i ? value : h)));

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    const highlights = form.highlights.map((h) => h.trim()).filter((h) => h !== "");
    const id = (form.id || slugify(form.title)).trim();

    const offer: AdminCoachingOffer = {
      id,
      title: form.title.trim(),
      tagline: form.tagline.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      priceNumeric: Number(form.priceNumeric) || 0,
      format: form.format.trim(),
      highlights,
      popular: form.popular,
      gradient: COLORS[form.colorKey] ?? COLORS.Vert,
      published: form.published,
    };

    setSaving(true);
    const err = await upsertCoaching(offer);
    setSaving(false);
    if (err) {
      setError(err.message || "Échec de l'enregistrement.");
      return;
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (o: AdminCoachingOffer) => {
    if (!confirm(`Supprimer définitivement « ${o.title} » ?`)) return;
    const err = await deleteCoaching(o.id);
    if (!err) load();
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  // ─── Guards ───────────────────────────────────────────────
  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:py-20 text-center text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
      </div>
    );
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-20">
        <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-3">
          <div className="flex items-center gap-2 text-amber-300">
            <AlertCircle className="w-5 h-5" />
            <h1 className="text-lg font-bold">Supabase non configuré</h1>
          </div>
          <p className="text-sm text-gray-400">
            Renseigne <code className="font-mono text-white">.env.local</code>, exécute{" "}
            <code className="font-mono text-white">supabase/schema.sql</code>, puis redémarre le serveur.
          </p>
        </div>
      </div>
    );
  }

  if (!authed) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminTabs />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Espace Formateur
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Gestion des accompagnements</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startNew}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white gradient-btn flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouvel accompagnement
          </button>
          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 flex items-center gap-2 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </div>

      {/* List */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Offres {loadingList ? "" : `(${list.length})`}
          </h2>
        </div>

        {loadingList ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Aucun accompagnement. Clique sur « Nouvel accompagnement ».
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map((o) => (
              <div key={o.id} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-sm font-bold text-white truncate">{o.title}</h3>
                    {o.popular && (
                      <span className="text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full shrink-0">
                        Populaire
                      </span>
                    )}
                    {o.published ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                        <Eye className="w-3 h-3" /> Publié
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full shrink-0">
                        <EyeOff className="w-3 h-3" /> Brouillon
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {o.format || "—"} · {o.price || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(o)}
                    className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                    aria-label="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(o)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                    aria-label="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between shrink-0">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Modifier l'accompagnement" : "Nouvel accompagnement"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col min-h-0 flex-1">
              <div className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="space-y-1.5">
                <label className={labelClass}>Titre *</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex : Mentorat Trading & Forex"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Accroche (tagline)</label>
                <input
                  className={inputClass}
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  placeholder="Trader avec rigueur et méthode"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  className={`${inputClass} resize-y`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="En quoi consiste l'accompagnement…"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Prix affiché</label>
                  <input
                    className={inputClass}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="120 000 FCFA"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Prix (chiffre)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.priceNumeric}
                    onChange={(e) => setForm({ ...form, priceNumeric: Number(e.target.value) })}
                    placeholder="120000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Couleur</label>
                  <select
                    className={inputClass}
                    value={form.colorKey}
                    onChange={(e) => setForm({ ...form, colorKey: e.target.value })}
                  >
                    {Object.keys(COLORS).map((k) => (
                      <option key={k} value={k}>{k}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Format</label>
                <input
                  className={inputClass}
                  value={form.format}
                  onChange={(e) => setForm({ ...form, format: e.target.value })}
                  placeholder="Visio 1-on-1 · 8 séances · 2 mois"
                />
              </div>

              {/* Highlights editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Points clés (inclus)</label>
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un point
                  </button>
                </div>
                <div className="space-y-2">
                  {form.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        className={inputClass}
                        value={h}
                        onChange={(e) => setHighlight(i, e.target.value)}
                        placeholder={`Point clé ${i + 1}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeHighlight(i)}
                        className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                        aria-label="Supprimer le point"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.popular}
                    onChange={(e) => setForm({ ...form, popular: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  Mettre en avant (« Le plus demandé »)
                </label>
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  Publier
                </label>
              </div>

              </div>

              <div className="px-6 py-4 border-t border-white/10 shrink-0 space-y-3 rounded-b-3xl">
                {error && (
                  <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}
                <div className="flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold text-white gradient-btn flex items-center gap-2 shadow-md disabled:opacity-70"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    {editing ? "Enregistrer" : "Créer"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Plus, Pencil, Trash2, LogOut, Newspaper, Eye, EyeOff, Clock,
  Loader2, AlertCircle, X, Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { fetchAllPosts, upsertPost, deletePost } from "@/lib/blog-db";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { formatPostDate, type BlogPost, type PostStatus } from "@/lib/blog";
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

// "YYYY-MM-DDTHH:mm" in local time for <input type="datetime-local">
function toLocalInput(iso: string): string {
  const d = iso ? new Date(iso) : new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function freshForm() {
  return {
    id: "",
    title: "",
    excerpt: "",
    content: "",
    category: "",
    author: "Ehonam AFANSI",
    coverImage: "",
    colorKey: "Vert",
    status: "draft" as PostStatus,
    publishedAtLocal: toLocalInput(""),
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

function statusBadge(p: BlogPost) {
  if (p.status === "draft") return { label: "Brouillon", cls: "text-gray-400 bg-white/5 border-white/10", icon: EyeOff };
  if (new Date(p.publishedAt).getTime() > Date.now())
    return { label: "Programmé", cls: "text-orange-300 bg-orange-500/10 border-orange-500/20", icon: Clock };
  return { label: "Publié", cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: Eye };
}

export default function AdminBlogPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<BlogPost[]>([]);
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
    setList(await fetchAllPosts());
    setLoadingList(false);
  };

  const startNew = () => {
    setForm(freshForm());
    setEditing(false);
    setError("");
    setShowForm(true);
  };

  const startEdit = (p: BlogPost) => {
    const colorKey = Object.keys(COLORS).find((k) => COLORS[k] === p.gradient) ?? "Vert";
    setForm({
      id: p.id,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      category: p.category,
      author: p.author,
      coverImage: p.coverImage,
      colorKey,
      status: p.status,
      publishedAtLocal: toLocalInput(p.publishedAt),
    });
    setEditing(true);
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    const id = (form.id || slugify(form.title)).trim();
    const publishedAt = new Date(form.publishedAtLocal).toISOString();

    const post: BlogPost = {
      id,
      title: form.title.trim(),
      excerpt: form.excerpt.trim(),
      content: form.content,
      category: form.category.trim(),
      author: form.author.trim() || "Ehonam AFANSI",
      coverImage: form.coverImage.trim(),
      gradient: COLORS[form.colorKey] ?? COLORS.Vert,
      status: form.status,
      publishedAt,
    };

    setSaving(true);
    const err = await upsertPost(post);
    setSaving(false);
    if (err) {
      setError(err.message || "Échec de l'enregistrement.");
      return;
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (p: BlogPost) => {
    if (!confirm(`Supprimer définitivement « ${p.title} » ?`)) return;
    const err = await deletePost(p.id);
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
          <h1 className="text-3xl font-extrabold text-white mt-1">Gestion du blog</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startNew}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white gradient-btn flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouvel article
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
          <Newspaper className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Articles {loadingList ? "" : `(${list.length})`}
          </h2>
        </div>

        {loadingList ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Aucun article. Clique sur « Nouvel article ».
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map((p) => {
              const badge = statusBadge(p);
              return (
                <div key={p.id} className="p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-white truncate">{p.title}</h3>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold border px-2 py-0.5 rounded-full shrink-0 ${badge.cls}`}>
                        <badge.icon className="w-3 h-3" /> {badge.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {p.category || "—"} · {formatPostDate(p.publishedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => startEdit(p)}
                      className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                      aria-label="Modifier"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(p)}
                      className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all"
                      aria-label="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border-white/10 shadow-2xl my-8 relative">
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 flex items-center justify-between glass-panel rounded-t-3xl">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Modifier l'article" : "Nouvel article"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className={labelClass}>Titre *</label>
                <input
                  className={inputClass}
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="ex : 5 clés pour réussir sa reconversion"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Résumé (extrait)</label>
                <textarea
                  rows={2}
                  className={`${inputClass} resize-y`}
                  value={form.excerpt}
                  onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                  placeholder="Court résumé affiché dans la liste."
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Contenu</label>
                <textarea
                  rows={10}
                  className={`${inputClass} resize-y`}
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  placeholder="Le corps de l'article. Laisse une ligne vide entre les paragraphes."
                />
                <p className="text-[10px] text-gray-500">
                  Astuce : une ligne vide entre deux blocs crée un nouveau paragraphe.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Catégorie</label>
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Conseils"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Auteur</label>
                  <input
                    className={inputClass}
                    value={form.author}
                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                    placeholder="Ehonam AFANSI"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Image de couverture (URL, optionnel)</label>
                  <input
                    className={inputClass}
                    value={form.coverImage}
                    onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Couleur (si pas d'image)</label>
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

              {/* Scheduling */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-widest">
                  <Clock className="w-3.5 h-3.5" />
                  Publication & programmation
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className={labelClass}>Statut</label>
                    <select
                      className={inputClass}
                      value={form.status}
                      onChange={(e) => setForm({ ...form, status: e.target.value as PostStatus })}
                    >
                      <option value="draft">Brouillon (caché)</option>
                      <option value="published">Publié</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className={labelClass}>Date de publication</label>
                    <input
                      type="datetime-local"
                      className={inputClass}
                      value={form.publishedAtLocal}
                      onChange={(e) => setForm({ ...form, publishedAtLocal: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-500">
                  Statut <b>Publié</b> + date <b>future</b> = article <b>programmé</b> : il apparaîtra
                  automatiquement sur le site à la date choisie.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

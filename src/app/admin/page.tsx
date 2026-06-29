"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, Plus, Pencil, Trash2, LogOut, BookOpen, Eye, EyeOff,
  Loader2, AlertCircle, X, Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  fetchAllCourses, upsertCourse, deleteCourse, isSupabaseConfigured,
  type AdminCourse,
} from "@/lib/courses-db";
import { lessonCount, type Chapter, type Lesson } from "@/lib/courses";
import AdminTabs from "@/components/AdminTabs";
import { isCurrentUserAdmin } from "@/lib/auth";

const COLORS: Record<string, { gradient: string; border: string }> = {
  Vert: { gradient: "from-emerald-600/20 to-teal-600/20", border: "group-hover:border-emerald-500/50" },
  Orange: { gradient: "from-orange-600/20 to-amber-600/20", border: "group-hover:border-orange-500/50" },
  "Bleu-vert": { gradient: "from-teal-600/20 to-emerald-600/20", border: "group-hover:border-teal-500/50" },
};

const emptyLesson = (): Lesson => ({ title: "", duration: "", youtubeId: "" });
const emptyChapter = (): Chapter => ({ title: "", lessons: [emptyLesson()] });

function freshForm() {
  return {
    id: "",
    title: "",
    description: "",
    category: "",
    tag: "",
    price: "",
    priceNumeric: 0,
    originalPrice: "",
    duration: "",
    students: "0",
    rating: 5,
    colorKey: "Vert",
    published: true,
    chapters: [emptyChapter()] as Chapter[],
  };
}

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-widest";

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<AdminCourse[]>([]);
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
    setList(await fetchAllCourses());
    setLoadingList(false);
  };

  const startNew = () => {
    setForm(freshForm());
    setEditing(false);
    setError("");
    setShowForm(true);
  };

  const startEdit = (c: AdminCourse) => {
    const colorKey = Object.keys(COLORS).find((k) => COLORS[k].gradient === c.gradient) ?? "Vert";
    setForm({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      tag: c.tag ?? "",
      price: c.price,
      priceNumeric: c.priceNumeric,
      originalPrice: c.originalPrice,
      duration: c.duration,
      students: c.students,
      rating: c.rating,
      colorKey,
      published: c.published,
      chapters: c.chapters.map((ch) => ({
        title: ch.title,
        lessons: ch.lessons.map((l) => ({ ...l })),
      })),
    });
    setEditing(true);
    setError("");
    setShowForm(true);
  };

  // ─── Chapter / lesson editor handlers ─────────────────────
  const updateChapters = (chapters: Chapter[]) => setForm((f) => ({ ...f, chapters }));
  const addChapter = () => updateChapters([...form.chapters, emptyChapter()]);
  const removeChapter = (ci: number) => updateChapters(form.chapters.filter((_, i) => i !== ci));
  const setChapterTitle = (ci: number, title: string) =>
    updateChapters(form.chapters.map((ch, i) => (i === ci ? { ...ch, title } : ch)));
  const addLesson = (ci: number) =>
    updateChapters(
      form.chapters.map((ch, i) => (i === ci ? { ...ch, lessons: [...ch.lessons, emptyLesson()] } : ch))
    );
  const removeLesson = (ci: number, li: number) =>
    updateChapters(
      form.chapters.map((ch, i) =>
        i === ci ? { ...ch, lessons: ch.lessons.filter((_, j) => j !== li) } : ch
      )
    );
  const setLessonField = (ci: number, li: number, field: keyof Lesson, value: string) =>
    updateChapters(
      form.chapters.map((ch, i) =>
        i === ci
          ? { ...ch, lessons: ch.lessons.map((l, j) => (j === li ? { ...l, [field]: value } : l)) }
          : ch
      )
    );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim()) {
      setError("Le titre est obligatoire.");
      return;
    }

    // Clean up the program: trim, drop empty lessons and empty modules.
    const chapters: Chapter[] = form.chapters
      .map((ch) => ({
        title: ch.title.trim(),
        lessons: ch.lessons
          .filter((l) => l.title.trim() !== "")
          .map((l) => ({
            title: l.title.trim(),
            duration: l.duration.trim(),
            youtubeId: l.youtubeId.trim(),
          })),
      }))
      .filter((ch) => ch.title !== "" || ch.lessons.length > 0);

    const id = (form.id || slugify(form.title)).trim();
    const color = COLORS[form.colorKey] ?? COLORS.Vert;

    const course: AdminCourse = {
      id,
      title: form.title.trim(),
      description: form.description.trim(),
      price: form.price.trim(),
      priceNumeric: Number(form.priceNumeric) || 0,
      originalPrice: form.originalPrice.trim(),
      duration: form.duration.trim(),
      students: form.students.trim() || "0",
      rating: Number(form.rating) || 0,
      category: form.category.trim(),
      tag: form.tag.trim() || undefined,
      gradient: color.gradient,
      borderColor: color.border,
      chapters,
      published: form.published,
    };

    setSaving(true);
    const err = await upsertCourse(course);
    setSaving(false);
    if (err) {
      setError(err.message || "Échec de l'enregistrement.");
      return;
    }
    setShowForm(false);
    load();
  };

  const handleDelete = async (c: AdminCourse) => {
    if (!confirm(`Supprimer définitivement « ${c.title} » ?`)) return;
    const err = await deleteCourse(c.id);
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
            Renseigne <code className="font-mono text-white">NEXT_PUBLIC_SUPABASE_URL</code> et{" "}
            <code className="font-mono text-white">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> dans{" "}
            <code className="font-mono text-white">.env.local</code>, exécute{" "}
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
          <h1 className="text-3xl font-extrabold text-white mt-1">Gestion des formations</h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={startNew}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-white gradient-btn flex items-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" />
            Nouvelle formation
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

      {/* Courses list */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Catalogue {loadingList ? "" : `(${list.length})`}
          </h2>
        </div>

        {loadingList ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : list.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Aucune formation. Clique sur « Nouvelle formation » pour commencer.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {list.map((c) => (
              <div key={c.id} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white truncate">{c.title}</h3>
                    {c.published ? (
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
                    {c.category || "—"} · {c.price || "—"} · {lessonCount(c)} leçons
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(c)}
                    className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                    aria-label="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c)}
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

      {/* Create / Edit form modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center p-4 overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border-white/10 shadow-2xl my-8 relative">
            <div className="sticky top-0 z-10 px-6 py-4 border-b border-white/10 flex items-center justify-between glass-panel rounded-t-3xl">
              <h2 className="text-lg font-bold text-white">
                {editing ? "Modifier la formation" : "Nouvelle formation"}
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
                  placeholder="ex : Devenir Développeur Full-Stack"
                />
              </div>

              <div className="space-y-1.5">
                <label className={labelClass}>Description</label>
                <textarea
                  rows={3}
                  className={`${inputClass} resize-y`}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Ce que l'apprenant va apprendre…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Catégorie</label>
                  <input
                    className={inputClass}
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    placeholder="Développement"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Badge (optionnel)</label>
                  <input
                    className={inputClass}
                    value={form.tag}
                    onChange={(e) => setForm({ ...form, tag: e.target.value })}
                    placeholder="Populaire"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Prix affiché</label>
                  <input
                    className={inputClass}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    placeholder="45 000 FCFA"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Prix (chiffre)</label>
                  <input
                    type="number"
                    className={inputClass}
                    value={form.priceNumeric}
                    onChange={(e) => setForm({ ...form, priceNumeric: Number(e.target.value) })}
                    placeholder="45000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Prix barré</label>
                  <input
                    className={inputClass}
                    value={form.originalPrice}
                    onChange={(e) => setForm({ ...form, originalPrice: e.target.value })}
                    placeholder="90 000 FCFA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className={labelClass}>Durée</label>
                  <input
                    className={inputClass}
                    value={form.duration}
                    onChange={(e) => setForm({ ...form, duration: e.target.value })}
                    placeholder="42 heures"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Apprenants</label>
                  <input
                    className={inputClass}
                    value={form.students}
                    onChange={(e) => setForm({ ...form, students: e.target.value })}
                    placeholder="1,240"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className={labelClass}>Note (0-5)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    className={inputClass}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 items-end">
                <div className="space-y-1.5">
                  <label className={labelClass}>Couleur de la carte</label>
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
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-300 cursor-pointer py-2.5">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 accent-emerald-500"
                  />
                  Publier (visible sur le site)
                </label>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelClass}>Programme — modules & leçons</label>
                  <button
                    type="button"
                    onClick={addChapter}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Ajouter un module
                  </button>
                </div>

                {form.chapters.length === 0 && (
                  <p className="text-xs text-gray-500">Aucun module. Clique sur « Ajouter un module ».</p>
                )}

                <div className="space-y-3">
                  {form.chapters.map((ch, ci) => (
                    <div
                      key={ci}
                      className="rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 space-y-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-gray-400 shrink-0 w-6">M{ci + 1}</span>
                        <input
                          className={inputClass}
                          value={ch.title}
                          onChange={(e) => setChapterTitle(ci, e.target.value)}
                          placeholder={`Titre du module ${ci + 1}`}
                        />
                        <button
                          type="button"
                          onClick={() => removeChapter(ci)}
                          className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 shrink-0"
                          aria-label="Supprimer le module"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2 pl-3 border-l-2 border-emerald-500/20">
                        {ch.lessons.map((l, li) => (
                          <div key={li} className="space-y-1.5">
                            <div className="flex items-center gap-2">
                              <input
                                className={inputClass}
                                value={l.title}
                                onChange={(e) => setLessonField(ci, li, "title", e.target.value)}
                                placeholder={`Leçon ${li + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => removeLesson(ci, li)}
                                className="p-2 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 shrink-0"
                                aria-label="Supprimer la leçon"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="flex gap-2">
                              <input
                                className={`${inputClass} w-28`}
                                value={l.duration}
                                onChange={(e) => setLessonField(ci, li, "duration", e.target.value)}
                                placeholder="Durée (10:00)"
                              />
                              <input
                                className={`${inputClass} flex-1`}
                                value={l.youtubeId}
                                onChange={(e) => setLessonField(ci, li, "youtubeId", e.target.value)}
                                placeholder="ID YouTube (ex : ScMzIvxBSi4)"
                              />
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addLesson(ci)}
                          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> Ajouter une leçon
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
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

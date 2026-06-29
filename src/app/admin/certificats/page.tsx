"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, LogOut, Award, Loader2, AlertCircle, Check, BookOpen, Search } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import { fetchAllPurchases, setCertified, type Purchase } from "@/lib/purchases-db";
import AdminTabs from "@/components/AdminTabs";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function AdminCertificatesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [list, setList] = useState<Purchase[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState("");

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
    const all = await fetchAllPurchases();
    setList(all.filter((p) => p.itemType === "course")); // certificat = formations uniquement
    setLoadingList(false);
  };

  const toggle = async (p: Purchase) => {
    setBusyId(p.id);
    const err = await setCertified(p.id, !p.certified);
    setBusyId(null);
    if (!err) {
      setList((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, certified: !p.certified } : x))
      );
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-gray-400">
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
  if (!authed) return null;

  const filtered = query.trim()
    ? list.filter(
        (p) =>
          p.email.toLowerCase().includes(query.toLowerCase()) ||
          p.title.toLowerCase().includes(query.toLowerCase())
      )
    : list;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Espace Formateur
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Certificats de formation</h1>
          <p className="text-gray-400 mt-1 text-sm">Délivrez le certificat aux étudiants ayant acheté une formation.</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par email ou formation…"
          className="w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
      </div>

      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Achats de formations {loadingList ? "" : `(${filtered.length})`}
          </h2>
        </div>

        {loadingList ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Aucun achat de formation pour le moment.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((p) => (
              <div key={p.id} className="p-5 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-white truncate flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-emerald-400 shrink-0" />
                    {p.title || p.itemId}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    {p.email || "—"} · acheté le {formatDate(p.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => toggle(p)}
                  disabled={busyId === p.id}
                  className={`shrink-0 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 transition-all disabled:opacity-60 ${
                    p.certified
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "gradient-btn text-white shadow-md"
                  }`}
                >
                  {busyId === p.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : p.certified ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Award className="w-3.5 h-3.5" />
                  )}
                  {p.certified ? "Certificat délivré" : "Délivrer le certificat"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" />
        Une fois délivré, l'étudiant peut télécharger son certificat depuis « Mon espace ».
      </p>
    </div>
  );
}

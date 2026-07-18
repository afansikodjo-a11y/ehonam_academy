"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, LogOut, Loader2, AlertCircle, Search, Trash2, Mail, MailCheck,
  MailWarning, Crown, GraduationCap, Calendar, Clock, ChevronDown, ChevronUp,
  BookOpen, Sparkles, Check,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import AdminTabs from "@/components/AdminTabs";

interface UserPurchase {
  title: string;
  itemType: "course" | "coaching";
  price: string;
  certified: boolean;
  createdAt: string;
}

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  provider: string;
  isAdmin: boolean;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
  purchaseCount: number;
  totalSpent: number;
  purchases: UserPurchase[];
}

const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [list, setList] = useState<AdminUser[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);

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
      setCurrentUserId(data.session.user.id);
      setAuthed(true);
      setReady(true);
      load();
    });
  }, [router]);

  const load = async () => {
    setLoadingList(true);
    setLoadError("");
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Échec du chargement.");
      setList(body.users || []);
    } catch (e: any) {
      setLoadError(e.message || "Échec du chargement.");
    } finally {
      setLoadingList(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (u: AdminUser) => {
    const warning = `Supprimer définitivement le compte de ${u.email} ?\n\nCeci efface aussi TOUTES ses données : achats (${u.purchaseCount}), certificats, progression et commentaires. Cette action est irréversible.`;
    if (!confirm(warning)) return;

    setBusyId(u.id);
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    try {
      const res = await fetch(`/api/admin/users/${u.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${data.session.access_token}` },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Suppression échouée.");
      setList((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e: any) {
      alert(e.message || "Suppression échouée.");
    } finally {
      setBusyId(null);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (u) => u.email.toLowerCase().includes(q) || u.fullName.toLowerCase().includes(q)
    );
  }, [list, query]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Espace Formateur
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Inscrits</h1>
          <p className="text-gray-400 mt-1 text-sm">Tous les comptes créés sur la plateforme, avec leurs achats.</p>
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
          placeholder="Rechercher par email ou nom…"
          className="w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 pl-9 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
        />
      </div>

      {loadError && (
        <div className="flex items-center gap-2 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {loadError}
        </div>
      )}

      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">
            Comptes {loadingList ? "" : `(${filtered.length})`}
          </h2>
        </div>

        {loadingList ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">Aucun compte trouvé.</div>
        ) : (
          <div className="divide-y divide-white/5">
            {filtered.map((u) => {
              const isOpen = expanded.has(u.id);
              const isSelf = u.id === currentUserId;
              return (
                <div key={u.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-bold text-white truncate">{u.fullName || u.email}</h3>
                        {u.isAdmin ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full shrink-0">
                            <Crown className="w-3 h-3" /> Admin
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full shrink-0">
                            <GraduationCap className="w-3 h-3" /> Étudiant
                          </span>
                        )}
                        {u.emailConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-400 shrink-0">
                            <MailCheck className="w-3 h-3 text-emerald-400" /> Email confirmé
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-400 shrink-0">
                            <MailWarning className="w-3 h-3" /> Email non confirmé
                          </span>
                        )}
                        {isSelf && (
                          <span className="text-[10px] font-semibold text-gray-500 shrink-0">(vous)</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-1.5 truncate">
                        <Mail className="w-3 h-3 shrink-0" /> {u.email}
                      </p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Inscrit le {formatDate(u.createdAt)}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Dernière connexion : {formatDate(u.lastSignInAt)}</span>
                        <span className="capitalize">Connexion : {u.provider === "google" ? "Google" : "Email"}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-right mr-2">
                        <p className="text-sm font-black text-white">{fcfa(u.totalSpent)}</p>
                        <p className="text-[10px] text-gray-500">{u.purchaseCount} achat{u.purchaseCount > 1 ? "s" : ""}</p>
                      </div>
                      {u.purchaseCount > 0 && (
                        <button
                          onClick={() => toggleExpand(u.id)}
                          className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                          aria-label="Détails des achats"
                        >
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isSelf || busyId === u.id}
                        title={isSelf ? "Vous ne pouvez pas supprimer votre propre compte" : "Supprimer ce compte"}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label="Supprimer"
                      >
                        {busyId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {isOpen && u.purchases.length > 0 && (
                    <div className="mt-4 pl-1 space-y-2 border-l-2 border-white/5 ml-1">
                      {u.purchases.map((p, i) => (
                        <div key={i} className="flex items-center justify-between gap-3 pl-3 text-xs">
                          <span className="flex items-center gap-1.5 text-gray-300 truncate">
                            {p.itemType === "course" ? (
                              <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            ) : (
                              <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                            )}
                            <span className="truncate">{p.title}</span>
                            {p.certified && (
                              <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-emerald-400 shrink-0">
                                <Check className="w-2.5 h-2.5" /> certifié
                              </span>
                            )}
                          </span>
                          <span className="text-gray-500 shrink-0">{p.price || "—"} · {formatDate(p.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 flex items-center gap-1.5">
        <AlertCircle className="w-3.5 h-3.5" />
        Supprimer un compte efface aussi, de façon définitive, ses achats, certificats, progression et commentaires.
      </p>
    </div>
  );
}

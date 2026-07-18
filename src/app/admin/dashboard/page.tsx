"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, LogOut, Loader2, Wallet, Users, ShoppingBag, Award,
  BookOpen, Sparkles, TrendingUp, Newspaper, CalendarDays,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured, fetchAllCourses, type AdminCourse } from "@/lib/courses-db";
import { fetchAllCoaching, type AdminCoachingOffer } from "@/lib/coaching-db";
import { fetchAllPosts } from "@/lib/blog-db";
import { type BlogPost } from "@/lib/blog";
import { fetchAllPurchases, type Purchase } from "@/lib/purchases-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import AdminTabs from "@/components/AdminTabs";

const fcfa = (n: number) => `${Math.round(n).toLocaleString("fr-FR")} FCFA`;

function parsePrice(price: string): number {
  const digits = (price || "").replace(/[^\d]/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

function dayKey(iso: string): string {
  return iso.slice(0, 10);
}

function lastNDays(n: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    out.push({ key: d.toISOString().slice(0, 10), label: String(d.getDate()) });
  }
  return out;
}

function isSameMonth(iso: string, ref: Date): boolean {
  const d = new Date(iso);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

// ── KPI card ──────────────────────────────────────────────────
function KpiCard({
  icon: Icon, label, value, sub, accent = "emerald",
}: {
  icon: React.ComponentType<{ className?: string }>; label: string; value: string; sub?: string;
  accent?: "emerald" | "orange";
}) {
  return (
    <div className="glass-panel rounded-2xl border-white/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${accent === "orange" ? "bg-orange-500/10 border border-orange-500/20" : "bg-emerald-500/10 border border-emerald-500/20"}`}>
          <Icon className={`w-4 h-4 ${accent === "orange" ? "text-orange-400" : "text-emerald-400"}`} />
        </div>
        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Graphique : revenus des 14 derniers jours ───────────────────
function RevenueChart({ data }: { data: { key: string; label: string; value: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-40">
      {data.map((d) => {
        const h = d.value > 0 ? Math.max(3, Math.round((d.value / max) * 100)) : 0;
        return (
          <div key={d.key} className="group relative flex-1 flex flex-col items-center justify-end h-full">
            <div className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap rounded-md bg-black/90 border border-white/10 px-2 py-1 text-[10px] font-bold text-white z-10">
              {fcfa(d.value)}
            </div>
            <div
              className="w-full rounded-t-[4px] bg-emerald-500/80 group-hover:bg-emerald-400 transition-colors min-h-0"
              style={{ height: `${h}%` }}
            />
            <span className="mt-1.5 text-[9px] text-gray-500 tabular-nums">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ── Barre de répartition Formations / Accompagnements ───────────
function SplitBar({
  segments,
}: {
  segments: { key: string; label: string; value: number; colorClass: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  return (
    <div>
      <div className="flex w-full h-3 rounded-full overflow-hidden gap-0.5 bg-white/5">
        {segments.map((s) => (
          <div key={s.key} className={s.colorClass} style={{ width: `${(s.value / total) * 100}%` }} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-3">
        {segments.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1.5 text-xs text-gray-400">
            <span className={`w-2.5 h-2.5 rounded-full ${s.colorClass}`} />
            {s.label} — <span className="text-white font-bold">{fcfa(s.value)}</span>{" "}
            ({Math.round((s.value / total) * 100)}%)
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Classement des formations / accompagnements par revenu ──────
function TopItemsList({
  items,
}: {
  items: { key: string; title: string; type: "course" | "coaching"; revenue: number; count: number }[];
}) {
  if (items.length === 0) {
    return <p className="text-sm text-gray-500 py-6 text-center">Aucune vente pour le moment.</p>;
  }
  const max = Math.max(1, ...items.map((i) => i.revenue));
  return (
    <div className="space-y-4">
      {items.map((i) => (
        <div key={i.key}>
          <div className="flex items-center justify-between gap-3 mb-1.5">
            <span className="text-sm font-semibold text-white truncate flex items-center gap-1.5 min-w-0">
              {i.type === "course" ? (
                <BookOpen className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              )}
              <span className="truncate">{i.title}</span>
            </span>
            <span className="text-xs text-gray-400 shrink-0">
              {fcfa(i.revenue)} · {i.count} vente{i.count > 1 ? "s" : ""}
            </span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className={`h-full rounded-full ${i.type === "course" ? "bg-emerald-500" : "bg-orange-500"}`}
              style={{ width: `${Math.max(2, (i.revenue / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);

  const [courses, setCourses] = useState<AdminCourse[]>([]);
  const [coaching, setCoaching] = useState<AdminCoachingOffer[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

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
      setLoading(true);
      const [c, co, p, pu] = await Promise.all([
        fetchAllCourses(), fetchAllCoaching(), fetchAllPosts(), fetchAllPurchases(),
      ]);
      setCourses(c);
      setCoaching(co);
      setPosts(p);
      setPurchases(pu);
      setLoading(false);
    });
  }, [router]);

  const stats = useMemo(() => {
    const now = new Date();
    const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const totalRevenue = purchases.reduce((s, p) => s + parsePrice(p.price), 0);
    const revenueThisMonth = purchases
      .filter((p) => isSameMonth(p.createdAt, now))
      .reduce((s, p) => s + parsePrice(p.price), 0);
    const revenueLastMonth = purchases
      .filter((p) => isSameMonth(p.createdAt, lastMonthRef))
      .reduce((s, p) => s + parsePrice(p.price), 0);

    const uniqueCustomers = new Set(purchases.map((p) => p.email || p.id)).size;
    const certificatesIssued = purchases.filter((p) => p.certified).length;

    const courseSales = purchases.filter((p) => p.itemType === "course");
    const coachingSales = purchases.filter((p) => p.itemType === "coaching");
    const courseRevenue = courseSales.reduce((s, p) => s + parsePrice(p.price), 0);
    const coachingRevenue = coachingSales.reduce((s, p) => s + parsePrice(p.price), 0);

    // Revenus par jour (14 derniers jours)
    const days = lastNDays(14);
    const byDay = new Map<string, number>(days.map((d) => [d.key, 0]));
    for (const p of purchases) {
      const k = dayKey(p.createdAt);
      if (byDay.has(k)) byDay.set(k, (byDay.get(k) || 0) + parsePrice(p.price));
    }
    const chartData = days.map((d) => ({ ...d, value: byDay.get(d.key) || 0 }));

    // Classement par article (formation ou accompagnement)
    const byItem = new Map<string, { key: string; title: string; type: "course" | "coaching"; revenue: number; count: number }>();
    for (const p of purchases) {
      const key = `${p.itemType}:${p.itemId}`;
      const entry = byItem.get(key) || { key, title: p.title || p.itemId, type: p.itemType, revenue: 0, count: 0 };
      entry.revenue += parsePrice(p.price);
      entry.count += 1;
      byItem.set(key, entry);
    }
    const topItems = [...byItem.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 6);

    const recent = [...purchases]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 8);

    return {
      totalRevenue, revenueThisMonth, revenueLastMonth, uniqueCustomers, certificatesIssued,
      totalSales: purchases.length, courseSalesCount: courseSales.length, coachingSalesCount: coachingSales.length,
      courseRevenue, coachingRevenue, chartData, topItems, recent,
    };
  }, [purchases]);

  const publishedCourses = courses.filter((c) => c.published).length;
  const publishedCoaching = coaching.filter((c) => c.published).length;
  const publishedPosts = posts.filter((p) => p.status === "published").length;

  const revenueDelta = stats.revenueLastMonth > 0
    ? Math.round(((stats.revenueThisMonth - stats.revenueLastMonth) / stats.revenueLastMonth) * 100)
    : null;

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <AdminTabs />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            Espace Formateur
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Tableau de bord</h1>
          <p className="text-gray-400 mt-1 text-sm">Vue d'ensemble des ventes, inscriptions et finances.</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {loading ? (
        <div className="p-20 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={Wallet}
              label="Revenu total"
              value={fcfa(stats.totalRevenue)}
              sub={`${stats.totalSales} vente${stats.totalSales > 1 ? "s" : ""} au total`}
            />
            <KpiCard
              icon={TrendingUp}
              label="Revenu ce mois-ci"
              value={fcfa(stats.revenueThisMonth)}
              sub={revenueDelta === null ? "Pas de données le mois dernier" : `${revenueDelta >= 0 ? "+" : ""}${revenueDelta}% vs mois dernier`}
              accent="orange"
            />
            <KpiCard
              icon={Users}
              label="Clients uniques"
              value={String(stats.uniqueCustomers)}
              sub="Ayant réalisé au moins un achat"
            />
            <KpiCard
              icon={Award}
              label="Certificats délivrés"
              value={String(stats.certificatesIssued)}
              sub={`Sur ${stats.courseSalesCount} achat${stats.courseSalesCount > 1 ? "s" : ""} de formation`}
              accent="orange"
            />
          </div>

          {/* Revenue chart + split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass-panel rounded-2xl border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6">
                <CalendarDays className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Revenus — 14 derniers jours</h2>
              </div>
              <RevenueChart data={stats.chartData} />
            </div>

            <div className="glass-panel rounded-2xl border-white/5 p-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Formations vs Accompagnements</h2>
              </div>
              <SplitBar
                segments={[
                  { key: "course", label: "Formations", value: stats.courseRevenue, colorClass: "bg-emerald-500" },
                  { key: "coaching", label: "Accompagnements", value: stats.coachingRevenue, colorClass: "bg-orange-500" },
                ]}
              />
              <div className="mt-6 pt-5 border-t border-white/5 grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-xl font-black text-white">{stats.courseSalesCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Ventes formations</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{stats.coachingSalesCount}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider mt-0.5">Ventes accompagnements</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top items + recent activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl border-white/5 p-6">
              <h2 className="text-sm font-bold text-white mb-5">Meilleures ventes</h2>
              <TopItemsList items={stats.topItems} />
            </div>

            <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/5">
                <h2 className="text-sm font-bold text-white">Activité récente</h2>
              </div>
              {stats.recent.length === 0 ? (
                <p className="text-sm text-gray-500 py-10 text-center">Aucun achat pour le moment.</p>
              ) : (
                <div className="divide-y divide-white/5">
                  {stats.recent.map((p) => (
                    <div key={p.id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.title || p.itemId}</p>
                        <p className="text-xs text-gray-500 truncate">{p.email || "—"} · {formatDate(p.createdAt)}</p>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 shrink-0">{fcfa(parsePrice(p.price))}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Catalogue overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl border-white/5 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-black text-white">{publishedCourses} / {courses.length}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Formations publiées</p>
              </div>
            </div>
            <div className="glass-panel rounded-2xl border-white/5 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-lg font-black text-white">{publishedCoaching} / {coaching.length}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Accompagnements publiés</p>
              </div>
            </div>
            <div className="glass-panel rounded-2xl border-white/5 p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Newspaper className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-lg font-black text-white">{publishedPosts} / {posts.length}</p>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider">Articles publiés</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield, LogOut, Megaphone, Loader2, Save, Check, TrendingDown,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import { fetchPixelId, updatePixelId } from "@/lib/settings-db";
import { fetchPixelEvents, type PixelEventRow } from "@/lib/pixel-events-db";
import AdminTabs from "@/components/AdminTabs";

const inputClass =
  "w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 dark:focus:border-emerald-500/60 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors";
const labelClass = "text-[10px] font-bold text-gray-400 uppercase tracking-widest";

const PERIODS = [
  { days: 7, label: "7 jours" },
  { days: 30, label: "30 jours" },
  { days: 90, label: "90 jours" },
];

const FUNNEL_STAGES: { event: string; label: string }[] = [
  { event: "ViewContent", label: "Vues de page produit" },
  { event: "InitiateCheckout", label: "Paiement initié" },
  { event: "AddPaymentInfo", label: "Infos de paiement saisies" },
  { event: "Purchase", label: "Achat confirmé" },
];

function formatCFA(n: number): string {
  return `${Math.round(n).toLocaleString("fr-FR")} FCFA`;
}

function campaignKey(e: PixelEventRow): string {
  return e.utm_campaign || "Direct / non attribué";
}

export default function AdminCampagnesPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  const [pixelId, setPixelId] = useState("");
  const [pixelIdInput, setPixelIdInput] = useState("");
  const [savingPixel, setSavingPixel] = useState(false);
  const [savedPixel, setSavedPixel] = useState(false);

  const [days, setDays] = useState(30);
  const [events, setEvents] = useState<PixelEventRow[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

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
      const id = await fetchPixelId();
      setPixelId(id);
      setPixelIdInput(id);
    });
  }, [router]);

  useEffect(() => {
    if (!authed) return;
    setLoadingEvents(true);
    fetchPixelEvents(days).then((rows) => {
      setEvents(rows);
      setLoadingEvents(false);
    });
  }, [authed, days]);

  const savePixelId = async () => {
    setSavingPixel(true);
    setSavedPixel(false);
    const err = await updatePixelId(pixelIdInput);
    setSavingPixel(false);
    if (!err) {
      setPixelId(pixelIdInput.trim());
      setSavedPixel(true);
      setTimeout(() => setSavedPixel(false), 2500);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const funnel = useMemo(() => {
    return FUNNEL_STAGES.map((stage) => {
      const visitors = new Set(
        events.filter((e) => e.event_name === stage.event && e.visitor_id).map((e) => e.visitor_id)
      );
      return { ...stage, count: visitors.size };
    });
  }, [events]);

  const maxCount = Math.max(1, ...funnel.map((f) => f.count));

  const revenue = useMemo(
    () => events.filter((e) => e.event_name === "Purchase").reduce((sum, e) => sum + (e.value || 0), 0),
    [events]
  );

  const byCampaign = useMemo(() => {
    const groups = new Map<string, PixelEventRow[]>();
    for (const e of events) {
      const key = campaignKey(e);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    }
    return Array.from(groups.entries())
      .map(([campaign, rows]) => {
        const views = new Set(rows.filter((r) => r.event_name === "ViewContent" && r.visitor_id).map((r) => r.visitor_id)).size;
        const checkouts = new Set(rows.filter((r) => r.event_name === "InitiateCheckout" && r.visitor_id).map((r) => r.visitor_id)).size;
        const purchases = rows.filter((r) => r.event_name === "Purchase").length;
        const rowRevenue = rows.filter((r) => r.event_name === "Purchase").reduce((sum, r) => sum + (r.value || 0), 0);
        const source = rows.find((r) => r.utm_source)?.utm_source || "—";
        return { campaign, source, views, checkouts, purchases, revenue: rowRevenue, rate: views > 0 ? (purchases / views) * 100 : 0 };
      })
      .sort((a, b) => b.views - a.views);
  }, [events]);

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
          <h1 className="text-3xl font-extrabold text-white mt-1">Pixel & campagnes</h1>
          <p className="text-gray-400 mt-1 text-sm">Configurez le Pixel Meta et suivez le tunnel de conversion de vos campagnes.</p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 flex items-center gap-2 transition-all"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>

      {/* Réglages du pixel */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Pixel Facebook (Meta Ads)</h2>
        </div>
        <div className="p-6 flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="flex-1 w-full">
            <label className={labelClass}>ID du pixel</label>
            <input
              value={pixelIdInput}
              onChange={(e) => setPixelIdInput(e.target.value)}
              placeholder="ex. 123456789012345"
              className={`${inputClass} mt-1.5`}
            />
            {pixelId ? (
              <p className="text-xs text-gray-500 mt-2">Pixel actif : {pixelId}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-2">Aucun pixel actif — le suivi Meta est inactif sur le site.</p>
            )}
          </div>
          <button
            onClick={savePixelId}
            disabled={savingPixel || pixelIdInput.trim() === pixelId}
            className="gradient-btn shrink-0 px-6 py-2.5 rounded-xl text-white font-black text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {savingPixel ? <Loader2 className="w-4 h-4 animate-spin" /> : savedPixel ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {savedPixel ? "Enregistré" : "Enregistrer"}
          </button>
        </div>
      </div>

      {/* Sélecteur de période */}
      <div className="flex items-center gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => setDays(p.days)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              days === p.days ? "gradient-btn text-white shadow-md" : "text-gray-300 hover:text-white bg-white/5 hover:bg-white/10"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Entonnoir de conversion */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white">Entonnoir de conversion</h2>
          </div>
          {!loadingEvents && (
            <span className="text-xs text-gray-500">Revenu suivi : {formatCFA(revenue)}</span>
          )}
        </div>

        {loadingEvents ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Aucun évènement enregistré sur cette période.
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {funnel.map((stage, i) => {
              const prevCount = i > 0 ? funnel[i - 1].count : stage.count;
              const dropRate = i > 0 && prevCount > 0 ? Math.round((stage.count / prevCount) * 100) : null;
              const widthPct = Math.max(4, Math.round((stage.count / maxCount) * 100));
              return (
                <div key={stage.event}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-sm font-semibold text-gray-200">{stage.label}</span>
                    <span className="text-sm font-black text-white">
                      {stage.count}
                      {dropRate !== null && <span className="text-xs font-medium text-gray-500 ml-2">({dropRate}% de l'étape précédente)</span>}
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Répartition par campagne */}
      <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white">Répartition par campagne</h2>
        </div>

        {loadingEvents ? (
          <div className="p-10 text-center text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin mx-auto" />
          </div>
        ) : byCampaign.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">
            Aucune donnée de campagne sur cette période.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <th className="px-6 py-3">Campagne</th>
                  <th className="px-6 py-3">Source</th>
                  <th className="px-6 py-3 text-right">Vues</th>
                  <th className="px-6 py-3 text-right">Paiements initiés</th>
                  <th className="px-6 py-3 text-right">Achats</th>
                  <th className="px-6 py-3 text-right">Taux</th>
                  <th className="px-6 py-3 text-right">Revenu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {byCampaign.map((row) => (
                  <tr key={row.campaign}>
                    <td className="px-6 py-3.5 font-semibold text-white">{row.campaign}</td>
                    <td className="px-6 py-3.5 text-gray-400">{row.source}</td>
                    <td className="px-6 py-3.5 text-right text-gray-300">{row.views}</td>
                    <td className="px-6 py-3.5 text-right text-gray-300">{row.checkouts}</td>
                    <td className="px-6 py-3.5 text-right text-gray-300">{row.purchases}</td>
                    <td className="px-6 py-3.5 text-right text-gray-300">{row.rate.toFixed(1)}%</td>
                    <td className="px-6 py-3.5 text-right font-bold text-emerald-400">{formatCFA(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

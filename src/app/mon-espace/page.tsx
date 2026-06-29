"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Loader2, GraduationCap, ArrowRight, Calendar, Award, PlayCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { fetchMyPurchases, type Purchase } from "@/lib/purchases-db";

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default function MonEspacePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      setAuthed(true);
      setReady(true);
      setPurchases(await fetchMyPurchases());
      setLoading(false);

      // Retour de paiement : le webhook peut arriver après la redirection,
      // on recharge la liste quelques secondes plus tard.
      if (new URLSearchParams(window.location.search).get("paiement") === "succes") {
        setPaymentSuccess(true);
        timer = setTimeout(async () => setPurchases(await fetchMyPurchases()), 4000);
      }
    });
    return () => clearTimeout(timer);
  }, [router]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
      {/* Header */}
      <div className="mb-10">
        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
          <GraduationCap className="w-4 h-4" />
          Mon espace
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Mes formations & accompagnements</h1>
        <p className="text-gray-400 mt-2">Retrouvez ici tout ce que vous avez acquis.</p>
      </div>

      {paymentSuccess && (
        <div className="mb-8 flex items-start gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
          <span className="mt-0.5">✅</span>
          <span>
            Merci pour votre paiement ! Votre accès est en cours de validation et apparaîtra ici dans un instant
            (actualisez la page si besoin).
          </span>
        </div>
      )}

      {loading ? (
        <div className="py-16 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : purchases.length === 0 ? (
        <div className="glass-panel rounded-3xl border-white/5 p-10 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5">
            <BookOpen className="w-8 h-8 text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Aucun achat pour le moment</h2>
          <p className="text-gray-400 max-w-md mx-auto mb-6">
            Vous n'avez encore acquis aucune formation ni accompagnement. Explorez le catalogue pour commencer.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/#courses" className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center justify-center gap-2">
              Voir les formations
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/#accompagnement" className="px-6 py-3 rounded-xl font-bold text-gray-300 hover:text-white glass-panel border-white/5 hover:border-white/20 transition-all inline-flex items-center justify-center gap-2">
              Voir l'accompagnement
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {purchases.map((p) => (
            <div key={p.id} className="glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col">
              <div className="h-1.5 w-full gradient-btn"></div>
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  {p.itemType === "coaching" ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-300 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                      <Sparkles className="w-3 h-3" /> Accompagnement
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <BookOpen className="w-3 h-3" /> Formation
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">{p.title || p.itemId}</h3>
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
                  <Calendar className="w-3.5 h-3.5" />
                  Acquis le {formatDate(p.createdAt)}
                </div>
                <div className="mt-auto pt-2 space-y-3">
                  <span className="text-sm font-black text-white block">{p.price}</span>
                  <div className="flex flex-wrap gap-2">
                    {p.itemType === "course" && (
                      <Link
                        href={`/apprendre/${p.itemId}`}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-white gradient-btn flex items-center gap-1.5 shadow-md"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Accéder aux cours
                      </Link>
                    )}
                    {p.itemType === "course" && p.certified && (
                      <Link
                        href={`/certificat/${p.itemId}`}
                        className="px-4 py-2 rounded-xl text-xs font-extrabold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 flex items-center gap-1.5 transition-colors"
                      >
                        <Award className="w-3.5 h-3.5" />
                        Certificat
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

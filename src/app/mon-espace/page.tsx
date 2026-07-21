"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Sparkles, Loader2, GraduationCap, ArrowRight, Calendar, Award, PlayCircle, UserCog, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured, fetchCourseById } from "@/lib/courses-db";
import { fetchMyPurchases, type Purchase } from "@/lib/purchases-db";
import { fetchCourseProgress } from "@/lib/progress-db";
import { lessonCount } from "@/lib/courses";
import { trackFbEvent, parsePriceFCFA } from "@/lib/fb-pixel";
import { buildWhatsappUrl } from "@/lib/whatsapp";

type CourseProgress = { done: number; total: number; pct: number };

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

// Au retour de Moneroo : revérifie la transaction et enregistre l'achat
// (filet de sécurité, indépendant du webhook).
async function confirmReturnPayment(accessToken: string) {
  try {
    const params = new URLSearchParams(window.location.search);
    const pid =
      params.get("paymentId") ||
      params.get("payment_id") ||
      params.get("paymentID") ||
      params.get("transaction_id") ||
      params.get("id") ||
      localStorage.getItem("ea_pending_payment") ||
      "";
    if (!pid) return;
    await fetch("/api/confirm-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
      body: JSON.stringify({ paymentId: pid }),
    });
    localStorage.removeItem("ea_pending_payment");
  } catch {
    // silencieux : le webhook reste le filet de secours
  }
}

export default function MonEspacePage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [progress, setProgress] = useState<Record<string, CourseProgress>>({});

  // Calcule la progression (leçons terminées / total) de chaque cours acheté.
  const loadProgress = async (list: Purchase[]) => {
    const courseItems = list.filter((p) => p.itemType === "course");
    const entries = await Promise.all(
      courseItems.map(async (p) => {
        const [course, doneSet] = await Promise.all([
          fetchCourseById(p.itemId),
          fetchCourseProgress(p.itemId),
        ]);
        if (!course) return null;
        let done = 0;
        course.chapters.forEach((ch, ci) =>
          ch.lessons.forEach((_, li) => {
            if (doneSet.has(`${ci}:${li}`)) done++;
          })
        );
        const total = lessonCount(course);
        return [p.itemId, { done, total, pct: total ? Math.round((done / total) * 100) : 0 }] as const;
      })
    );
    const map: Record<string, CourseProgress> = {};
    for (const e of entries) if (e) map[e[0]] = e[1];
    setProgress(map);
  };

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

      // Retour de paiement : on confirme la transaction AVANT d'afficher la liste.
      const isReturn = new URLSearchParams(window.location.search).get("paiement") === "succes";
      if (isReturn) {
        setPaymentSuccess(true);
        await confirmReturnPayment(data.session.access_token);
      }

      const list = await fetchMyPurchases();
      setPurchases(list);
      setLoading(false);
      loadProgress(list);

      if (isReturn) {
        // list est trié du plus récent au plus ancien : l'achat en tête est
        // celui qu'on vient de confirmer. Sert à envoyer un évènement de
        // conversion précis (montant réel) au Pixel Facebook.
        const latest = list[0];
        if (latest) {
          trackFbEvent("Purchase", {
            value: parsePriceFCFA(latest.price),
            currency: "XOF",
            content_name: latest.title || latest.itemId,
            content_ids: [latest.itemId],
            content_type: "product",
          });
        }
        // Retire "paiement=succes" de l'URL : un rechargement de page ne doit
        // pas re-confirmer le paiement ni renvoyer un évènement Purchase en double.
        const url = new URL(window.location.href);
        url.searchParams.delete("paiement");
        window.history.replaceState({}, "", url.pathname + url.search);
      }

      // Filet de sécurité : le webhook peut aussi arriver un peu après.
      if (isReturn) {
        timer = setTimeout(async () => {
          const fresh = await fetchMyPurchases();
          setPurchases(fresh);
          loadProgress(fresh);
        }, 5000);
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
      <div className="mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Mon espace
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">Mes formations & accompagnements</h1>
          <p className="text-gray-400 mt-2">Retrouvez ici tout ce que vous avez acquis.</p>
        </div>
        <Link
          href="/profil"
          className="self-start sm:self-auto shrink-0 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-300 hover:text-white glass-panel border-white/5 hover:border-white/20 transition-all inline-flex items-center gap-2"
        >
          <UserCog className="w-4 h-4" />
          Mon profil
        </Link>
      </div>

      {paymentSuccess && (
        <div className="mb-8 flex flex-col gap-2 text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl px-4 py-3">
          <span className="flex items-start gap-2">
            <span className="mt-0.5">✅</span>
            <span>
              Merci pour votre paiement ! Votre accès est en cours de validation et apparaîtra ici dans un instant
              (actualisez la page si besoin).
            </span>
          </span>
          <span className="pl-6 text-xs text-emerald-300/80">
            Toujours rien après quelques minutes ?{" "}
            <a
              href={buildWhatsappUrl("Bonjour, j'ai payé sur Ehonam Academy mais mon accès n'apparaît toujours pas dans « Mon espace ». Pouvez-vous m'aider ?")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold underline underline-offset-2 hover:text-emerald-200"
            >
              Contactez-nous sur WhatsApp
            </a>
          </span>
        </div>
      )}

      {!paymentSuccess && (
        <div className="mb-8 flex items-center gap-2 text-xs text-gray-500">
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span>
            Un souci avec un paiement ou un accès manquant ?{" "}
            <a
              href={buildWhatsappUrl("Bonjour, j'ai un souci avec mon compte/paiement sur Ehonam Academy.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
            >
              Contactez-nous sur WhatsApp
            </a>
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

                {p.itemType === "course" && progress[p.itemId] && progress[p.itemId].total > 0 && (
                  <div className="mb-5 -mt-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-400 mb-1">
                      <span>
                        {progress[p.itemId].done}/{progress[p.itemId].total} leçons
                      </span>
                      <span className="font-semibold text-emerald-300">{progress[p.itemId].pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full gradient-btn transition-all duration-500"
                        style={{ width: `${progress[p.itemId].pct}%` }}
                      />
                    </div>
                  </div>
                )}

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

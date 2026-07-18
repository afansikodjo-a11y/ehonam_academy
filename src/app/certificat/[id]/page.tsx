"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Download, Award, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { fetchMyPurchases, type Purchase } from "@/lib/purchases-db";

function formatDate(iso: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  try {
    return d.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return "";
  }
}

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ready, setReady] = useState(false);
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [name, setName] = useState("");
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

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
      const meta = data.session.user.user_metadata || {};
      setName((meta.full_name || meta.name || "") as string);
      const mine = await fetchMyPurchases();
      const found = mine.find((p) => p.itemId === id && p.itemType === "course" && p.certified);
      setPurchase(found ?? null);
      setReady(true);
    });
  }, [id, router]);

  const handleDownload = async () => {
    if (!name.trim() || !certRef.current) return;
    setDownloading(true);
    try {
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(certRef.current, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const imgData = canvas.toDataURL("image/png");

      // A4 paysage avec les mêmes marges que l'impression, image centrée en conservant les proportions.
      const pageW = 297, pageH = 210, margin = 10;
      const maxW = pageW - margin * 2, maxH = pageH - margin * 2;
      const ratio = canvas.width / canvas.height;
      let imgW = maxW, imgH = imgW / ratio;
      if (imgH > maxH) {
        imgH = maxH;
        imgW = imgH * ratio;
      }
      const x = (pageW - imgW) / 2, y = (pageH - imgH) / 2;

      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      pdf.addImage(imgData, "PNG", x, y, imgW, imgH);
      const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
      pdf.save(`certificat-${slug || "ehonam-academy"}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (!ready) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin mx-auto" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto border border-amber-500/30">
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </div>
        <p className="text-white font-bold text-lg">Certificat non disponible</p>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          Ce certificat n'a pas encore été délivré pour cette formation. Il sera disponible ici une fois validé par
          l'administrateur.
        </p>
        <button
          onClick={() => router.push("/mon-espace")}
          className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à Mon espace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Controls (not printed) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <button
          onClick={() => router.push("/mon-espace")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à Mon espace
        </button>
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Votre nom complet</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Prénom NOM"
              className="w-full sm:w-64 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-emerald-500 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none"
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={!name.trim() || downloading}
            className="px-6 py-2.5 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {downloading ? "Génération…" : "Télécharger le PDF"}
          </button>
        </div>
      </div>

      {/* Certificate (printed / téléchargé) */}
      <div className="print-area">
        <div
          ref={certRef}
          className="certificate mx-auto bg-white text-gray-900 rounded-2xl shadow-2xl border-[3px] border-emerald-700/80 p-8 sm:p-14 relative overflow-hidden"
        >
          <div className="absolute inset-3 border border-orange-500/40 rounded-xl pointer-events-none"></div>

          <div className="relative text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-mark.svg" alt="" className="h-12 w-auto" />
              <span className="text-xl font-extrabold tracking-tight" style={{ fontFamily: "'Montserrat','Outfit',sans-serif" }}>
                <span style={{ color: "#158f51" }}>Ehonam</span> <span style={{ color: "#ef7c1e" }}>Academy</span>
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-700 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Certificat de réussite</span>
            </div>

            <p className="text-gray-500 mt-6">Ce certificat atteste que</p>
            <h1
              className="text-3xl sm:text-5xl font-black my-3 text-gray-900"
              style={{ fontFamily: "'Montserrat','Outfit',sans-serif" }}
            >
              {name.trim() || "—"}
            </h1>

            <p className="text-gray-500">a suivi avec succès la formation</p>
            <h2 className="text-xl sm:text-2xl font-bold mt-2 mb-8 text-emerald-800">{purchase.title}</h2>

            <div className="w-24 h-px bg-gray-300 mx-auto mb-8"></div>

            <div className="flex items-end justify-between gap-6 mt-10 text-left">
              <div>
                <p className="text-xs text-gray-500">Délivré le</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(purchase.certifiedAt)}</p>
              </div>
              <div className="text-right">
                <p
                  className="text-lg text-gray-900"
                  style={{ fontFamily: "'Montserrat','Outfit',sans-serif", fontWeight: 700 }}
                >
                  Ehonam AFANSI
                </p>
                <div className="w-40 h-px bg-gray-400 ml-auto my-1"></div>
                <p className="text-xs text-gray-500">Fondateur — Ehonam Academy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

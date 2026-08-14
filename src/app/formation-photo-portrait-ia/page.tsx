"use client";

import { useState } from "react";
import {
  Sparkles, Check, CheckCircle2, ArrowRight,
  Plus, Minus,
  Lightbulb, Wand2, XCircle,
  Users, GraduationCap, Briefcase,
  Flame, Aperture, Layers,
  Zap, Camera, Globe, Building2, User,
  Smartphone, MonitorPlay, Clock, BadgeCheck,
  PlayCircle,
} from "lucide-react";
import { PORTRAIT_COURSE_ID } from "@/lib/courses";
import CheckoutModal from "@/components/CheckoutModal";
import WaitlistModal from "@/components/WaitlistModal";
import { useSalesPageCheckout } from "@/lib/useSalesPageCheckout";
import { useScrollReveal } from "@/lib/useScrollReveal";
import Eyebrow from "@/components/Eyebrow";
import { ImageCarousel } from "@/components/ImageCarousel";

const TRUST_PILLS = [
  "Accessible aux débutants",
  "100 % pratique",
  "Accès immédiat",
  "Mobile, tablette & PC",
];

const PAIN_POINTS = [
  { text: "Vous avez besoin d'une photo de profil professionnelle, mais vous n'avez ni photographe ni studio sous la main." },
  { text: "Une séance photo professionnelle coûte cher et demande de prendre rendez-vous." },
  { text: "Vos photos actuelles sont datées, amateurs, ou ne vous ressemblent plus vraiment." },
  { text: "Vous n'êtes pas à l'aise devant un appareil photo." },
  { text: "Vous aimeriez plusieurs styles de portraits (pro, casual, artistique) sans refaire une séance à chaque fois." },
  { text: "Vous aimeriez proposer des séances de portraits IA à vos clients, mais vous manquez de méthode." },
];

const OPPORTUNITY_CARDS = [
  { Icon: Zap, title: "Un portrait en quelques minutes", text: "Ce qui prenait une séance complète avec un photographe se fait maintenant en quelques échanges avec l'IA." },
  { Icon: Layers, title: "Tous les styles, toutes les occasions", text: "LinkedIn, réseaux sociaux, artistique, mode — l'IA s'adapte à chaque besoin." },
  { Icon: Globe, title: "Une compétence qui ouvre des portes", text: "Créez vos propres portraits ou développez une activité de séances de portraits IA." },
];

const BEFORE_AFTER = [
  { before: "Je n'ai pas de photo de profil qui inspire confiance.", after: "Je génère des portraits professionnels en quelques minutes." },
  { before: "Je dépends d'un photographe et d'un studio pour chaque photo.", after: "Je crée mes propres portraits, dans le style que je veux, quand je veux." },
  { before: "Mes photos sont datées ou ne me ressemblent plus.", after: "J'obtiens des portraits nets, modernes et fidèles." },
  { before: "Je ne peux pas proposer de séances photo à mes clients.", after: "Je peux vendre des séances de portraits IA à mes clients." },
];

const MODULES = [
  {
    number: "01", title: "L'IA et le portrait professionnel",
    outcome: "Comprendre pourquoi l'IA transforme la photographie de portrait et quels outils utiliser.",
    points: ["Le potentiel réel de l'IA pour créer des portraits professionnels", "Les meilleurs outils IA pour le portrait", "Les principes d'un portrait qui inspire confiance"],
  },
  {
    number: "02", title: "Maîtriser l'art du prompt portrait",
    outcome: "Savoir décrire précisément la pose, la lumière et l'expression que vous voulez.",
    points: ["La structure d'un prompt efficace pour un portrait", "Garder un visage cohérent d'une génération à l'autre", "Comment itérer et affiner un portrait étape par étape"],
  },
  {
    number: "03", title: "Portraits professionnels & corporate",
    outcome: "Créer des photos de profil qui inspirent confiance pour votre carrière et votre business.",
    points: ["Photo de profil LinkedIn et CV", "Portraits d'équipe et trombinoscopes d'entreprise", "Portraits pour entrepreneurs et indépendants"],
  },
  {
    number: "04", title: "Portraits réseaux sociaux",
    outcome: "Créer des photos de profil adaptées à chaque réseau social.",
    points: ["Photo de profil Instagram, Facebook et TikTok", "Portraits pour applications de rencontre", "Avatars et identités visuelles personnalisées"],
  },
  {
    number: "05", title: "Portraits artistiques & mode",
    outcome: "Explorer des styles créatifs, éditoriaux et mode.",
    points: ["Portraits artistiques et éditoriaux", "Portraits mode et haute couture", "Jeux de lumière et ambiances créatives"],
  },
  {
    number: "06", title: "Cohérence du visage & retouche",
    outcome: "Garder une ressemblance fidèle et un rendu impeccable.",
    points: ["Garder le même visage sur plusieurs portraits", "Corriger les imperfections et artefacts de l'IA", "Augmenter la netteté et la qualité d'un portrait"],
  },
  {
    number: "07", title: "Améliorer d'anciennes photos avec l'IA",
    outcome: "Redonner vie à vos anciennes photos.",
    points: ["Restaurer et améliorer d'anciennes photos", "Changer l'arrière-plan et l'éclairage d'un portrait", "Élever la qualité d'un portrait existant"],
  },
  {
    number: "08", title: "Utiliser cette compétence",
    outcome: "Mettre votre nouvelle compétence au service de vos projets ou de vos clients.",
    points: ["Créer des portraits pour votre propre image", "Constituer un portfolio de portraits", "Présenter et proposer des séances de portraits IA à des clients"],
  },
];

const AUDIENCE = [
  { Icon: Briefcase, t: "Entrepreneurs & indépendants" },
  { Icon: Building2, t: "Équipes & entreprises" },
  { Icon: Users, t: "Community managers" },
  { Icon: Sparkles, t: "Créateurs de contenu" },
  { Icon: Globe, t: "Freelances" },
  { Icon: GraduationCap, t: "Étudiants & jeunes diplômés" },
  { Icon: Camera, t: "Photographes" },
  { Icon: User, t: "Recherche d'emploi & réseautage" },
];

const OFFER_INCLUDES = [
  { Icon: MonitorPlay, text: "Accès complet à la formation en ligne" },
  { Icon: PlayCircle, text: "Tous les modules vidéo accessibles immédiatement" },
  { Icon: Smartphone, text: "Compatible smartphone, tablette et ordinateur" },
  { Icon: Clock, text: "Apprenez à votre rythme, quand vous voulez" },
  { Icon: Wand2, text: "Méthodes pratiques appliquées immédiatement" },
  { Icon: BadgeCheck, text: "Accès depuis n'importe où, à tout moment" },
];

const FAQ = [
  { q: "Je ne suis pas photographe. Est-ce que cette formation est pour moi ?", a: "Absolument. Cette formation est spécialement conçue pour les personnes sans expérience en photographie. Vous n'avez besoin ni d'appareil photo, ni de studio. L'IA fait le travail — vous apprenez à lui donner les bonnes instructions." },
  { q: "Je n'ai jamais utilisé l'IA. Est-ce que je peux quand même apprendre ?", a: "Oui, c'est le point de départ idéal. Nous commençons depuis zéro, en vous expliquant comment fonctionnent les outils IA pour le portrait, sans jargon technique." },
  { q: "Est-ce que le portrait va vraiment me ressembler ?", a: "Oui. La formation vous apprend justement à garder un visage cohérent et fidèle d'une génération à l'autre — c'est l'un des points clés de la méthode." },
  { q: "Est-ce que je peux suivre la formation depuis mon téléphone ?", a: "Oui. La formation est accessible depuis n'importe quel appareil : smartphone, tablette ou ordinateur. Vous pouvez apprendre où que vous soyez." },
  { q: "Est-ce que je peux utiliser cette compétence pour proposer mes services ?", a: "Oui. Vous pourrez proposer des séances de portraits IA à des clients — particuliers ou entreprises. La formation couvre comment présenter et vendre cette prestation." },
  { q: "À quoi ressembleront mes portraits après la formation ?", a: "Vous serez capable de créer des portraits d'un niveau professionnel : photo de profil LinkedIn, portraits pour réseaux sociaux, portraits artistiques et mode, et bien plus." },
];

const OUTCOMES = [
  "Créer des portraits professionnels pour toute occasion",
  "Rédiger des prompts précis qui produisent des portraits fidèles",
  "Garder un visage cohérent d'un portrait à l'autre",
  "Créer des photos de profil LinkedIn, CV et réseaux sociaux",
  "Réaliser des portraits artistiques, mode et éditoriaux",
  "Améliorer et restaurer d'anciennes photos avec l'IA",
  "Créer des portraits pour votre entreprise ou votre équipe",
  "Utiliser cette compétence pour vos propres projets ou vos clients",
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
      {children}
    </h2>
  );
}

/**
 * Rendu visuel réaliste de portraits professionnels générés par l'IA
 */
function PortraitMockup({ type }: { type: number }) {
  if (type === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-slate-100 border border-slate-600/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-700/50 text-slate-200 border border-slate-500/30">Corporate</span>
        </div>
        <div className="my-auto text-center z-10 py-3">
          <div className="w-16 h-16 rounded-full bg-slate-700/60 border border-slate-400/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-slate-200" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-slate-300 font-semibold">Photo de profil LinkedIn</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-slate-600/30 text-[9px]">
          <span className="text-slate-300 font-bold">Fond neutre</span>
          <span className="text-slate-400 font-black">★ 4.9</span>
        </div>
      </div>
    );
  }
  if (type === 1) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-950 via-fuchsia-950 to-pink-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-purple-100 border border-fuchsia-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30">Réseaux sociaux</span>
        </div>
        <div className="my-auto text-center z-10 py-3">
          <div className="w-16 h-16 rounded-full bg-fuchsia-800/50 border border-fuchsia-400/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-pink-100" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-pink-300 font-semibold">Instagram · TikTok</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-fuchsia-500/20 text-[9px]">
          <span className="text-pink-300 font-bold">Lumineux & vibrant</span>
        </div>
      </div>
    );
  }
  if (type === 2) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-zinc-950 via-neutral-900 to-stone-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-zinc-100 border border-zinc-600/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-700/50 text-zinc-200 border border-zinc-500/30">Éditorial</span>
        </div>
        <div className="my-auto text-center z-10 py-3">
          <div className="w-16 h-16 rounded-full bg-zinc-700/50 border border-zinc-400/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-zinc-200" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-zinc-300 font-semibold">Portrait artistique</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-zinc-600/30 text-[9px]">
          <span className="text-zinc-300 font-bold">Noir & contraste</span>
        </div>
      </div>
    );
  }
  if (type === 3) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-rose-950 via-red-950 to-orange-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-rose-100 border border-rose-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Mode</span>
        </div>
        <div className="my-auto text-center z-10 py-3">
          <div className="w-16 h-16 rounded-full bg-rose-800/50 border border-rose-400/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-rose-100" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-rose-300 font-semibold">Portrait haute couture</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-rose-500/20 text-[9px]">
          <span className="text-rose-300 font-bold">Studio lumière</span>
        </div>
      </div>
    );
  }
  if (type === 4) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-950 to-cyan-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-emerald-100 border border-emerald-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Avatar</span>
        </div>
        <div className="my-auto text-center z-10 py-3">
          <div className="w-16 h-16 rounded-full bg-emerald-800/50 border border-emerald-400/30 flex items-center justify-center mx-auto mb-3">
            <User className="w-8 h-8 text-emerald-100" />
          </div>
          <p className="text-[10px] uppercase tracking-widest text-emerald-300 font-semibold">Identité visuelle</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-emerald-500/20 text-[9px]">
          <span className="text-emerald-300 font-bold">Style personnalisé</span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-amber-950 via-yellow-950 to-orange-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-amber-100 border border-amber-500/30 group-hover:scale-[1.02] transition-transform duration-500">
      <div className="flex justify-between items-start z-10">
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Restauration</span>
      </div>
      <div className="my-auto text-center z-10 py-3">
        <div className="w-16 h-16 rounded-full bg-amber-800/50 border border-amber-400/30 flex items-center justify-center mx-auto mb-3">
          <User className="w-8 h-8 text-amber-100" />
        </div>
        <p className="text-[10px] uppercase tracking-widest text-amber-300 font-semibold">Photo restaurée & améliorée</p>
      </div>
      <div className="flex justify-between items-center z-10 pt-2 border-t border-amber-500/20 text-[9px]">
        <span className="text-amber-300 font-bold">Netteté retrouvée</span>
      </div>
    </div>
  );
}

/**
 * Vos portraits générés avec l'IA. Ajoutez une ligne par photo — autant
 * que vous voulez, de tous les styles — en déposant le fichier dans
 * /public/portraits/ (format 3:4 conseillé, ex. 900×1200px) :
 *   { src: "/portraits/mon-fichier.jpg", tag: "Mon style" },
 * Tant qu'un fichier n'existe pas encore, un mockup de remplacement
 * s'affiche à sa place — aucun risque d'image cassée.
 */
const PORTRAIT_GALLERY: { src: string; tag: string }[] = [
  { src: "/portraits/1-corporate.jpg", tag: "Corporate" },
  { src: "/portraits/2-reseaux-sociaux.jpg", tag: "Réseaux sociaux" },
  { src: "/portraits/Mac.jpg", tag: "Entrepreneur" },
  { src: "/portraits/Moi.jpg", tag: "Éditorial" },
  { src: "/portraits/m10.jpg", tag: "Créatif" },
  { src: "/portraits/33.jpg", tag: "Mode" },
  { src: "/portraits/m0.jpg", tag: "Mode" },
  { src: "/portraits/m2.jpg", tag: "Mode" },
  { src: "/portraits/NF1.jpg", tag: "Mode" },
  { src: "/portraits/Stylé.jpg", tag: "Casual chic" },
  { src: "/portraits/Lifestyle.jpg", tag: "Lifestyle" },
  { src: "/portraits/Lifestyle2.jpg", tag: "Lifestyle" },
  { src: "/portraits/n4.jpg", tag: "Lifestyle" },
  { src: "/portraits/NP.jpg", tag: "Tenue traditionnelle" },
  { src: "/portraits/m5.jpg", tag: "Tenue traditionnelle" },
  { src: "/portraits/mP.jpg", tag: "Prestige royal" },
];

export default function FormationPhotoPortraitIAPage() {
  const { info, checkoutOpen, setCheckoutOpen, waitlistOpen, setWaitlistOpen, showSticky, handleBuy } = useSalesPageCheckout(PORTRAIT_COURSE_ID);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useScrollReveal();

  return (
    <>
      {checkoutOpen && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          itemId={PORTRAIT_COURSE_ID}
          itemTitle={info.title}
          price={info.price}
          itemType={"course"}
        />
      )}
      {waitlistOpen && (
        <WaitlistModal
          open={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          itemId={PORTRAIT_COURSE_ID}
          itemTitle={info.title}
          itemType={"course"}
        />
      )}

      {/* Sticky CTA */}
      <div className={`fixed bottom-0 left-0 w-full z-50 transition-all duration-500 ${showSticky ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
        <div className="glass-panel border-t border-white/10 px-4 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white">{info.title}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-lg font-black text-emerald-400">{info.price}</span>
                {info.originalPrice && <span className="text-xs text-gray-500 line-through">{info.originalPrice}</span>}
              </div>
            </div>
            <button id="sticky-cta" onClick={handleBuy} className="gradient-btn flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-black text-sm tracking-wide">
              {info.closed ? "REJOINDRE LA LISTE D'ATTENTE →" : "ACCÉDER À LA FORMATION →"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-screen">
        {/* Background glows */}
        <div className="glow-blob w-[600px] h-[600px] bg-emerald-600 top-[-5%] right-[-15%] animated-glow-2" />
        <div className="glow-blob w-[500px] h-[500px] bg-orange-600 top-[30%] left-[-10%] animated-glow-1" />

        {/* ── HERO ── */}
        <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 vibe-grid pointer-events-none" />
          <div className="relative max-w-7xl mx-auto z-10">

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-up ad-1">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5" /> Formation en ligne
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> Intelligence artificielle
              </span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight animate-fade-up ad-1 mb-4">
                Et si vous pouviez créer des{" "}
                <span className="gradient-text">portraits professionnels</span>
                {" "}en quelques minutes…
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-up ad-2 mt-6">
                Sans appareil photo. Sans studio.{" "}
                <strong className="text-white">Juste avec l'IA et la bonne méthode.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-up ad-2">
              {TRUST_PILLS.map((pill) => (
                <span key={pill} className="flex items-center gap-1.5 text-xs text-gray-300 px-3 py-1.5 rounded-full glass-panel border-white/8">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 animate-fade-up ad-3">
              <button id="hero-cta-primary" onClick={handleBuy} className="gradient-btn w-full sm:w-auto px-8 py-4 rounded-xl text-white font-black text-base sm:text-lg tracking-wide flex items-center justify-center gap-2 shadow-2xl">
                {info.closed ? <Clock className="w-5 h-5" /> : <Aperture className="w-5 h-5" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : "JE VEUX CRÉER MES PORTRAITS AVEC L'IA"}
              </button>
            </div>

            <div className="flex items-center justify-center gap-3 mb-16 animate-fade-up ad-3">
              <span className="text-2xl font-black text-emerald-400">{info.price}</span>
              {info.originalPrice && (
                <>
                  <span className="text-gray-500 line-through text-sm">{info.originalPrice}</span>
                  <span className="text-xs font-black text-orange-400 uppercase tracking-wide px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                    Offre de lancement
                  </span>
                </>
              )}
            </div>

            {/* Hero visual */}
            <div className="relative max-w-5xl mx-auto animate-fade-up ad-3">
              <div className="glass-panel rounded-3xl border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-black/30">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-gray-500 font-mono hidden sm:block">formation-photo-portrait-ia — résultats créés avec l'IA</span>
                </div>
                <div className="p-3 bg-black/40">
                  <ImageCarousel items={PORTRAIT_GALLERY} fallbackCount={6} Fallback={PortraitMockup} />
                </div>
              </div>
              <div className="absolute -top-4 right-4 glass-panel rounded-2xl px-4 py-3 border-emerald-500/20 shadow-xl hidden sm:block">
                <p className="text-xs text-gray-400 mb-0.5">Styles de portraits maîtrisés</p>
                <p className="text-2xl font-black text-white">6+</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLÈME ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">Vous reconnaissez-vous ?</Eyebrow>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 leading-tight">
                Avoir un beau portrait…<br />
                <span className="gradient-text">ça ne devrait pas être aussi compliqué.</span>
              </h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
                Pourtant, voilà ce que vivent la plupart des personnes qui cherchent une photo professionnelle.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {PAIN_POINTS.map(({ text }, i) => (
                <div key={i} className="glass-panel rounded-2xl p-5 border-white/5 flex items-start gap-4 reveal">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center reveal">
              <div className="inline-block glass-panel rounded-2xl px-8 py-6 border-orange-500/15">
                <p className="text-xl sm:text-2xl font-black text-white">Si vous vous êtes reconnu dans l'une de ces situations…</p>
                <p className="text-orange-400 font-bold mt-2">cette formation a été créée exactement pour vous.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── OPPORTUNITÉ ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-emerald-500/15 reveal">
              <div className="text-center mb-10">
                <Eyebrow>L'intelligence artificielle change tout</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 leading-tight">
                  La question n'est plus de savoir si l'IA<br />
                  <span className="gradient-text">va transformer la photo de portrait.</span>
                </h2>
                <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
                  Elle le fait déjà. La vraie question, c'est :{" "}
                  <strong className="text-white">allez-vous apprendre à l'utiliser, ou regarder les autres prendre de l'avance ?</strong>
                </p>
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {OPPORTUNITY_CARDS.map(({ Icon, title, text }, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 rounded-2xl gradient-btn mx-auto flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-black text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── AVANT / APRÈS ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>La transformation</Eyebrow>
              <SectionTitle>
                Ce que vous serez capable de{" "}
                <span className="gradient-text">faire après cette formation</span>
              </SectionTitle>
            </div>
            <div className="grid gap-4">
              {BEFORE_AFTER.map(({ before, after }, i) => (
                <div key={i} className="grid sm:grid-cols-2 gap-0 rounded-2xl overflow-hidden border border-white/5 reveal">
                  <div className="flex items-start gap-3 p-5 bg-red-500/5 border-b sm:border-b-0 sm:border-r border-white/5">
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-1">Avant</span>
                      <p className="text-gray-400 text-sm">{before}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-5 bg-emerald-500/5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-1">Après</span>
                      <p className="text-gray-300 text-sm font-medium">{after}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROGRAMME ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Le programme</Eyebrow>
              <SectionTitle>
                Ce que vous allez{" "}
                <span className="gradient-text">apprendre et maîtriser</span>
              </SectionTitle>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Un parcours pratique, module par module, pour passer de débutant à créateur de portraits professionnels avec l'IA.
              </p>
            </div>
            <div className="grid gap-4">
              {MODULES.map(({ number, title, outcome, points }, i) => (
                <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-6 border-white/5 reveal">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl gradient-btn flex items-center justify-center shrink-0 font-black text-white text-sm">
                      {number}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-white text-lg mb-2">{title}</h3>
                      <p className="text-emerald-400 text-sm font-semibold mb-3">✦ {outcome}</p>
                      <ul className="space-y-1.5">
                        {points.map((point, j) => (
                          <li key={j} className="flex items-start gap-2 text-gray-400 text-sm">
                            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── GALERIE ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">Galerie de résultats</Eyebrow>
              <SectionTitle>
                Des portraits qui{" "}
                <span className="gradient-text">donnent envie de créer</span>
              </SectionTitle>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Voici les styles de portraits que vous serez capable de créer après cette formation. Chaque portrait, généré avec l'IA, en quelques minutes.
              </p>
            </div>

            <div className="mb-10 reveal">
              <ImageCarousel items={PORTRAIT_GALLERY} fallbackCount={6} Fallback={PortraitMockup} />
            </div>

            <div className="mt-10 text-center reveal">
              <button id="gallery-cta" onClick={handleBuy} className="gradient-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-black text-base">
                {info.closed ? <Clock className="w-5 h-5" /> : <Wand2 className="w-5 h-5" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : "JE COMMENCE À CRÉER MES PORTRAITS"}
              </button>
            </div>
          </div>
        </section>

        {/* ── CE QUE VOUS MAÎTRISEREZ ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-emerald-500/15 reveal">
              <div className="text-center mb-10">
                <Eyebrow>Ce que vous maîtriserez</Eyebrow>
                <SectionTitle>
                  À la fin de cette formation,<br />
                  <span className="gradient-text">vous saurez créer</span>
                </SectionTitle>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                {OUTCOMES.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-gray-200 text-sm leading-relaxed">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── POUR QUI ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Pour qui ?</Eyebrow>
              <SectionTitle>
                Cette formation est faite{" "}
                <span className="gradient-text">pour vous si…</span>
              </SectionTitle>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
              {AUDIENCE.map(({ Icon, t }, i) => (
                <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-5 border-white/5 text-center reveal">
                  <div className="w-12 h-12 rounded-xl gradient-btn mx-auto flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-200 text-xs font-semibold leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <div className="glass-panel rounded-2xl p-8 border-orange-500/15 text-center reveal">
              <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mx-auto mb-5">
                <Lightbulb className="w-7 h-7 text-orange-400" />
              </div>
              <p className="text-xl font-black text-white mb-3">Vous n'avez besoin ni d'appareil photo, ni d'expérience pour commencer.</p>
              <p className="text-gray-400 leading-relaxed max-w-xl mx-auto">
                Vous devez simplement être prêt à apprendre une nouvelle manière de créer.{" "}
                <strong className="text-white">L'IA fait le travail — vous guidez le résultat.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── OFFRE ── */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 reveal">
              <Eyebrow color="orange">L'offre</Eyebrow>
              <SectionTitle>
                Tout ce que vous{" "}
                <span className="gradient-text">recevez aujourd'hui</span>
              </SectionTitle>
            </div>
            <div className="glass-panel rounded-3xl p-8 sm:p-10 border-emerald-500/20 shadow-2xl reveal">
              <div className="text-center mb-8 pb-8 border-b border-white/5">
                <p className="text-gray-400 text-sm mb-3">Accès complet à la formation</p>
                <div className="flex items-end justify-center gap-3">
                  <span className="text-5xl sm:text-6xl font-black text-white">{info.price}</span>
                </div>
                {info.originalPrice && (
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span className="text-gray-500 line-through text-sm">{info.originalPrice}</span>
                    <span className="text-xs font-black text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 uppercase tracking-wide">Prix de lancement</span>
                  </div>
                )}
              </div>
              <div className="space-y-3 mb-8">
                {OFFER_INCLUDES.map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-200 text-sm font-medium flex-1">{text}</p>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 ml-auto shrink-0" />
                  </div>
                ))}
              </div>
              {info.closed && (
                <p className="text-center text-sm text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 mb-4">
                  Les inscriptions pour cette session sont fermées. Rejoignez la liste d'attente pour être averti(e) de la prochaine session.
                </p>
              )}
              <button id="pricing-cta" onClick={handleBuy} className="gradient-btn w-full py-4 rounded-xl text-white font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl">
                {info.closed ? <Clock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : `ACCÉDER À LA FORMATION — ${info.price}`}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                {info.closed ? "Vous serez averti(e) dès l'ouverture de la prochaine session" : "Accès immédiat après paiement · Paiement sécurisé"}
              </p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Vos questions</Eyebrow>
              <SectionTitle>
                On répond à{" "}
                <span className="gradient-text">vos doutes</span>
              </SectionTitle>
            </div>
            <div className="space-y-3">
              {FAQ.map(({ q, a }, i) => (
                <div key={i} className="glass-panel rounded-2xl border-white/5 overflow-hidden reveal">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="font-bold text-white text-sm sm:text-base pr-4">{q}</span>
                    <div className="shrink-0 w-7 h-7 rounded-lg glass-panel flex items-center justify-center border-white/10">
                      {openFaq === i ? <Minus className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 border-t border-white/5 pt-4">
                      <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 vibe-grid pointer-events-none opacity-60" />
          <div className="glow-blob w-[600px] h-[600px] bg-emerald-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animated-glow-1 opacity-15" />

          <div className="relative max-w-4xl mx-auto z-10 text-center reveal">
            <Eyebrow color="orange">La décision vous appartient</Eyebrow>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-4 mb-6 leading-tight">
              Dans quelques mois, l'IA sera encore{" "}
              <span className="gradient-text">plus présente</span>.
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
              La différence ne sera pas entre ceux qui ont accès à l'IA et ceux qui n'y ont pas accès.
            </p>
            <p className="text-xl font-bold text-white max-w-2xl mx-auto leading-relaxed mb-12">
              La différence sera entre ceux qui savent l'utiliser…<br />
              <span className="gradient-text">et ceux qui regardent les autres l'utiliser.</span>
            </p>

            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-emerald-500/20 mb-10 max-w-2xl mx-auto">
              <div className="flex items-center justify-center gap-2 mb-6">
                <div className={`w-2 h-2 rounded-full animate-pulse ${info.closed ? "bg-orange-400" : "bg-emerald-400"}`} />
                <span className={`text-sm font-bold ${info.closed ? "text-orange-400" : "text-emerald-400"}`}>
                  {info.closed ? "Inscriptions fermées — liste d'attente ouverte" : "Accès immédiat après paiement"}
                </span>
              </div>
              {!info.closed && (
                <>
                  <div className="flex items-end justify-center gap-3 mb-2">
                    <span className="text-5xl font-black text-white">{info.price}</span>
                  </div>
                  {info.originalPrice && (
                    <p className="text-gray-500 line-through text-sm mb-8">au lieu de {info.originalPrice}</p>
                  )}
                </>
              )}
              <button id="final-cta" onClick={handleBuy} className="gradient-btn w-full py-5 rounded-xl text-white font-black text-lg tracking-wide flex items-center justify-center gap-3 shadow-2xl mb-4">
                {info.closed ? <Clock className="w-6 h-6" /> : <Aperture className="w-6 h-6" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : "JE COMMENCE MA FORMATION MAINTENANT"}
              </button>
              <div className="flex flex-wrap items-center justify-center gap-4 mt-6">
                {["Accès immédiat", "Paiement sécurisé", "Mobile & PC"].map((badge) => (
                  <span key={badge} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            <p className="text-gray-500 text-sm">
              Des questions ?{" "}
              <a href="/contact" className="text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-2">
                Contactez-nous
              </a>
            </p>
          </div>
        </section>
      </div>
    </>
  );
}

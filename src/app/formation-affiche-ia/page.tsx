"use client";

import { useState } from "react";
import {
  Sparkles, Check, CheckCircle2, ArrowRight,
  Plus, Minus,
  Lightbulb, Palette, Wand2, XCircle,
  Users, GraduationCap, Briefcase,
  Flame, ImagePlus, Layers,
  Zap, Star, Camera, Globe,
  ShoppingBag, Building2, UtensilsCrossed, Megaphone,
  Smartphone, MonitorPlay, Clock, BadgeCheck,
  PlayCircle,
} from "lucide-react";
import { AFFICHE_COURSE_ID } from "@/lib/courses";
import CheckoutModal from "@/components/CheckoutModal";
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
  { text: "Vous avez une idée d'affiche en tête, mais vous ne savez pas comment la réaliser." },
  { text: "Vous dépendez d'un graphiste pour chaque visuel, et ça coûte cher et prend du temps." },
  { text: "Vous essayez l'IA, mais vos résultats ressemblent à des brouillons d'amateur." },
  { text: "Vous ne savez pas rédiger des prompts efficaces pour obtenir ce que vous voulez." },
  { text: "Vos visuels actuels ne représentent pas bien votre business ou votre marque." },
  { text: "Vous aimeriez proposer des services de création graphique, mais vous manquez de méthode." },
];

const OPPORTUNITY_CARDS = [
  { Icon: Zap, title: "Créez en quelques minutes", text: "Ce qui prenait des heures avec Photoshop se fait maintenant en quelques échanges avec l'IA." },
  { Icon: Layers, title: "Tous les styles, tous les secteurs", text: "Restaurant, événement, produit, entreprise, réseaux sociaux — l'IA s'adapte à chaque contexte." },
  { Icon: Globe, title: "Une compétence qui ouvre des portes", text: "Créez pour votre propre business ou développez une activité de création graphique." },
];

const BEFORE_AFTER = [
  { before: "Je ne sais pas créer une belle affiche.", after: "Je transforme une idée en affiche professionnelle." },
  { before: "Je dois attendre un graphiste pour chaque visuel.", after: "Je crée rapidement différents types de visuels moi-même." },
  { before: "Mes prompts IA donnent des résultats médiocres.", after: "Je sais rédiger des prompts qui produisent des résultats précis." },
  { before: "Mes visuels ressemblent à des brouillons.", after: "Mes affiches ont un niveau professionnel." },
];

const MODULES = [
  {
    number: "01", title: "L'IA et la création d'affiches",
    outcome: "Comprendre pourquoi l'IA transforme la création visuelle et quels outils utiliser.",
    points: ["Le potentiel réel de l'IA pour créer des affiches professionnelles", "Les meilleurs outils IA pour la création graphique", "Les principes d'une affiche qui capte l'attention"],
  },
  {
    number: "02", title: "Maîtriser l'art du prompt visuel",
    outcome: "Savoir décrire précisément ce que vous voulez pour obtenir exactement ce que vous imaginez.",
    points: ["La structure d'un prompt efficace pour les visuels", "Les mots-clés qui font la différence entre amateur et professionnel", "Comment itérer et affiner vos créations étape par étape"],
  },
  {
    number: "03", title: "Affiches commerciales & promotionnelles",
    outcome: "Créer des visuels qui donnent envie d'acheter pour vos promotions et publicités.",
    points: ["Affiches de promotion pour boutiques et commerces", "Visuels publicitaires pour Facebook et Instagram", "Affiches de soldes et offres spéciales"],
  },
  {
    number: "04", title: "Affiches pour restaurants & événements",
    outcome: "Créer des affiches appétissantes pour la restauration et des visuels percutants pour les événements.",
    points: ["Menus, plats du jour et affiches de restaurant", "Affiches d'événements culturels, sportifs et soirées", "Flyers pour conférences et formations"],
  },
  {
    number: "05", title: "Affiches entreprises & services",
    outcome: "Donner une image professionnelle à n'importe quelle entreprise ou service.",
    points: ["Affiches institutionnelles pour entreprises", "Visuels pour prestataires de services", "Affiches de recrutement et communications RH"],
  },
  {
    number: "06", title: "Visuels réseaux sociaux & produits",
    outcome: "Créer des contenus visuels optimisés pour chaque plateforme sociale et chaque type de produit.",
    points: ["Visuels Instagram, Facebook, TikTok et LinkedIn", "Affiches produits et packagings", "Posts et stories qui engagent et convertissent"],
  },
  {
    number: "07", title: "Améliorer et retoucher avec l'IA",
    outcome: "Transformer des photos existantes et améliorer des visuels pour un résultat professionnel.",
    points: ["Retoucher et améliorer d'anciennes photos", "Changer les arrière-plans et les éléments d'une image", "Élever la qualité de visuels existants avec l'IA"],
  },
  {
    number: "08", title: "Utiliser cette compétence",
    outcome: "Mettre votre nouvelle compétence au service de vos projets ou de vos clients.",
    points: ["Créer des visuels pour votre propre business", "Comment constituer un portfolio de créations", "Présenter et proposer vos services de création graphique"],
  },
];

const GALLERY_ITEMS = [
  { label: "Affiche Restaurant", gradient: "from-amber-900/60 to-orange-800/40", Icon: UtensilsCrossed, tag: "Restauration" },
  { label: "Affiche Événement", gradient: "from-purple-900/60 to-pink-800/40", Icon: Star, tag: "Événementiel" },
  { label: "Publicité Facebook", gradient: "from-blue-900/60 to-indigo-800/40", Icon: Megaphone, tag: "Réseaux sociaux" },
  { label: "Affiche Produit", gradient: "from-emerald-900/60 to-teal-800/40", Icon: ShoppingBag, tag: "E-commerce" },
  { label: "Affiche Entreprise", gradient: "from-slate-900/60 to-gray-800/40", Icon: Building2, tag: "Corporate" },
  { label: "Flyer Formation", gradient: "from-rose-900/60 to-red-800/40", Icon: GraduationCap, tag: "Éducation" },
];

const AUDIENCE = [
  { Icon: Briefcase, t: "Entrepreneurs & commerçants" },
  { Icon: Users, t: "Community managers" },
  { Icon: Palette, t: "Graphistes & designers" },
  { Icon: Sparkles, t: "Créateurs de contenu" },
  { Icon: Globe, t: "Freelances" },
  { Icon: GraduationCap, t: "Étudiants" },
  { Icon: ShoppingBag, t: "Vendeurs en ligne" },
  { Icon: Camera, t: "Photographes & artistes" },
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
  { q: "Je ne suis pas graphiste. Est-ce que cette formation est pour moi ?", a: "Absolument. Cette formation est spécialement conçue pour les personnes sans formation en design. Vous n'avez pas besoin de maîtriser Photoshop ou un logiciel complexe. L'IA fait le travail de création — vous apprenez à lui donner les bonnes instructions." },
  { q: "Je n'ai jamais utilisé l'IA. Est-ce que je peux quand même apprendre ?", a: "Oui, c'est le point de départ idéal. Nous commençons depuis zéro, en vous expliquant comment fonctionnent les outils IA pour la création visuelle, sans jargon technique." },
  { q: "Est-ce que je peux suivre la formation depuis mon téléphone ?", a: "Oui. La formation est accessible depuis n'importe quel appareil : smartphone, tablette ou ordinateur. Vous pouvez apprendre où que vous soyez." },
  { q: "Pourrai-je créer des affiches pour mon propre business ?", a: "C'est précisément l'objectif. À la fin de la formation, vous saurez créer des visuels professionnels pour promouvoir vos produits, vos services ou votre activité." },
  { q: "Est-ce que je peux utiliser cette compétence pour proposer mes services ?", a: "Oui. La compétence que vous allez acquérir peut vous permettre de créer des affiches pour des clients. La formation couvre également comment présenter et utiliser cette compétence." },
  { q: "À quoi ressembleront mes affiches après la formation ?", a: "Vous serez capable de créer des visuels d'un niveau professionnel : affiches pour restaurants, flyers d'événements, publicités réseaux sociaux, affiches produits, visuels d'entreprise et bien plus." },
];

const OUTCOMES = [
  "Créer des affiches professionnelles pour tout type de secteur",
  "Rédiger des prompts précis qui produisent des résultats visuels puissants",
  "Transformer une idée abstraite en visuel concret",
  "Créer des publicités pour Facebook et Instagram",
  "Réaliser des affiches pour restaurants, événements et entreprises",
  "Améliorer des photos et des visuels existants avec l'IA",
  "Créer des contenus visuels pour les réseaux sociaux",
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
 * Rendu visuel réaliste d'affiches professionnelles générées par l'IA
 */
function PosterMockup({ type }: { type: number }) {
  if (type === 0) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-amber-950 via-amber-900 to-yellow-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-amber-100 border border-amber-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Gastronomie</span>
          <span className="text-[10px] font-bold text-amber-400">15 000 FCFA</span>
        </div>
        <div className="my-auto text-center z-10 py-3">
          <p className="text-[10px] uppercase tracking-widest text-amber-400 font-semibold mb-1">Le Gourmet Parisien</p>
          <h4 className="font-black text-base sm:text-lg text-white leading-tight font-serif">MENU DÉGUSTATION</h4>
          <div className="w-8 h-0.5 bg-amber-500 mx-auto my-2" />
          <p className="text-[10px] text-amber-200/80 italic">Cuisine Raffinée & Produits Frais</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-amber-500/20 text-[9px]">
          <span className="text-amber-300 font-bold">Réservation Ouverte</span>
          <span className="text-amber-400 font-black">★ 4.9</span>
        </div>
      </div>
    );
  }
  if (type === 1) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-950 via-indigo-950 to-pink-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-purple-100 border border-purple-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">Concert Live</span>
          <span className="text-[9px] font-black text-pink-400 uppercase tracking-widest">15-16 AOÛT</span>
        </div>
        <div className="my-auto z-10 py-3">
          <span className="text-[9px] font-bold text-pink-400 uppercase tracking-wider block mb-0.5">Le Plus Grand Festival</span>
          <h4 className="font-black text-lg sm:text-xl text-white leading-none tracking-tight">AFRO NIGHTS <span className="text-pink-500">2026</span></h4>
          <p className="text-[10px] text-purple-200/80 mt-1">Palais des Congrès · Abidjan</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-purple-500/20 text-[9px]">
          <span className="text-pink-300 font-bold">Pass VIP Disponible</span>
          <span className="px-1.5 py-0.5 bg-pink-500 text-white font-black rounded text-[8px]">BILLETTERIE</span>
        </div>
      </div>
    );
  }
  if (type === 2) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-950 via-slate-900 to-cyan-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-blue-100 border border-blue-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">Promo Flash</span>
          <span className="text-[10px] font-black text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-500/30">-50%</span>
        </div>
        <div className="my-auto z-10 py-3">
          <p className="text-[9px] uppercase tracking-wider text-cyan-300 font-bold mb-1">Collection Été 2026</p>
          <h4 className="font-black text-base sm:text-lg text-white leading-tight uppercase">MODE & STYLE UNIQUE</h4>
          <p className="text-[10px] text-blue-200/80 mt-1">Livraison Gratuite dès 25 000 FCFA</p>
        </div>
        <div className="z-10 pt-2 border-t border-blue-500/20">
          <div className="w-full py-1.5 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-black text-[9px] uppercase tracking-wider text-center rounded">
            PROFITER DE L'OFFRE →
          </div>
        </div>
      </div>
    );
  }
  if (type === 3) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-emerald-100 border border-emerald-500/30 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">High-Tech</span>
          <span className="text-[9px] font-bold text-teal-300">Nouveau</span>
        </div>
        <div className="my-auto z-10 py-3">
          <p className="text-[9px] uppercase tracking-widest text-emerald-400 font-bold mb-1">Innovation 2026</p>
          <h4 className="font-black text-base sm:text-lg text-white leading-tight">AUDIO PRO <span className="text-emerald-400">X1</span></h4>
          <p className="text-[10px] text-emerald-200/80 mt-1">Réduction de Bruit & Autonomie 40H</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-emerald-500/20 text-[9px]">
          <span className="text-emerald-300 font-black">49 900 FCFA</span>
          <span className="text-teal-400 font-bold">En Stock</span>
        </div>
      </div>
    );
  }
  if (type === 4) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-slate-950 via-gray-900 to-blue-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-slate-100 border border-slate-700/40 group-hover:scale-[1.02] transition-transform duration-500">
        <div className="flex justify-between items-start z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Business Summit</span>
          <span className="text-[9px] font-bold text-amber-400">Édition 2026</span>
        </div>
        <div className="my-auto z-10 py-3">
          <p className="text-[9px] uppercase tracking-widest text-slate-400 font-semibold mb-1">Conférence & Networking</p>
          <h4 className="font-black text-base sm:text-lg text-white leading-tight">AFRICA TECH LEADERS</h4>
          <p className="text-[10px] text-slate-300/80 mt-1">L'IA au Service des Entreprises</p>
        </div>
        <div className="flex justify-between items-center z-10 pt-2 border-t border-slate-800 text-[9px]">
          <span className="text-slate-400 font-bold">30 Speakers</span>
          <span className="text-amber-400 font-bold">Réservation →</span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-rose-950 via-orange-950 to-amber-950 p-4 sm:p-5 flex flex-col justify-between relative overflow-hidden text-rose-100 border border-rose-500/30 group-hover:scale-[1.02] transition-transform duration-500">
      <div className="flex justify-between items-start z-10">
        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">Masterclass</span>
        <span className="text-[9px] font-black text-orange-400">En Ligne</span>
      </div>
      <div className="my-auto z-10 py-3">
        <p className="text-[9px] uppercase tracking-widest text-orange-400 font-bold mb-1">Formation Pratique</p>
        <h4 className="font-black text-base sm:text-lg text-white leading-tight">DESIGN & IA GÉNÉRATIVE</h4>
        <p className="text-[10px] text-rose-200/80 mt-1">Maîtrisez les Outils du Futur</p>
      </div>
      <div className="flex justify-between items-center z-10 pt-2 border-t border-rose-500/20 text-[9px]">
        <span className="text-orange-300 font-bold">Certificat Inclus</span>
        <span className="px-1.5 py-0.5 bg-orange-600 text-white font-black rounded text-[8px]">REJOINDRE</span>
      </div>
    </div>
  );
}

/**
 * Vos affiches générées avec l'IA. Ajoutez une ligne par visuel — autant
 * que vous voulez, de tous les types — en déposant le fichier dans
 * /public/affiches/ (format 4:3 conseillé) :
 *   { src: "/affiches/mon-fichier.jpg", tag: "Mon type" },
 * Tant qu'un fichier n'existe pas encore, un mockup de remplacement
 * s'affiche à sa place — aucun risque d'image cassée.
 */
const AFFICHE_GALLERY: { src: string; tag: string }[] = [
  { src: "/affiches/1-restaurant.jpg", tag: "Gastronomie" },
  { src: "/affiches/2-evenement.jpg", tag: "Événementiel" },
  { src: "/affiches/3-promo.jpg", tag: "Promo Flash" },
  { src: "/affiches/4-produit.jpg", tag: "High-Tech" },
  { src: "/affiches/5-entreprise.jpg", tag: "Business Summit" },
  { src: "/affiches/6-masterclass.jpg", tag: "Masterclass" },
];

export default function FormationAfficheIAPage() {
  const { info, checkoutOpen, setCheckoutOpen, showSticky, handleBuy } = useSalesPageCheckout(AFFICHE_COURSE_ID);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useScrollReveal();

  return (
    <>
      {checkoutOpen && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          itemId={AFFICHE_COURSE_ID}
          itemTitle={info.title}
          price={info.price}
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
              ACCÉDER À LA FORMATION →
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
                <span className="gradient-text">affiches professionnelles</span>
                {" "}en quelques minutes…
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-up ad-2 mt-6">
                Sans maîtriser Photoshop. Sans payer un graphiste.{" "}
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
                <ImagePlus className="w-5 h-5" />
                JE VEUX CRÉER DES AFFICHES AVEC L'IA
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
                  <span className="ml-3 text-xs text-gray-500 font-mono hidden sm:block">formation-affiche-ia — résultats créés avec l'IA</span>
                </div>
                <div className="p-3 bg-black/40">
                  <ImageCarousel
                    items={AFFICHE_GALLERY}
                    fallbackCount={6}
                    Fallback={PosterMockup}
                    cardClassName="w-56 sm:w-64 aspect-[4/3] rounded-xl overflow-hidden shadow-lg shrink-0 relative"
                  />
                </div>
              </div>
              <div className="absolute -top-4 right-4 glass-panel rounded-2xl px-4 py-3 border-emerald-500/20 shadow-xl hidden sm:block">
                <p className="text-xs text-gray-400 mb-0.5">Types d'affiches maîtrisées</p>
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
                Créer une belle affiche…<br />
                <span className="gradient-text">ça ne devrait pas être aussi compliqué.</span>
              </h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
                Pourtant, voilà ce que vivent la plupart des personnes qui essaient de créer des visuels professionnels.
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
                  <span className="gradient-text">va transformer la création graphique.</span>
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
                Un parcours pratique, module par module, pour passer de débutant à créateur d'affiches professionnelles avec l'IA.
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
                Des affiches qui{" "}
                <span className="gradient-text">donnent envie de créer</span>
              </SectionTitle>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Voici les types de visuels que vous serez capable de créer après cette formation. Chaque affiche, générée avec l'IA, en quelques minutes.
              </p>
            </div>

            <div className="mb-10 reveal">
              <ImageCarousel
                items={AFFICHE_GALLERY}
                fallbackCount={6}
                Fallback={PosterMockup}
                cardClassName="w-56 sm:w-64 aspect-[4/3] rounded-2xl overflow-hidden shadow-xl shrink-0 relative"
              />
            </div>

            <div className="mt-10 text-center reveal">
              <button id="gallery-cta" onClick={handleBuy} className="gradient-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-black text-base">
                <Wand2 className="w-5 h-5" />
                JE COMMENCE À CRÉER DES AFFICHES
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
              <p className="text-xl font-black text-white mb-3">Vous n'avez pas besoin d'être un expert en design pour commencer.</p>
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
              <button id="pricing-cta" onClick={handleBuy} className="gradient-btn w-full py-4 rounded-xl text-white font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl">
                <ArrowRight className="w-5 h-5" />
                ACCÉDER À LA FORMATION — {info.price}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">Accès immédiat après paiement · Paiement sécurisé</p>
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
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-sm font-bold">Accès immédiat après paiement</span>
              </div>
              <div className="flex items-end justify-center gap-3 mb-2">
                <span className="text-5xl font-black text-white">{info.price}</span>
              </div>
              {info.originalPrice && (
                <p className="text-gray-500 line-through text-sm mb-8">au lieu de {info.originalPrice}</p>
              )}
              <button id="final-cta" onClick={handleBuy} className="gradient-btn w-full py-5 rounded-xl text-white font-black text-lg tracking-wide flex items-center justify-center gap-3 shadow-2xl mb-4">
                <ImagePlus className="w-6 h-6" />
                JE COMMENCE MA FORMATION MAINTENANT
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

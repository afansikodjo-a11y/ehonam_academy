"use client";

import { useState } from "react";
import {
  Flame, Sparkles, CheckCircle2, ArrowRight, ArrowDown,
  Plus, Minus, Lightbulb, Wand2, XCircle, X,
  GraduationCap, Briefcase, Rocket, Globe,
  Database, Bug, Smartphone, Building2,
  Layers, Target, Zap,
  UtensilsCrossed, Calendar, LayoutDashboard, ClipboardList,
  TrendingUp, PenTool, Code2, Rows3, Clock,
} from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import { MASTERCLASS_COURSE_ID } from "@/lib/courses";
import CheckoutModal from "@/components/CheckoutModal";
import WaitlistModal from "@/components/WaitlistModal";
import { useSalesPageCheckout } from "@/lib/useSalesPageCheckout";
import { useScrollReveal } from "@/lib/useScrollReveal";

const TRUST_PILLS = [
  "Aucune compétence technique requise",
  "Méthode pas à pas",
  "Pensée pour l'Afrique francophone",
  "Accès immédiat",
];

const PAIN_POINTS = [
  { text: "Vous avez imaginé une application, mais vous ne savez pas comment la créer." },
  { text: "Vous avez demandé un devis à un développeur et le prix vous a refroidi." },
  { text: "Vous avez commencé à apprendre le code, mais vous vous êtes perdu dans la technique." },
  { text: "Vous avez plusieurs idées, mais aucune n'est encore devenue un produit." },
];

const AI_CAPABILITIES = [
  { Icon: Layers, text: "Structurer votre projet" },
  { Icon: Code2, text: "Générer du code" },
  { Icon: LayoutDashboard, text: "Créer des interfaces" },
  { Icon: Database, text: "Connecter des données" },
  { Icon: Bug, text: "Corriger des erreurs" },
  { Icon: TrendingUp, text: "Améliorer une application" },
  { Icon: Rocket, text: "Préparer la mise en ligne" },
];

const BEFORE_STEPS = ["Idée", "Blocage", "Complexité", "Abandon"];
const AFTER_STEPS = ["Idée", "IA", "Application", "Mise en ligne", "Opportunité business"];

const MODULES = [
  {
    number: "01", title: "Clarifier et structurer son idée",
    outcome: "Partir d'une idée floue et la transformer en projet clair, prêt à être construit.",
    points: ["Clarifier le problème que vous voulez résoudre", "Définir les fonctionnalités essentielles de votre application", "Éviter les erreurs de cadrage qui bloquent la plupart des projets"],
  },
  {
    number: "02", title: "Transformer une idée en cahier des charges exploitable par l'IA",
    outcome: "Écrire un document clair que l'IA peut comprendre et suivre pour construire votre application.",
    points: ["Structurer votre idée en spécifications précises", "Décrire les écrans et les fonctionnalités attendues", "Préparer un point de départ solide pour le développement"],
  },
  {
    number: "03", title: "Apprendre à communiquer efficacement avec l'IA",
    outcome: "Savoir donner les bonnes instructions pour obtenir exactement ce que vous voulez.",
    points: ["La structure d'un prompt qui fonctionne", "Comment itérer et corriger le tir avec l'IA", "Les erreurs de communication qui font perdre du temps"],
  },
  {
    number: "04", title: "Construire progressivement une véritable application web avec le Vibe Coding",
    outcome: "Passer de votre cahier des charges à une première version fonctionnelle de votre application.",
    points: ["Générer les interfaces de votre application avec l'IA", "Construire étape par étape, sans tout faire d'un coup", "Garder le contrôle sur ce que l'IA construit pour vous"],
  },
  {
    number: "05", title: "Connecter et gérer les données",
    outcome: "Donner à votre application la capacité de stocker et d'organiser de vraies informations.",
    points: ["Comprendre à quoi sert une base de données, simplement", "Connecter votre application à une base de données avec l'IA", "Gérer les informations de vos utilisateurs en sécurité"],
  },
  {
    number: "06", title: "Ajouter des fonctionnalités intelligentes avec l'IA",
    outcome: "Enrichir votre application avec des fonctionnalités qui la rendent réellement utile.",
    points: ["Ajouter des comptes utilisateurs et des permissions", "Intégrer des fonctionnalités avancées avec l'aide de l'IA", "Adapter votre application à votre cas d'usage précis"],
  },
  {
    number: "07", title: "Corriger les erreurs et faire évoluer son application",
    outcome: "Ne plus être bloqué face à un bug — savoir comment le résoudre avec l'IA.",
    points: ["Comprendre et transmettre une erreur à l'IA", "La méthode pour déboguer sans paniquer", "Faire évoluer votre application dans le temps"],
  },
  {
    number: "08", title: "Mettre son application en ligne et réfléchir à sa monétisation",
    outcome: "Rendre votre application accessible au monde et envisager comment elle peut générer de la valeur.",
    points: ["Déployer votre application en ligne", "Les bases pour la présenter à de premiers utilisateurs", "Les pistes pour transformer votre application en opportunité business"],
  },
];

const PROJECT_FLOW = [
  { label: "Idée", Icon: Lightbulb },
  { label: "Structure", Icon: Layers },
  { label: "Prompts", Icon: PenTool },
  { label: "Développement avec l'IA", Icon: Wand2 },
  { label: "Test", Icon: ClipboardList },
  { label: "Amélioration", Icon: TrendingUp },
  { label: "Application", Icon: Rocket },
];

const CREATIONS = [
  { Icon: ClipboardList, t: "Application de gestion" },
  { Icon: Calendar, t: "Plateforme de réservation" },
  { Icon: GraduationCap, t: "Outil pour une école" },
  { Icon: UtensilsCrossed, t: "Outil pour un restaurant" },
  { Icon: Rows3, t: "CRM" },
  { Icon: LayoutDashboard, t: "Plateforme de formation" },
  { Icon: Building2, t: "Application interne d'entreprise" },
  { Icon: Briefcase, t: "Outil métier" },
  { Icon: Rocket, t: "MVP de startup" },
  { Icon: Sparkles, t: "Micro-SaaS" },
];

const FOR_YOU = [
  "Vous êtes entrepreneur.",
  "Vous avez une idée d'application.",
  "Vous êtes porteur de projet.",
  "Vous êtes freelance.",
  "Vous êtes créateur de produits digitaux.",
  "Vous voulez créer des outils pour vos clients.",
  "Vous êtes professionnel dans un domaine et voulez digitaliser votre activité.",
  "Vous n'êtes pas développeur mais voulez créer.",
];

const NOT_FOR_YOU = [
  "Vous cherchez une formation académique complète en programmation.",
  "Vous voulez devenir développeur professionnel en quelques jours.",
  "Vous ne voulez pas expérimenter.",
  "Vous recherchez une solution magique sans implication personnelle.",
];

const AFRICA_POINTS = [
  { Icon: Building2, text: "Les entreprises africaines ont des besoins précis, encore peu couverts par les outils existants." },
  { Icon: Globe, text: "La digitalisation reste une opportunité immense sur la majorité des marchés du continent." },
  { Icon: Target, text: "Des outils pensés pour vos réalités locales, pas de simples copies de solutions étrangères." },
  { Icon: TrendingUp, text: "La possibilité de construire des solutions pour votre propre marché — et de les proposer à d'autres entreprises." },
];

const BUSINESS_USES = [
  "Créer votre propre produit",
  "Tester une idée de startup",
  "Créer un SaaS",
  "Proposer des solutions aux entreprises",
  "Créer des outils internes",
  "Vendre des applications sur mesure",
  "Transformer une expertise métier en produit numérique",
];

const OFFER_INCLUDES = [
  "Masterclass Vibe Coding",
  "Méthode étape par étape",
  "Démonstrations pratiques",
  "Construction d'une application",
  "Méthodes de prompting",
  "Méthode de correction et d'amélioration",
  "Mise en ligne",
  "Introduction à la monétisation",
];

const FAQ = [
  { q: "Faut-il savoir coder ?", a: "Non. La masterclass est justement conçue pour les personnes qui ne savent pas coder. Vous apprenez à piloter l'IA, pas à mémoriser un langage de programmation." },
  { q: "Est-ce adapté aux débutants ?", a: "Oui, c'est le point de départ idéal. Aucune expérience technique n'est nécessaire pour commencer." },
  { q: "Est-ce que je peux travailler sur ma propre idée ?", a: "Oui, c'est même l'objectif. La méthode est pensée pour être appliquée directement à votre projet, pas à un exemple générique." },
  { q: "Quel ordinateur faut-il ?", a: "Un ordinateur portable classique (Windows ou Mac) avec une connexion internet suffit. Aucune machine puissante n'est nécessaire." },
  { q: "Est-ce que l'IA crée réellement l'application ?", a: "L'IA génère une grande partie du code et des interfaces, mais c'est vous qui pilotez : vous décrivez ce que vous voulez, vous validez, vous ajustez. Vous restez aux commandes du projet." },
  { q: "Est-ce que je pourrai mettre mon application en ligne ?", a: "Oui, la mise en ligne fait partie de la masterclass — vous repartez avec une application accessible, pas seulement un fichier sur votre ordinateur." },
  { q: "Est-ce que cela permet de créer un SaaS ?", a: "La méthode permet de construire une première version fonctionnelle d'un SaaS ou d'un outil métier — un excellent point de départ pour tester une idée avant d'aller plus loin." },
  { q: "Est-ce que la masterclass est adaptée à l'Afrique ?", a: "Oui, elle est pensée pour le contexte africain francophone : les exemples, la méthode et les outils utilisés tiennent compte de cette réalité." },
  { q: "Combien de temps faut-il pour apprendre ?", a: "La méthode est conçue pour être suivie à votre rythme. Ce qui compte n'est pas la vitesse, mais d'avancer régulièrement, étape par étape, jusqu'à une application fonctionnelle." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
      {children}
    </h2>
  );
}

export default function MasterclassVibeCodingClient() {
  const { info, checkoutOpen, setCheckoutOpen, waitlistOpen, setWaitlistOpen, showSticky, handleBuy } = useSalesPageCheckout(MASTERCLASS_COURSE_ID);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  useScrollReveal();

  return (
    <>
      {checkoutOpen && (
        <CheckoutModal
          open={checkoutOpen}
          onClose={() => setCheckoutOpen(false)}
          itemId={MASTERCLASS_COURSE_ID}
          itemTitle={info.title}
          price={info.price}
          itemType={"course"}
        />
      )}
      {waitlistOpen && (
        <WaitlistModal
          open={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          itemId={MASTERCLASS_COURSE_ID}
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
            <button
              id="sticky-cta"
              onClick={handleBuy}
              className="gradient-btn flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-black text-sm tracking-wide text-center"
            >
              {info.closed ? "REJOINDRE LA LISTE D'ATTENTE →" : "JE VEUX CRÉER MON APPLICATION →"}
            </button>
          </div>
        </div>
      </div>

      <div className="relative min-h-screen">
        {/* Background glows */}
        <div className="glow-blob w-[600px] h-[600px] bg-emerald-600 top-[-5%] right-[-15%] animated-glow-2" />
        <div className="glow-blob w-[500px] h-[500px] bg-orange-600 top-[30%] left-[-10%] animated-glow-1" />

        {/* ══════════ HERO ══════════ */}
        <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 vibe-grid pointer-events-none" />
          <div className="relative max-w-7xl mx-auto z-10">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-up ad-1">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5" /> Masterclass Vibe Coding
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> Intelligence artificielle
              </span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight animate-fade-up ad-1 mb-4">
                Transformez votre idée en{" "}
                <span className="gradient-text">véritable application</span>,
                {" "}même si vous ne savez pas coder.
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-up ad-2 mt-6">
                La méthode <strong className="text-white">Vibe Coding</strong> pour piloter l'intelligence artificielle comme un assistant de développement — et faire enfin exister ce que vous avez en tête.
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

            <div className="flex flex-col items-center gap-4 mb-4 animate-fade-up ad-3">
              <button
                id="hero-cta-primary"
                onClick={handleBuy}
                className="gradient-btn w-full sm:w-auto px-8 py-4 rounded-xl text-white font-black text-base sm:text-lg tracking-wide flex items-center justify-center gap-2 shadow-2xl"
              >
                {info.closed ? <Clock className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : "JE VEUX CRÉER MON APPLICATION"}
              </button>
              <p className="text-xs text-gray-500">
                {info.closed ? "Vous serez averti(e) dès l'ouverture de la prochaine session" : `Accédez à la masterclass pour seulement ${info.price}`}
              </p>
            </div>

            {!info.closed && (
              <div className="flex items-center justify-center gap-3 mb-16 animate-fade-up ad-3">
                <span className="text-gray-500 line-through text-lg">{info.originalPrice}</span>
                <span className="text-3xl font-black text-emerald-400">{info.price}</span>
                <span className="text-xs font-black text-orange-400 uppercase tracking-wide px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20">
                  Offre Masterclass
                </span>
              </div>
            )}

            {/* Visuel hero : idée → IA → application */}
            <div className="relative max-w-4xl mx-auto animate-fade-up ad-3">
              <div className="glass-panel rounded-3xl border-white/10 overflow-hidden shadow-2xl">
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-white/5 bg-black/30">
                  <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs text-gray-500 font-mono hidden sm:block">vibe-coding — de l'idée à l'application</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 sm:p-10 bg-black/40 items-center">
                  {[
                    { Icon: Lightbulb, label: "Votre idée", sub: "Ce que vous avez en tête" },
                    { Icon: Wand2, label: "Vibe Coding", sub: "Vous pilotez l'IA" },
                    { Icon: Smartphone, label: "Votre application", sub: "Fonctionnelle, en ligne" },
                  ].map(({ Icon, label, sub }, i) => (
                    <div key={label} className="flex sm:flex-col items-center gap-4 sm:gap-0 sm:text-center">
                      <div className="w-16 h-16 rounded-2xl gradient-btn flex items-center justify-center shrink-0 sm:mx-auto sm:mb-4 shadow-lg">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="sm:mt-0">
                        <p className="font-black text-white">{label}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                      </div>
                      {i < 2 && (
                        <ArrowDown className="w-5 h-5 text-emerald-400/60 mx-auto shrink-0 sm:hidden" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 2. LE PROBLÈME ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">Vous reconnaissez-vous ?</Eyebrow>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 leading-tight">
                Vous avez une idée…<br />
                <span className="gradient-text">mais elle reste encore une idée.</span>
              </h2>
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
              <div className="inline-block glass-panel rounded-2xl px-8 py-6 border-orange-500/15 max-w-2xl">
                <p className="text-xl sm:text-2xl font-black text-white">Le problème n'est pas le manque d'idées.</p>
                <p className="text-orange-400 font-bold mt-2 text-lg">Le problème, c'est le passage de l'idée à l'exécution.</p>
              </div>
            </div>

            <div className="mt-10 text-center reveal">
              <button onClick={handleBuy} className="gradient-btn inline-flex items-center gap-2 px-8 py-4 rounded-xl text-white font-black text-base">
                {info.closed ? <Clock className="w-5 h-5" /> : <Rocket className="w-5 h-5" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : "JE VEUX CRÉER MON APPLICATION"}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                {info.closed ? "Vous serez averti(e) dès l'ouverture de la prochaine session" : `Accédez à la masterclass pour seulement ${info.price}`}
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ 3. LE CHANGEMENT ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-emerald-500/15 reveal">
              <div className="text-center mb-10">
                <Eyebrow>Et s'il existait un autre chemin ?</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 leading-tight">
                  Et si vous pouviez simplement{" "}
                  <span className="gradient-text">expliquer à une IA</span>{" "}
                  ce que vous voulez construire ?
                </h2>
                <p className="text-gray-300 mt-4 text-lg max-w-2xl mx-auto">
                  C'est le principe du Vibe Coding : vous décrivez votre projet, vous travaillez avec l'IA pour lui donner vie,
                  et vous gardez le contrôle à chaque étape. <strong className="text-white">Vous êtes le pilote. L'IA est votre assistant.</strong>
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {AI_CAPABILITIES.map(({ Icon, text }, i) => (
                  <div key={i} className="glass-panel rounded-xl border-white/5 p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5 text-emerald-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-200">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 4. LA TRANSFORMATION ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">La transformation</Eyebrow>
              <SectionTitle>
                D'une idée bloquée{" "}
                <span className="gradient-text">à une application en ligne</span>
              </SectionTitle>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="glass-panel rounded-2xl border-red-500/15 p-6 sm:p-8 reveal">
                <span className="text-[10px] font-black uppercase tracking-widest text-red-400 block mb-6 text-center">Avant</span>
                <div className="space-y-0">
                  {BEFORE_STEPS.map((step, i) => (
                    <div key={step}>
                      <div className="flex items-center gap-3 py-2.5">
                        <div className="w-8 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                          <XCircle className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="text-gray-300 font-semibold text-sm">{step}</span>
                      </div>
                      {i < BEFORE_STEPS.length - 1 && (
                        <div className="pl-4"><ArrowDown className="w-4 h-4 text-white/10" /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-panel rounded-2xl border-emerald-500/20 p-6 sm:p-8 reveal">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 block mb-6 text-center">Après</span>
                <div className="space-y-0">
                  {AFTER_STEPS.map((step, i) => (
                    <div key={step}>
                      <div className="flex items-center gap-3 py-2.5">
                        <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-white font-semibold text-sm">{step}</span>
                      </div>
                      {i < AFTER_STEPS.length - 1 && (
                        <div className="pl-4"><ArrowDown className="w-4 h-4 text-emerald-500/30" /></div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 5. LE PROGRAMME ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Le programme</Eyebrow>
              <SectionTitle>
                Ce que vous allez{" "}
                <span className="gradient-text">apprendre et construire</span>
              </SectionTitle>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Un parcours pratique, module par module, pour passer de l'idée à une application fonctionnelle.
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
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
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

        {/* ══════════ 6. LE PROJET CONCRET ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">Pas seulement de la théorie</Eyebrow>
              <SectionTitle>
                Vous n'allez pas seulement apprendre.{" "}
                <span className="gradient-text">Vous allez construire.</span>
              </SectionTitle>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Pendant la masterclass, vous allez progressivement faire passer votre idée par ces étapes, jusqu'à obtenir une application fonctionnelle.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4 reveal">
              {PROJECT_FLOW.map(({ label, Icon }, i) => (
                <div key={label} className="glass-panel rounded-2xl border-white/5 p-4 text-center relative">
                  <span className="absolute top-2 right-2 text-xl font-black text-white/5">{String(i + 1).padStart(2, "0")}</span>
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3 mx-auto">
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <p className="text-white font-bold text-xs leading-snug">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════ 7. CE QUE VOUS POURREZ CRÉER ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Des idées concrètes</Eyebrow>
              <SectionTitle>
                Ce que vous pourrez{" "}
                <span className="gradient-text">créer avec cette méthode</span>
              </SectionTitle>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {CREATIONS.map(({ Icon, t }, i) => (
                <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-5 border-white/5 text-center reveal">
                  <div className="w-11 h-11 rounded-xl gradient-btn mx-auto flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-200 text-xs font-semibold leading-snug">{t}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 max-w-xl mx-auto text-sm reveal">
              Votre projet n'a pas besoin d'être exactement l'un de ces exemples.{" "}
              <strong className="text-white">La méthode peut être adaptée à votre propre idée.</strong>
            </p>
          </div>
        </section>

        {/* ══════════ 8. POUR QUI ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-8 border-emerald-500/15 reveal">
              <h3 className="text-xl font-black text-white mb-6">Cette masterclass est faite pour vous si…</h3>
              <ul className="space-y-3">
                {FOR_YOU.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-panel rounded-2xl p-8 border-white/5 reveal">
              <h3 className="text-xl font-black text-white mb-6">Ce n'est probablement pas pour vous si…</h3>
              <ul className="space-y-3">
                {NOT_FOR_YOU.map((t, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-400">
                    <X className="w-4.5 h-4.5 text-gray-500 shrink-0 mt-0.5" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ══════════ 10. CONTEXTE AFRICAIN ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-orange-500/15 reveal">
              <div className="text-center mb-10">
                <Eyebrow color="orange">Pensée pour l'Afrique francophone</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 leading-tight">
                  Et si les outils numériques que nous utilisons chaque jour{" "}
                  <span className="gradient-text">étaient aussi créés par nous ?</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                {AFRICA_POINTS.map(({ Icon, text }, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-orange-400" />
                    </div>
                    <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 11. IA + BUSINESS ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12 reveal">
              <Eyebrow>Au-delà de votre propre projet</Eyebrow>
              <SectionTitle>
                Une compétence qui peut devenir{" "}
                <span className="gradient-text">une nouvelle source d'opportunités</span>
              </SectionTitle>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {BUSINESS_USES.map((u, i) => (
                <div key={i} className="flex items-center gap-3 glass-panel rounded-xl border-white/5 px-5 py-4 reveal">
                  <Zap className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
                  <span className="text-gray-200 text-sm font-medium">{u}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-500 max-w-xl mx-auto reveal">
              Cette compétence ouvre des portes, sans garantie de résultat : ce que vous en ferez dépendra de votre projet, de votre marché et de votre implication.
            </p>
          </div>
        </section>

        {/* ══════════ 12. CE QUI EST INCLUS ══════════ */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12 reveal">
              <Eyebrow color="orange">L'offre</Eyebrow>
              <SectionTitle>
                Ce que vous recevez{" "}
                <span className="gradient-text">dans la masterclass</span>
              </SectionTitle>
            </div>
            <div className="glass-panel rounded-3xl p-8 sm:p-10 border-emerald-500/15 reveal">
              <div className="space-y-3">
                {OFFER_INCLUDES.map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl gradient-btn flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-gray-200 text-sm font-medium flex-1">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════ 13. PRIX ══════════ */}
        <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10 reveal">
              <Eyebrow>L'offre masterclass</Eyebrow>
              <SectionTitle>
                Transformez votre idée en application,{" "}
                <span className="gradient-text">dès aujourd'hui</span>
              </SectionTitle>
            </div>
            <div className="glass-panel rounded-3xl p-8 sm:p-10 border-emerald-500/20 shadow-2xl reveal text-center">
              {info.closed ? (
                <p className="text-orange-300 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 mb-6 text-sm">
                  Les inscriptions pour cette session sont fermées. Rejoignez la liste d'attente pour être averti(e) de la prochaine session.
                </p>
              ) : (
                <>
                  <p className="text-gray-400 text-sm mb-3">Accès complet à la masterclass</p>
                  <div className="flex items-end justify-center gap-3 mb-2">
                    <span className="text-5xl sm:text-6xl font-black text-white">{info.price}</span>
                  </div>
                  {info.originalPrice && (
                    <div className="flex items-center justify-center gap-2 mb-6">
                      <span className="text-gray-500 line-through text-sm">{info.originalPrice}</span>
                      <span className="text-xs font-black text-orange-400 px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 uppercase tracking-wide">
                        Économisez 17 500 FCFA
                      </span>
                    </div>
                  )}
                </>
              )}
              <p className="text-white font-bold mb-6 max-w-md mx-auto">
                Transformez votre idée en véritable application web grâce à l'IA, même si vous ne savez pas coder.
              </p>
              <button
                id="pricing-cta"
                onClick={handleBuy}
                className="gradient-btn w-full py-4 rounded-xl text-white font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl"
              >
                {info.closed ? <Clock className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : "JE VEUX ACCÉDER À LA MASTERCLASS"}
              </button>
              <p className="text-center text-xs text-gray-500 mt-4">
                {info.closed ? "Vous serez averti(e) dès l'ouverture de la prochaine session" : `Accédez à la masterclass pour seulement ${info.price} · Accès immédiat`}
              </p>
            </div>
          </div>
        </section>

        {/* ══════════ 14. FAQ ══════════ */}
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

        {/* ══════════ 15. CTA FINAL ══════════ */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 vibe-grid pointer-events-none opacity-60" />
          <div className="glow-blob w-[600px] h-[600px] bg-emerald-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animated-glow-1 opacity-15" />

          <div className="relative max-w-4xl mx-auto z-10 text-center reveal">
            <Eyebrow color="orange">La décision vous appartient</Eyebrow>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-4 mb-6 leading-tight">
              Votre prochaine application{" "}
              <span className="gradient-text">ne devrait peut-être pas rester une idée.</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-2">
              Vous avez l'idée. L'IA peut vous aider à construire.
            </p>
            <p className="text-xl font-bold text-white max-w-2xl mx-auto leading-relaxed mb-12">
              La masterclass vous montre comment commencer.
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
              <button
                id="final-cta"
                onClick={handleBuy}
                className="gradient-btn w-full py-5 rounded-xl text-white font-black text-lg tracking-wide flex items-center justify-center gap-3 shadow-2xl mb-4"
              >
                {info.closed ? <Clock className="w-6 h-6" /> : <Rocket className="w-6 h-6" />}
                {info.closed ? "REJOINDRE LA LISTE D'ATTENTE" : `JE COMMENCE MAINTENANT — ${info.price}`}
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

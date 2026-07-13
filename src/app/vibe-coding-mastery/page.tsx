"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Sparkles, Rocket, Check, ShieldCheck, ArrowRight,
  Plus, Minus, CreditCard, Boxes, Database, GitBranch, Cloud,
  Wand2, XCircle, Hourglass, Wallet, BadgeCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCourse, VIBE_COURSE_ID } from "@/lib/courses";
import CheckoutModal from "@/components/CheckoutModal";

const course = getCourse(VIBE_COURSE_ID);
const PRICE = course?.price ?? "15 000 FCFA";
const ORIGINAL_PRICE = course?.originalPrice ?? "85 000 FCFA";
const TITLE = course?.title ?? "Vibe Coding Mastery";

const TECH_STACK = [
  { name: "Antigravity", Icon: Sparkles },
  { name: "Claude Code", Icon: Wand2 },
  { name: "Gemini", Icon: Zap },
  { name: "Supabase", Icon: Database },
  { name: "Vercel", Icon: Cloud },
  { name: "Git", Icon: GitBranch },
  { name: "GitHub", Icon: Boxes },
];

const PROJECTS = [
  { icon: "💡", title: "SaaS Facturation IA", time: "Généré en 4h" },
  { icon: "📈", title: "Dashboard Crypto", time: "Généré en 6h" },
  { icon: "🎨", title: "Créateur de Landing", time: "Généré en 2h" },
  { icon: "🤖", title: "Agent Client Discord", time: "Généré en 5h" },
  { icon: "🏋️", title: "Planificateur Fitness", time: "Généré en 3h" },
];

const PROBLEMS = [
  {
    Icon: XCircle,
    title: "L'enfer de la syntaxe",
    text: "Passer des heures à traquer une virgule manquante ou une accolade mal fermée au lieu de vous concentrer sur la logique et la valeur de votre produit.",
  },
  {
    Icon: Wallet,
    title: "Coûts astronomiques",
    text: "Dépenser des sommes énormes en sous-traitant à des agences ou freelances pour un MVP instable qui ne correspond pas exactement à vos attentes.",
  },
  {
    Icon: Hourglass,
    title: "Le syndrome du sur-place",
    text: "Apprendre pendant des mois sans jamais rien lancer de concret, par manque de temps ou découragement face à la complexité des frameworks modernes.",
  },
];

const METHOD_FEATURES = [
  {
    title: "Rapidité multipliée par 10",
    text: "Ce qui prenait autrefois des semaines à coder se réalise désormais en quelques heures de « vibe » active avec l'agent.",
  },
  {
    title: "Autonomie technique complète",
    text: "Créez, corrigez et faites évoluer vos applications sans dépendre d'un tiers et sans barrière d'entrée technique.",
  },
  {
    title: "Focalisation sur l'utilisateur",
    text: "Passez 90 % de votre temps sur l'expérience utilisateur, le marketing et le produit, et seulement 10 % sur le code.",
  },
];

const PROGRAM = [
  {
    num: "Étape 01",
    title: "Fondations & Écosystème IA",
    text: "Découvrez la boîte à outils ultime du Vibe Coder. Installez et configurez les outils phares (Antigravity, Claude Code, Gemini) pour maximiser votre efficacité.",
    points: [
      "Prise en main d'Antigravity pour le co-développement",
      "Lancement rapide de Claude Code dans votre terminal",
      "Modèles Gemini : paramètres avancés de contexte",
    ],
  },
  {
    num: "Étape 02",
    title: "L'Art du Prompting Structurel",
    text: "Apprenez à rédiger des briefs précis et des prompts hiérarchisés pour que l'IA comprenne la structure de votre application du premier coup, sans s'égarer.",
    points: [
      "Rédaction de documents de spécifications pour l'IA",
      "Guidage itératif étape par étape (prompt chaining)",
      "Gestion du contexte et des jetons (token management)",
    ],
  },
  {
    num: "Étape 03",
    title: "Débogage & Résolution Contextuelle",
    text: "Savoir quoi faire quand l'IA se trompe ou tourne en boucle. La méthodologie pour isoler les bugs, fournir les bons logs et faire corriger l'agent.",
    points: [
      "Lecture et transmission des logs de la console",
      "Technique du « sandboxing » pour tester les modules",
      "Briser les boucles d'erreurs récurrentes de l'IA",
    ],
  },
  {
    num: "Étape 04",
    title: "Déploiement Cloud & Supabase",
    text: "Mettez votre produit entre les mains de vos utilisateurs. Connectez votre backend sur Supabase et déployez en continu sur Vercel en quelques secondes.",
    points: [
      "Déploiement automatisé en production sur Vercel",
      "Base de données SQL et authentification avec Supabase",
      "Intégration et sécurisation des webhooks de paiement",
    ],
  },
];

const BONUSES = [
  {
    badge: "BONUS #1",
    title: "Le Discord privé des Vibe Coders",
    text: "Ne restez jamais bloqué. Rejoignez notre communauté active pour partager vos prompts, vos applications et obtenir de l'aide en direct.",
    value: "Valeur : accès offert",
  },
  {
    badge: "BONUS #2",
    title: "La bibliothèque de « prompts modèles »",
    text: "Copiez-collez nos structures de prompts éprouvées pour générer instantanément des bases de SaaS, des formulaires de paiement et des bases de données.",
    value: "Valeur : offert",
  },
  {
    badge: "BONUS #3",
    title: "Coaching live mensuel Q&R",
    text: "Une session live par mois pour analyser vos projets, débloquer vos difficultés en direct et découvrir les dernières avancées des outils de Vibe Coding.",
    value: "Valeur : offert",
  },
];

const FAQ = [
  {
    q: "Faut-il avoir des bases en programmation pour commencer ?",
    a: "Absolument pas. Le Vibe Coding est conçu pour contourner la barrière technique du code traditionnel. Nous partons de zéro : vous apprendrez à penser de façon logique et structurée pour orienter l'IA, sans avoir à mémoriser des lignes de code.",
  },
  {
    q: "Quels outils allons-nous utiliser durant la formation ?",
    a: "Vous apprendrez à maîtriser Antigravity (assistant de programmation agentique), Claude Code (environnement de terminal rapide), Gemini (moteur de raisonnement contextuel), Supabase (base de données et authentification) et Vercel (hébergement et déploiement continu).",
  },
  {
    q: "Puis-je créer n'importe quel type de projet avec le Vibe Coding ?",
    a: "Oui, la méthode est idéale pour les applications web (SaaS, dashboards, CRM, formulaires de paiement), les sites interactifs, les extensions de navigateur, et même les applications mobiles légères. Seuls les moteurs de jeux 3D avancés ou architectures systèmes complexes demandent encore beaucoup de code manuel.",
  },
  {
    q: "Combien de temps faut-il pour créer son premier projet ?",
    a: "En suivant les étapes de la formation, la plupart des élèves parviennent à concevoir et mettre en ligne leur première application fonctionnelle en moins de 48 heures de travail effectif.",
  },
  {
    q: "Comment se passe le paiement et l'accès ?",
    a: "Le paiement est sécurisé via Moneroo (Carte Visa/Mastercard ou Mobile Money : Orange, MTN, Moov, Wave). Vous devez être connecté ; une fois le paiement confirmé, l'accès apparaît immédiatement dans « Mon espace ».",
  },
];

/* ── Terminal animé : simulation d'une session de Vibe Coding ── */
type Step = { type: "log" | "code" | "success" | "link"; text: string };

const SCRIPTS: { prompt: string; steps: Step[] }[] = [
  {
    prompt: 'antigravity --create "saas-facturation-ia" --stack next,supabase',
    steps: [
      { type: "log", text: "🤖 Antigravity : analyse de l'idée et planification structurelle..." },
      { type: "log", text: "📦 Génération du squelette Next.js + configuration Supabase..." },
      {
        type: "code",
        text: "📁 saas-facturation-ia/\n├── components/ (Dashboard, InvoiceGrid, InvoiceForm)\n├── lib/\n│   ├── supabaseClient.ts   ← connexion Supabase\n│   └── auth.ts             ← Row Level Security\n└── app/\n    ├── page.tsx\n    └── api/invoices/route.ts",
      },
      { type: "log", text: "⚙️ Claude Code : génération du schéma de base de données SQL..." },
      {
        type: "code",
        text: "-- Supabase SQL Migration\ncreate table invoices (\n  id uuid default gen_random_uuid() primary key,\n  user_id uuid references auth.users,\n  amount numeric(10,2) not null,\n  status text default 'pending',\n  created_at timestamptz default now()\n);",
      },
      { type: "log", text: "🧠 Gemini : optimisation du rendu et de l'expérience utilisateur..." },
      { type: "log", text: "🚀 Vercel : déploiement continu en production déclenché..." },
      { type: "success", text: "✨ Succès ! Votre SaaS est live sur Vercel + Supabase :" },
      { type: "link", text: "https://saas-facturation.vercel.app" },
    ],
  },
  {
    prompt: 'claude --code "ajouter authentification Supabase Auth + RLS"',
    steps: [
      { type: "log", text: "🤖 Claude Code : analyse du schéma d'authentification requis..." },
      { type: "log", text: "🔧 Activation de Supabase Auth + configuration des politiques RLS..." },
      {
        type: "code",
        text: "// lib/auth.ts — Supabase Auth Helper\nimport { createClient } from '@supabase/supabase-js';\n\nexport const supabase = createClient(\n  process.env.NEXT_PUBLIC_SUPABASE_URL!,\n  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!\n);\n\nexport const signIn = (email, password) =>\n  supabase.auth.signInWithPassword({ email, password });",
      },
      { type: "log", text: "🔒 Antigravity : ajout de la protection des routes API..." },
      { type: "log", text: "🧠 Gemini : vérification de la cohérence de la logique d'accès..." },
      { type: "log", text: "🚀 Vercel : re-déploiement avec les nouvelles variables d'environnement..." },
      { type: "success", text: "✓ Authentification sécurisée activée en production !" },
    ],
  },
];

function TerminalSimulator() {
  const [prompt, setPrompt] = useState("");
  const [lines, setLines] = useState<Step[]>([]);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((res) => timers.push(setTimeout(res, ms)));

    async function run() {
      let si = 0;
      while (!cancelled) {
        const script = SCRIPTS[si % SCRIPTS.length];
        setLines([]);
        setPrompt("");
        for (let i = 0; i < script.prompt.length && !cancelled; i++) {
          setPrompt(script.prompt.slice(0, i + 1));
          await wait(42);
        }
        await wait(500);
        for (const step of script.steps) {
          if (cancelled) break;
          setLines((prev) => [...prev, step]);
          await wait(step.type === "code" ? 1050 : 520);
        }
        await wait(4500);
        si++;
      }
    }
    run();
    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [lines, prompt]);

  return (
    <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-black/30">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs text-gray-400 font-mono">vibe-terminal — agentic-builder</span>
      </div>
      {/* Body */}
      <div
        ref={bodyRef}
        className="p-4 h-[300px] sm:h-[360px] overflow-y-auto font-mono text-[11.5px] sm:text-xs leading-relaxed bg-black/40 space-y-1.5"
      >
        <div className="text-gray-200 break-words">
          <span className="text-emerald-400 mr-1.5">$</span>
          <span>{prompt}</span>
          <span className="vibe-cursor" />
        </div>
        {lines.map((line, i) => {
          if (line.type === "code") {
            return (
              <pre
                key={i}
                className="my-2 p-3 rounded-lg bg-black/50 border border-white/5 text-emerald-200/90 overflow-x-auto whitespace-pre"
              >
                {line.text}
              </pre>
            );
          }
          if (line.type === "success") {
            return (
              <div key={i} className="text-emerald-400 font-bold break-words">
                {line.text}
              </div>
            );
          }
          if (line.type === "link") {
            return (
              <div key={i} className="break-all">
                🔗 <span className="text-orange-300 underline">{line.text}</span>
              </div>
            );
          }
          return (
            <div key={i} className="text-gray-300 break-words">
              {line.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Compte à rebours (offre de lancement) ── */
function Countdown() {
  const [t, setT] = useState({ h: "23", m: "59", s: "59" });

  useEffect(() => {
    const KEY = "vibe_countdown_seconds";
    let left = parseInt(localStorage.getItem(KEY) || "", 10);
    if (isNaN(left) || left <= 0) left = 23 * 3600 + 59 * 60 + 59;

    const id = setInterval(() => {
      if (left <= 0) left = 23 * 3600 + 59 * 60 + 59;
      const h = Math.floor(left / 3600);
      const m = Math.floor((left % 3600) / 60);
      const s = left % 60;
      setT({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
      });
      left -= 1;
      localStorage.setItem(KEY, String(left));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const Block = ({ value, unit }: { value: string; unit: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-black text-white tabular-nums bg-black/40 rounded-xl px-3.5 py-2 border border-white/5">
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1.5">{unit}</span>
    </div>
  );

  return (
    <div className="mt-8">
      <p className="text-xs text-gray-400 mb-3">Cette offre de lancement se termine dans :</p>
      <div className="flex items-center justify-center gap-3">
        <Block value={t.h} unit="heures" />
        <span className="text-2xl font-black text-gray-600">:</span>
        <Block value={t.m} unit="min" />
        <span className="text-2xl font-black text-gray-600">:</span>
        <Block value={t.s} unit="sec" />
      </div>
    </div>
  );
}

export default function VibeCodingMasteryPage() {
  const router = useRouter();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleBuy = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="w-full overflow-hidden pb-16">
      {/* ══ HERO ══ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        <div className="vibe-grid absolute inset-0 -z-10 pointer-events-none" aria-hidden />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-emerald-500/15 rounded-full blur-[120px] -z-10 pointer-events-none" aria-hidden />

        <div className="text-center max-w-3xl mx-auto">
          <span className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-300 mb-7">
            <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
            ⚡ Méthode révolutionnaire · 100 % pratique · sans code
          </span>
          <h1 className="brand-font animate-fade-up text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-[0.95] mb-5">
            VIBE CODING <span className="gradient-text">MASTERY</span>
          </h1>
          <h2 className="animate-fade-up ad-1 text-xl sm:text-2xl font-bold tracking-tight text-gray-300 leading-snug mb-6">
            Donnez vie à vos projets avec le <span className="gradient-text">Vibe Coding</span>.
          </h2>
          <p className="animate-fade-up ad-2 text-lg text-gray-400 leading-relaxed mb-9 max-w-2xl mx-auto">
            Le problème n'est plus votre niveau technique, c'est votre méthodologie.
            Pilotez les technologies d'Ehonam Academy —{" "}
            <span className="text-white font-semibold">
              Antigravity, Claude Code, Gemini, Supabase, Vercel, Git &amp; GitHub
            </span>{" "}
            — pour concevoir et lancer vos logiciels en un temps record.
          </p>
          <button
            onClick={handleBuy}
            className="animate-fade-up ad-3 px-8 py-4 rounded-xl font-bold text-white gradient-btn inline-flex items-center gap-2 shadow-lg cursor-pointer"
          >
            Commencer à Vibe Coder maintenant
            <Rocket className="w-5 h-5" />
          </button>
        </div>

        {/* Tech stack pills */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5">
          <span className="text-xs text-gray-500 font-semibold uppercase tracking-widest mr-1">
            Stack officiel :
          </span>
          {TECH_STACK.map(({ name, Icon }) => (
            <span
              key={name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-semibold text-gray-300"
            >
              <Icon className="w-3.5 h-3.5 text-emerald-400" />
              {name}
            </span>
          ))}
        </div>

        {/* Showcase : terminal */}
        <div className="mt-12 max-w-3xl mx-auto">
          <TerminalSimulator />
        </div>
      </section>

      {/* ══ MARQUEE ══ */}
      <section className="mt-16 sm:mt-24">
        <h3 className="text-center text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">
          Projets réels réalisés en Vibe Coding
        </h3>
        <div className="vibe-marquee relative overflow-hidden py-2 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)]">
          <div className="vibe-marquee-track gap-4 pr-4">
            {[...PROJECTS, ...PROJECTS].map((p, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center gap-3 glass-panel rounded-xl border-white/5 px-5 py-3.5"
              >
                <span className="text-2xl">{p.icon}</span>
                <div>
                  <h4 className="text-sm font-bold text-white whitespace-nowrap">{p.title}</h4>
                  <p className="text-xs text-emerald-400">{p.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ PROBLÈME ══ */}
      <section id="probleme" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            L'enfer du code traditionnel
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
            Pourquoi vous n'arrivez pas à lancer vos projets
          </h2>
          <p className="text-gray-400">
            Apprendre la programmation classique aujourd'hui est la voie la plus lente et
            frustrante vers la réussite de vos projets.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PROBLEMS.map(({ Icon, title, text }) => (
            <div key={title} className="glass-panel rounded-2xl border-white/5 p-8 glass-panel-hover">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6">
                <Icon className="w-6 h-6 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ MÉTHODE / SOLUTION ══ */}
      <section id="methode" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              La révolution du Vibe Coding
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-5 leading-tight">
              Soyez le chef d'orchestre, laissez l'IA écrire les notes
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              Le Vibe Coding consiste à concevoir des applications en conversant de manière
              structurée et logique avec des intelligences artificielles spécialisées.
            </p>
            <div className="space-y-5">
              {METHOD_FEATURES.map(({ title, text }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-md font-bold text-white">{title}</h4>
                    <p className="text-sm text-gray-400 leading-relaxed mt-0.5">{text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logic-map mockup */}
          <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-black/30">
              <span className="text-xs text-gray-400 font-mono">agentic-logic-map.json</span>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Synced
              </span>
            </div>
            <div className="p-5 space-y-4 bg-black/20">
              {[
                { a: "[Brief]  « Créer un SaaS… »", b: "[IA]  Analyse architecture" },
                { a: "[Debug]  Correction des lints", b: "[IA]  Résolution immédiate" },
                { a: "[Deploy]  Vercel en 1-clic", b: "[Live]  App opérationnelle !" },
              ].map((row, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs font-mono text-gray-300"
                >
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-black/40 border border-white/5">{row.a}</div>
                  <ArrowRight className="w-4 h-4 text-orange-400 mx-auto shrink-0 rotate-90 sm:rotate-0" />
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/15 text-emerald-200/90">
                    {row.b}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PROGRAMME ══ */}
      <section id="programme" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-orange-400 uppercase tracking-widest">
            Le programme du bootcamp
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-4">
            De l'idée au déploiement en 4 étapes
          </h2>
          <p className="text-gray-400">
            Un parcours structuré conçu pour faire de vous un Vibe Coder autonome et performant.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROGRAM.map((mod) => (
            <div key={mod.num} className="glass-panel rounded-2xl border-white/5 p-8 glass-panel-hover">
              <span className="inline-block text-xs font-black text-orange-400 uppercase tracking-widest mb-3">
                {mod.num}
              </span>
              <h3 className="text-xl font-bold text-white mb-3">{mod.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">{mod.text}</p>
              <ul className="space-y-2.5">
                {mod.points.map((pt) => (
                  <li key={pt} className="flex items-start gap-2.5 text-sm text-gray-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ══ BONUS ══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Les accélérateurs inclus
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Des bonus exclusifs pour décupler vos résultats
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {BONUSES.map((bonus) => (
            <div
              key={bonus.badge}
              className="glass-panel rounded-2xl border-white/5 p-8 glass-panel-hover relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
              <span className="inline-flex items-center gap-1.5 text-xs font-black text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full mb-5">
                <Sparkles className="w-3 h-3" />
                {bonus.badge}
              </span>
              <h3 className="text-lg font-bold text-white mb-3">{bonus.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-5">{bonus.text}</p>
              <span className="text-xs font-bold text-emerald-400">{bonus.value}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══ PRICING ══ */}
      <section id="pricing" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="glass-panel rounded-3xl border-white/10 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <span className="inline-block text-xs font-black text-orange-300 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-6">
            Offre spéciale de lancement
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Devenez un Vibe Coder autonome
          </h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Accédez à l'intégralité du bootcamp, aux mises à jour à vie et à tous les bonus pour
            lancer vos projets dès ce soir.
          </p>

          {/* Prix */}
          <div className="flex flex-col items-center mb-8">
            <span className="text-lg text-gray-500 line-through">{ORIGINAL_PRICE}</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl sm:text-6xl font-black text-white">{PRICE}</span>
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-widest mt-2">
              Paiement unique · accès à vie
            </span>
          </div>

          <button
            onClick={handleBuy}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white gradient-btn inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <CreditCard className="w-5 h-5" />
            Rejoindre le bootcamp Vibe Coding
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Paiement sécurisé Moneroo (Carte / Mobile Money) · accès immédiat dans « Mon espace »
          </p>

          {/* Garantie */}
          <div className="mt-8 flex items-start gap-4 text-left glass-panel rounded-2xl border-white/5 p-5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
              <BadgeCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Garantie 14 jours satisfait ou remboursé</h4>
              <p className="text-xs text-gray-400 leading-relaxed mt-1">
                Testez les premiers modules, installez vos outils et commencez à concevoir. Si le
                bootcamp ne répond pas à vos attentes, demandez un remboursement complet par simple
                e-mail.
              </p>
            </div>
          </div>

          <Countdown />
        </div>
      </section>

      {/* ══ FAQ ══ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-white/5">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
            Questions fréquentes
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">
            Tout ce que vous devez savoir
          </h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="glass-panel rounded-2xl border-white/5 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(open ? null : i)}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                  aria-expanded={open}
                >
                  <span className="text-sm sm:text-md font-bold text-white">{item.q}</span>
                  <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {open ? (
                      <Minus className="w-4 h-4 text-orange-400" />
                    ) : (
                      <Plus className="w-4 h-4 text-emerald-400" />
                    )}
                  </span>
                </button>
                {open && (
                  <div className="px-6 pb-5 -mt-1">
                    <p className="text-sm text-gray-400 leading-relaxed">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══ CTA FINAL ══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="glass-panel rounded-3xl border-white/10 p-10 sm:p-14 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-orange-500/5 pointer-events-none" />
          <Zap className="w-10 h-10 text-orange-400 mx-auto mb-5" />
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Prêt à transformer vos idées en applications ?
          </h2>
          <p className="text-gray-400 max-w-xl mx-auto mb-8">
            Rejoignez {TITLE} et lancez votre premier projet ce soir, sans écrire une ligne de code
            à la main.
          </p>
          <button
            onClick={handleBuy}
            className="px-8 py-4 rounded-xl font-bold text-white gradient-btn inline-flex items-center gap-2 shadow-lg cursor-pointer"
          >
            Rejoindre {TITLE}
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        itemTitle={TITLE}
        price={PRICE}
        itemType="course"
        itemId={VIBE_COURSE_ID}
        successMessage="Paiement validé ! Votre accès à Vibe Coding Mastery est disponible dans « Mon espace »."
      />
    </div>
  );
}

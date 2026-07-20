"use client";

import { useEffect, useRef, useState } from "react";
import {
  Rocket, Zap, Sparkles, Check, CheckCircle2, ShieldCheck, ArrowRight, ArrowDown,
  Plus, Minus, CreditCard, Database, GitBranch, Cloud, Wand2, XCircle,
  Hourglass, Wallet, BadgeCheck, Users, Lightbulb, Target, Palette, Lock,
  TrendingUp, Star, Quote, Globe, FileText, GraduationCap, Briefcase,
  Gift, LineChart, Flame, PlayCircle, Camera, ExternalLink,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getCourse, VIBE_COURSE_ID } from "@/lib/courses";
import { fetchCourseById } from "@/lib/courses-db";
import CheckoutModal from "@/components/CheckoutModal";
import ThemeToggle from "@/components/ThemeToggle";

// Valeurs de repli le temps que la base réponde (la base = source de vérité).
const staticCourse = getCourse(VIBE_COURSE_ID);
const FALLBACK = {
  price: staticCourse?.price ?? "19 000 FCFA",
  originalPrice: staticCourse?.originalPrice ?? "85 000 FCFA",
  title: staticCourse?.title ?? "Vibe Coding Mastery",
};

// Photo d'Ehonam (fichier dans /public).
const FOUNDER_PHOTO = "/ehonam.jpg";

// Vidéo de présentation du Hero (VSL). Laissez vide pour afficher l'emplacement à compléter.
// - Fichier local : déposez le .mp4 dans /public puis mettez "/nom-du-fichier.mp4"
// - YouTube : collez n'importe quel lien (youtu.be/..., .../watch?v=..., .../embed/...), l'ID est extrait automatiquement
// - Vimeo : collez le lien "embed" (ex: "https://player.vimeo.com/video/XXXXXXXXX")
const HERO_VIDEO_URL =
  "https://player.vimeo.com/video/1211012513?badge=0&autopause=0&player_id=0&app_id=58479&autoplay=1&muted=1";

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:embed\/|watch\?v=))([\w-]{11})/);
  return m ? m[1] : null;
}

/* ── Terminal animé : simulation d'une session de Vibe Coding ── */
type Step = { type: "log" | "code" | "success" | "link"; text: string };

const SCRIPTS: { prompt: string; steps: Step[] }[] = [
  {
    prompt: 'vibe build "mon-saas" --idea "gestion de factures" --stack next,supabase',
    steps: [
      { type: "log", text: "🤖 L'IA analyse votre idée et planifie l'architecture du produit..." },
      { type: "log", text: "📦 Génération de l'interface, des pages et de la logique..." },
      {
        type: "code",
        text: "📁 mon-saas/\n├── app/ (Dashboard, Factures, Clients)\n├── lib/supabase.ts   ← base de données\n└── app/api/paiements/route.ts",
      },
      { type: "log", text: "🗄️ Création de la base de données sécurisée (Supabase)..." },
      { type: "log", text: "🔒 Authentification + comptes utilisateurs activés..." },
      { type: "log", text: "🚀 Déploiement en production sur Vercel..." },
      { type: "success", text: "✨ Votre SaaS est EN LIGNE, prêt pour vos premiers clients :" },
      { type: "link", text: "https://mon-saas.vercel.app" },
    ],
  },
  {
    prompt: 'vibe add "abonnements + paiement mobile money"',
    steps: [
      { type: "log", text: "🤖 Intégration du système d'abonnement et de paiement..." },
      { type: "log", text: "💳 Connexion Mobile Money + Carte bancaire..." },
      {
        type: "code",
        text: "// Encaissez vos premiers revenus\nexport async function checkout(plan) {\n  return pay({ plan, method: 'mobile_money' });\n}",
      },
      { type: "log", text: "🧠 L'IA vérifie la sécurité et la cohérence du flux..." },
      { type: "success", text: "✓ Vos utilisateurs peuvent maintenant PAYER dans votre app." },
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
    const wait = (ms: number) => new Promise<void>((res) => timers.push(setTimeout(res, ms)));

    async function run() {
      let si = 0;
      while (!cancelled) {
        const script = SCRIPTS[si % SCRIPTS.length];
        setLines([]);
        setPrompt("");
        for (let i = 0; i < script.prompt.length && !cancelled; i++) {
          setPrompt(script.prompt.slice(0, i + 1));
          await wait(38);
        }
        await wait(500);
        for (const step of script.steps) {
          if (cancelled) break;
          setLines((prev) => [...prev, step]);
          await wait(step.type === "code" ? 1050 : 540);
        }
        await wait(4200);
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
    <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-2xl">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-black/30">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-400/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
        </div>
        <span className="text-xs text-gray-400 font-mono">vibe-builder — votre SaaS en direct</span>
      </div>
      <div
        ref={bodyRef}
        className="p-4 h-[280px] sm:h-[340px] overflow-y-auto font-mono text-[11.5px] sm:text-xs leading-relaxed bg-black/40 space-y-1.5"
      >
        <div className="text-gray-200 break-words">
          <span className="text-emerald-400 mr-1.5">$</span>
          <span>{prompt}</span>
          <span className="vibe-cursor" />
        </div>
        {lines.map((line, i) => {
          if (line.type === "code")
            return (
              <pre key={i} className="my-2 p-3 rounded-lg bg-black/50 border border-white/5 text-emerald-200/90 overflow-x-auto whitespace-pre">
                {line.text}
              </pre>
            );
          if (line.type === "success")
            return <div key={i} className="text-emerald-400 font-bold break-words">{line.text}</div>;
          if (line.type === "link")
            return <div key={i} className="break-all">🔗 <span className="text-orange-300 underline">{line.text}</span></div>;
          return <div key={i} className="text-gray-300 break-words">{line.text}</div>;
        })}
      </div>
    </div>
  );
}

/* ── Vidéo de présentation (Hero) ──
   Vidéo YouTube : on affiche d'abord une simple image miniature (quelques Ko), et on
   ne charge l'iframe YouTube (~1 Mo de scripts) qu'au clic. Ça évite de plomber le
   chargement de la page sur une connexion faible, et ça masque toutes les distractions
   YouTube (vidéos suggérées, branding, etc.) tant que la vidéo n'est pas lancée. */
function HeroVideo() {
  const [play, setPlay] = useState(false);
  const youtubeId = extractYouTubeId(HERO_VIDEO_URL);
  const isOtherEmbed = !youtubeId && /player\.vimeo\.com/.test(HERO_VIDEO_URL);
  const isFile = !youtubeId && !isOtherEmbed && HERO_VIDEO_URL;

  if (youtubeId) {
    return (
      <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-2xl aspect-video relative">
        {play ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&playsinline=1`}
            title="Vidéo de présentation — Vibe Coding Mastery"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlay(true)}
            aria-label="Lancer la vidéo de présentation"
            className="group w-full h-full block cursor-pointer relative"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
              alt="Vidéo de présentation"
              loading="lazy"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-full gradient-btn flex items-center justify-center shadow-2xl group-hover:scale-105 transition-transform">
                <PlayCircle className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
              </span>
            </div>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-2xl aspect-video">
      {isOtherEmbed ? (
        <iframe
          src={HERO_VIDEO_URL}
          title="Vidéo de présentation — Vibe Coding Mastery"
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : isFile ? (
        <video controls preload="none" className="w-full h-full object-cover" src={HERO_VIDEO_URL} />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-gray-500 bg-gradient-to-br from-emerald-900/20 to-orange-900/10">
          <PlayCircle className="w-14 h-14 opacity-60" />
          <p className="text-sm font-medium">Emplacement pour votre vidéo de présentation</p>
          <p className="text-xs text-gray-600 max-w-xs text-center px-4">
            Ajoutez le lien ou le fichier dans <code className="text-gray-400">HERO_VIDEO_URL</code>
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Compte à rebours (offre de lancement) ── */
function useCountdown() {
  const [t, setT] = useState({ h: "23", m: "59", s: "59" });
  useEffect(() => {
    const KEY = "vibe_countdown_seconds";
    let left = parseInt(localStorage.getItem(KEY) || "", 10);
    if (isNaN(left) || left <= 0) left = 47 * 3600 + 59 * 60 + 59;
    const id = setInterval(() => {
      if (left <= 0) left = 47 * 3600 + 59 * 60 + 59;
      const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), s = left % 60;
      setT({ h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0") });
      left -= 1;
      localStorage.setItem(KEY, String(left));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

function Countdown() {
  const t = useCountdown();
  const Block = ({ value, unit }: { value: string; unit: string }) => (
    <div className="flex flex-col items-center">
      <span className="text-2xl sm:text-3xl font-black text-white tabular-nums bg-black/40 rounded-xl px-3.5 py-2 border border-white/5">{value}</span>
      <span className="text-[10px] uppercase tracking-widest text-gray-500 mt-1.5">{unit}</span>
    </div>
  );
  return (
    <div className="mt-8">
      <p className="text-xs text-gray-400 mb-3">L'offre de lancement se termine dans :</p>
      <div className="flex items-center justify-center gap-3">
        <Block value={t.h} unit="heures" /><span className="text-2xl font-black text-gray-600">:</span>
        <Block value={t.m} unit="min" /><span className="text-2xl font-black text-gray-600">:</span>
        <Block value={t.s} unit="sec" />
      </div>
    </div>
  );
}

/* ── Barre d'urgence fixe en haut de page ── */
function UrgencyBar() {
  const t = useCountdown();
  return (
    <div className="fixed top-0 left-0 w-full z-[60] h-10 sm:h-11 flex items-center bg-gradient-to-r from-orange-600 to-rose-600 text-white shadow-lg overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 w-full flex items-center justify-center gap-2 sm:gap-3">
        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
        <span className="text-[11px] sm:text-sm font-bold text-center truncate">
          Offre de lancement — se termine dans{" "}
          <span className="tabular-nums">{t.h}:{t.m}:{t.s}</span>
        </span>
        <a href="#pricing" className="hidden sm:inline-flex items-center gap-1 text-xs font-bold underline underline-offset-2 shrink-0 hover:text-white/80">
          En profiter <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}

/* ── Données des sections ── */
const HERO_BADGES = [
  { Icon: Flame, text: "Le Défi 30 jours pour lancer votre SaaS" },
  { Icon: Sparkles, text: "Propulsé par l'IA générative" },
];
const TRUST = ["Sans écrire de code", "100 % guidé, étape par étape", "Accès à vie", "Paiement sécurisé Moneroo"];

const NEW_REALITY = [
  { Icon: Zap, title: "Ce qui prenait 1 an prend 30 jours", text: "Hier, créer un logiciel demandait des années d'études et une équipe de développeurs. Aujourd'hui, vous pilotez l'IA et elle construit à votre place." },
  { Icon: TrendingUp, title: "Une longueur d'avance décisive", text: "Ceux qui maîtrisent l'IA maintenant prendront des années d'avance sur ceux qui hésitent. La fenêtre est ouverte — pour l'instant." },
  { Icon: Globe, title: "Le meilleur moment de l'histoire", text: "Jamais il n'a été aussi simple de transformer une idée en produit réel, rentable et mondial. Depuis chez vous, sans dépendre de personne." },
];

const IMAGINE = [
  "Vous ouvrez votre propre SaaS, en ligne, à votre nom.",
  "Vous voyez vos premiers utilisateurs créer un compte.",
  "Vous partagez le lien de votre application autour de vous.",
  "Vous corrigez un détail en une phrase, l'IA s'en occupe.",
  "Vous ajoutez une nouvelle fonctionnalité en un après-midi.",
  "Vous recevez votre tout premier paiement.",
];

const MISTAKES = [
  { Icon: XCircle, title: "YouTube ne suffit pas", text: "Des dizaines de vidéos décousues, aucune méthode. Vous accumulez de la théorie… et vous ne lancez jamais rien." },
  { Icon: Hourglass, title: "Apprendre à coder « à l'ancienne »", text: "Passer des années sur JavaScript pendant que d'autres livrent leur produit en semaines grâce à l'IA. Le monde a changé." },
  { Icon: Wallet, title: "Payer une agence 5 chiffres", text: "Dépenser une fortune pour un produit instable, qui ne correspond pas à votre vision, et rester dépendant pour la moindre modification." },
  { Icon: Flame, title: "Abandonner avant la ligne d'arrivée", text: "Sans accompagnement, on bloque, on se décourage, on range son idée dans un tiroir. C'est là que la plupart perdent des années." },
];

const WHY = [
  { Icon: Target, title: "Une méthode, pas un catalogue", text: "Un chemin clair du premier jour à la mise en ligne. Vous savez toujours quoi faire ensuite." },
  { Icon: Wand2, title: "L'IA fait le gros du travail", text: "Vous apprenez à donner les bonnes instructions. L'IA écrit le code, vous gardez le contrôle." },
  { Icon: ShieldCheck, title: "Zéro blocage possible", text: "Chaque étape est guidée. Quand vous coincez, vous savez exactement comment débloquer l'IA." },
  { Icon: Rocket, title: "Un objectif : publier", text: "On ne regarde pas des vidéos pour le plaisir. On met votre application en ligne." },
];

const PRODUCTS = [
  { name: "GeScole", tag: "EdTech · Gestion scolaire", Icon: GraduationCap, image: "/gescole.png", desc: "Plateforme 100 % cloud qui digitalise la gestion des établissements : élèves, notes, présences, finances et communication.", accent: "text-emerald-400", url: "https://www.gescole.com" },
  { name: "Edossime", tag: "Marketplace · Talents africains", Icon: Users, image: "/edossime.png", desc: "La marketplace de l'élite du freelancing africain, où expertise humaine et IA se combinent pour livrer plus vite.", accent: "text-orange-400", url: "https://www.edossime.com" },
  { name: "ChapFacture", tag: "FinTech · Gestion commerciale", Icon: FileText, image: "/chapfacture.png", desc: "Devis, factures, proformas, bons de commande et de livraison — avec suivi des paiements, en quelques secondes.", accent: "text-emerald-400", url: "https://www.chapfacture.com" },
];

const JOURNEY = [
  { Icon: Lightbulb, title: "Idée", text: "Clarifier le problème que votre SaaS résout." },
  { Icon: Target, title: "Validation", text: "Vérifier que l'idée mérite d'être construite." },
  { Icon: Palette, title: "Design", text: "Dessiner une interface claire et pro." },
  { Icon: Wand2, title: "Développement IA", text: "Faire construire l'application par l'IA." },
  { Icon: Database, title: "Base de données", text: "Stocker et organiser vos données en sécurité." },
  { Icon: Lock, title: "Authentification", text: "Comptes, connexions et sécurité (RLS)." },
  { Icon: Cloud, title: "Déploiement", text: "Mettre l'application en ligne sur Vercel." },
  { Icon: Rocket, title: "Publication", text: "Ouvrir votre SaaS au monde." },
  { Icon: TrendingUp, title: "Commercialisation", text: "Trouver et convaincre vos premiers clients." },
  { Icon: LineChart, title: "Évolution", text: "Ajouter des fonctions et faire grandir le produit." },
];

const MODULES = [
  {
    week: "Semaine 1", title: "Fondations & idéation assistée par l'IA",
    outcome: "Vous saurez transformer une simple idée en plan de produit clair, et parler à l'IA comme un véritable chef de produit.",
    points: ["Installer et maîtriser votre boîte à outils IA", "Rédiger un cahier des charges que l'IA comprend du premier coup", "Cadrer un SaaS vendable, pas un gadget"],
  },
  {
    week: "Semaine 2", title: "Construction du produit avec l'IA",
    outcome: "Vous saurez faire construire une vraie application par l'IA, écran par écran, en gardant le contrôle total.",
    points: ["L'art du prompting structurel (guidage étape par étape)", "Générer interfaces, pages et logique métier", "Déboguer et briser les boucles d'erreurs de l'IA"],
  },
  {
    week: "Semaine 3", title: "Données, comptes & paiements",
    outcome: "Vous saurez gérer des utilisateurs, sécuriser vos données et encaisser des paiements dans votre app.",
    points: ["Base de données Supabase & sécurité (RLS)", "Authentification et espaces membres", "Intégrer un paiement (carte / Mobile Money)"],
  },
  {
    week: "Semaine 4", title: "Déploiement, lancement & premiers clients",
    outcome: "Vous saurez mettre votre SaaS en ligne et le présenter à vos premiers utilisateurs.",
    points: ["Déploiement continu en production sur Vercel", "Checklist de lancement d'un SaaS", "Présenter et commercialiser votre produit"],
  },
];

const BONUSES = [
  { badge: "BONUS #1", title: "La bibliothèque de prompts SaaS", value: "45 000 FCFA", text: "Des structures de prompts éprouvées à copier-coller pour générer instantanément des bases de SaaS, des paiements et des dashboards." },
  { badge: "BONUS #2", title: "Le Discord privé des SaaS Builders", value: "69 000 FCFA / an", text: "Ne restez jamais bloqué. Une communauté active pour partager vos projets, obtenir du feedback et de l'aide en direct." },
  { badge: "BONUS #3", title: "Coaching live mensuel (Q&R)", value: "50 000 FCFA", text: "Chaque mois, une session en direct pour analyser votre SaaS, débloquer vos difficultés et avancer plus vite." },
  { badge: "BONUS #4", title: "Les modèles de déploiement & sécurité", value: "47 000 FCFA", text: "Nos configurations prêtes à l'emploi pour déployer et sécuriser votre application sans stress." },
];

const OUTCOMES = [
  "Transformer n'importe quelle idée en produit SaaS concret",
  "Piloter l'IA pour construire des applications complètes",
  "Concevoir des interfaces modernes et professionnelles",
  "Créer et sécuriser une base de données",
  "Gérer des comptes utilisateurs et l'authentification",
  "Intégrer un système de paiement dans votre app",
  "Déployer en production en quelques minutes",
  "Déboguer et faire évoluer votre produit avec l'IA",
  "Lancer votre SaaS et accueillir vos premiers utilisateurs",
  "Bâtir une compétence rare, utile toute votre vie",
];

const AUDIENCE = [
  { Icon: Briefcase, t: "Entrepreneurs" }, { Icon: Users, t: "Freelances & consultants" },
  { Icon: Sparkles, t: "Créateurs de contenu" }, { Icon: GraduationCap, t: "Étudiants" },
  { Icon: GitBranch, t: "Développeurs débutants" }, { Icon: TrendingUp, t: "Salariés en quête d'un revenu" },
];

const TESTIMONIALS = [
  { name: "Corentin K.", role: "Entrepreneur, Abidjan (Côte d'Ivoire)", text: "« Je ne savais pas coder. En 30 jours, j'ai lancé mon SaaS de gestion de stock avec l'IA qui a fait le travail à ma place. Aujourd'hui j'ai mes premiers clients qui payent chaque mois. »" },
  { name: "Aya N.", role: "Développeuse indépendante, Abidjan (Côte d'Ivoire)", text: "« La méthode est hyper claire, étape par étape. Ce qui m'a le plus servi : on n'est jamais bloqué, on sait toujours comment débloquer l'IA. Mon app est en ligne et je l'améliore chaque semaine. »" },
  { name: "Moussa D.", role: "Freelance, Dakar (Sénégal)", text: "« Formation ultra concrète, pas de blabla théorique : on construit vraiment. J'ai transformé mon idée en vraie application et je l'ai présentée à mes premiers utilisateurs en un mois. »" },
];

const FAQ = [
  { q: "Je suis totalement débutant, est-ce fait pour moi ?", a: "Oui — c'est même conçu pour ça. Nous partons de zéro. Vous n'avez pas besoin de connaissances techniques : vous apprenez à guider l'IA, pas à mémoriser du code." },
  { q: "Je ne sais pas coder. C'est un problème ?", a: "Non. Le principe du Vibe Coding est justement de contourner le code traditionnel. Vous décrivez ce que vous voulez, l'IA le construit, vous gardez le contrôle." },
  { q: "Je manque de temps, comment ça se passe ?", a: "Le Défi 30 jours est pensé pour les emplois du temps chargés : des étapes courtes et concrètes. Quelques heures par semaine suffisent pour avancer et publier votre SaaS." },
  { q: "Quel ordinateur faut-il ?", a: "Un ordinateur portable classique (Windows ou Mac) et une connexion internet suffisent. Aucune machine puissante n'est nécessaire — tout se passe dans le cloud." },
  { q: "Comment se déroule le Défi 30 jours ?", a: "Un parcours guidé, semaine après semaine : idée, construction, données & paiements, puis lancement. À la fin, votre application est en ligne, prête pour vos premiers utilisateurs." },
  { q: "Et si je bloque en cours de route ?", a: "Vous n'êtes jamais seul : la méthode vous montre exactement comment débloquer l'IA, et la communauté privée + le coaching live sont là pour vous aider." },
];

/* ── UI helpers ── */
function Eyebrow({ children, color = "emerald" }: { children: React.ReactNode; color?: "emerald" | "orange" }) {
  return (
    <span className={`text-xs font-black uppercase tracking-widest ${color === "orange" ? "text-orange-400" : "text-emerald-400"}`}>
      {children}
    </span>
  );
}

function BrowserFrame({
  image, name, tag, desc, Icon, accent, url,
}: {
  image: string; name: string; tag: string; desc: string;
  Icon: React.ComponentType<{ className?: string }>; accent: string; url: string;
}) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="glass-panel rounded-2xl border-white/10 overflow-hidden shadow-xl glass-panel-hover group block cursor-pointer"
    >
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-white/5 bg-black/40">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
        <div className="ml-3 flex-1 h-5 rounded-md bg-white/5 border border-white/5" />
      </div>
      <div className="aspect-[16/10] overflow-hidden bg-black/20 border-b border-white/5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover object-top group-hover:scale-[1.04] transition-transform duration-700"
        />
      </div>
      <div className="px-5 py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={`w-5 h-5 ${accent}`} />
            <h4 className="text-white font-bold">{name}</h4>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-white transition-colors shrink-0" />
        </div>
        <p className="text-[11px] uppercase tracking-wide text-gray-500 mt-0.5">{tag}</p>
        <p className="text-gray-400 text-xs mt-2 leading-relaxed">{desc}</p>
      </div>
    </a>
  );
}

export default function VibeCodingMasteryPage() {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSticky, setShowSticky] = useState(false);
  const [info, setInfo] = useState(FALLBACK);

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 720);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prix / titre lus depuis la base (modifiables dans /admin).
  useEffect(() => {
    fetchCourseById(VIBE_COURSE_ID).then((c) => {
      if (c) setInfo({ price: c.price, originalPrice: c.originalPrice, title: c.title });
    });
  }, []);

  // Retour d'une connexion Google (voir CheckoutModal) : on rouvre directement le
  // paiement, sans repasser par une étape de connexion séparée.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") !== "1") return;
    params.delete("checkout");
    const qs = params.toString();
    window.history.replaceState({}, "", window.location.pathname + (qs ? `?${qs}` : ""));
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setCheckoutOpen(true);
    });
  }, []);

  // Le paiement dirige directement vers la modale : si l'utilisateur n'est pas
  // encore connecté, elle crée son compte (ou le connecte) sur place avant de
  // lancer le paiement — plus d'étape de connexion séparée avant d'acheter.
  const handleBuy = () => setCheckoutOpen(true);

  const PrimaryCTA = ({ label, className = "" }: { label: string; className?: string }) => (
    <button
      onClick={handleBuy}
      className={`px-8 py-4 rounded-xl font-bold text-white gradient-btn inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform ${className}`}
    >
      {label}
      <Rocket className="w-5 h-5" />
    </button>
  );

  return (
    <div className="w-full overflow-hidden pb-24 pt-10 sm:pt-11">
      {/* Barre d'urgence : compte à rebours de l'offre de lancement, visible en permanence */}
      <UrgencyBar />

      {/* Sélecteur de thème clair/sombre (la navbar est masquée sur cette landing) */}
      <div className="fixed top-14 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* ══════════ 1. HERO ══════════ */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20">
        <div className="vibe-grid absolute inset-0 -z-10 pointer-events-none" aria-hidden />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[520px] h-[320px] bg-emerald-500/15 rounded-full blur-[130px] -z-10 pointer-events-none" aria-hidden />

        <div className="text-center max-w-4xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2 mb-7">
            {HERO_BADGES.map(({ Icon, text }) => (
              <span key={text} className="animate-fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-300">
                <Icon className="w-3.5 h-3.5" /> {text}
              </span>
            ))}
          </div>

          <span className="animate-fade-up brand-font block text-sm sm:text-base font-black tracking-[0.35em] text-emerald-400 mb-4">
            VIBE CODING MASTERY
          </span>

          <h1 className="animate-fade-up ad-1 text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.08] mb-6">
            Créez et lancez votre propre <span className="gradient-text">SaaS</span> grâce à l'IA.
            <span className="block text-2xl sm:text-3xl font-bold text-gray-300 mt-4">
              Même si vous n'avez jamais écrit une ligne de code.
            </span>
          </h1>

          <p className="animate-fade-up ad-2 text-lg text-gray-400 leading-relaxed mb-9 max-w-2xl mx-auto">
            À la fin de ce programme, vous aurez <span className="text-white font-semibold">développé et mis en ligne votre propre SaaS</span> — prêt à accueillir vos premiers utilisateurs et à être commercialisé.
          </p>

          <div className="animate-fade-up ad-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryCTA label="Rejoindre le Défi 30 jours" />
            <a href="#programme" className="px-8 py-4 rounded-xl font-bold text-gray-300 hover:text-white glass-panel border-white/10 hover:border-white/25 transition-all inline-flex items-center gap-2">
              Découvrir la méthode <ArrowDown className="w-4 h-4" />
            </a>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-400">
            {TRUST.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {t}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-14 max-w-3xl mx-auto">
          <HeroVideo />
        </div>

        <div className="mt-10 max-w-3xl mx-auto">
          <TerminalSimulator />
          <p className="text-center text-xs text-gray-500 mt-3">↑ Voilà à quoi ressemble « vibe coder » : vous décrivez, l'IA construit, votre SaaS se met en ligne.</p>
        </div>
      </section>

      {/* ══════════ 2. LA NOUVELLE RÉALITÉ ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow>La nouvelle réalité</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            L'IA vient de <span className="gradient-text">tout changer</span>. Définitivement.
          </h2>
          <p className="text-gray-400 text-lg">
            La création de logiciels ne se joue plus au niveau technique. Elle se joue au niveau de la méthode. Ceux qui l'adoptent aujourd'hui prendront une avance impossible à rattraper.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {NEW_REALITY.map(({ Icon, title, text }) => (
            <div key={title} className="glass-panel rounded-2xl border-white/5 p-8 glass-panel-hover text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6 mx-auto">
                <Icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 3. IMAGINEZ DANS 30 JOURS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow color="orange">Imaginez dans 30 jours</Eyebrow>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-5 leading-tight">
              Dans un mois, <span className="gradient-text">votre SaaS est en ligne.</span>
            </h2>
            <p className="text-gray-300 leading-relaxed mb-8">
              Fermez les yeux une seconde. On est dans 30 jours. Ce que vous avez aujourd'hui dans la tête est devenu une vraie application, que d'autres utilisent. Voici ce que vous vivez :
            </p>
            <PrimaryCTA label="Je veux vivre ça" />
          </div>
          <ul className="space-y-4">
            {IMAGINE.map((item, i) => (
              <li key={i} className="flex items-start gap-4 glass-panel rounded-2xl border-white/5 p-5">
                <div className="w-8 h-8 rounded-lg gradient-btn flex items-center justify-center text-xs font-black text-white shrink-0">{i + 1}</div>
                <span className="text-gray-200 font-medium leading-snug">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══════════ 4. LES ERREURS À ÉVITER ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow color="orange">Les pièges qui coûtent des années</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            Pourquoi 9 personnes sur 10 ne lancent jamais rien
          </h2>
          <p className="text-gray-400 text-lg">Ce n'est pas une question de talent. C'est une question de chemin. Voici les 4 impasses les plus courantes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MISTAKES.map(({ Icon, title, text }) => (
            <div key={title} className="glass-panel rounded-2xl border-white/5 p-8 flex gap-5">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Icon className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 5. POURQUOI VIBE CODING MASTERY ══════════ */}
      <section id="methode" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow>La solution</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            Une méthode. Un objectif. <span className="gradient-text">Votre SaaS en ligne.</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Vibe Coding Mastery n'est pas une pile de vidéos. C'est un chemin guidé, du premier jour à la publication de votre application.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY.map(({ Icon, title, text }) => (
            <div key={title} className="glass-panel rounded-2xl border-white/5 p-7 glass-panel-hover text-center">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 mx-auto">
                <Icon className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 6. PRÉSENTATION D'EHONAM ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-center">
          <div className="lg:col-span-2">
            <div className="glass-panel rounded-3xl border-white/10 overflow-hidden aspect-[4/5] relative">
              {FOUNDER_PHOTO ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={FOUNDER_PHOTO} alt="Ehonam, formateur & SaaS Builder" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-emerald-900/20 to-orange-900/10">
                  <Camera className="w-10 h-10 mb-3 opacity-60" />
                  <p className="text-sm">Photo d'Ehonam</p>
                </div>
              )}
              <div className="absolute bottom-4 left-4 right-4 glass-panel rounded-xl border-white/10 px-4 py-3">
                <p className="text-white font-bold">Ehonam</p>
                <p className="text-xs text-emerald-400">Formateur · SaaS Builder</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <Eyebrow color="orange">Votre formateur</Eyebrow>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 mb-5 leading-tight">
              Il ne vous enseigne pas la théorie. <br className="hidden sm:inline" />Il vous montre son vrai métier.
            </h2>
            <p className="text-gray-300 leading-relaxed mb-4">
              Ehonam est <span className="text-white font-semibold">SaaS Builder</span> : il conçoit et lance de vraies applications, utilisées par de vrais clients. Il ne partage pas des idées — il partage <span className="text-white font-semibold">son processus de travail exact</span>.
            </p>
            <p className="text-gray-400 leading-relaxed mb-8">
              En plus de ses propres produits, il accompagne des entrepreneurs dans la création de leur SaaS. Toute la formation repose sur cette expérience de terrain.
            </p>
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <p className="text-2xl sm:text-3xl font-black gradient-text">3 SaaS</p>
                <p className="text-xs text-gray-500">lancés en production</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">De vrais clients</p>
                <p className="text-xs text-gray-500">écoles, entreprises, freelances</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-white">Des entrepreneurs</p>
                <p className="text-xs text-gray-500">accompagnés sur leurs projets</p>
              </div>
            </div>
          </div>
        </div>

        {/* Galerie des réalisations */}
        <div className="mt-16 sm:mt-20">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <Eyebrow>Ses réalisations</Eyebrow>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-3">
              Des SaaS déjà en production, utilisés chaque jour
            </h3>
            <p className="text-gray-400 mt-2 text-sm">
              Ce ne sont pas des démos. Ce sont de vrais produits, en ligne, avec de vrais utilisateurs — construits avec la méthode que vous allez apprendre.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PRODUCTS.map((p) => (
              <BrowserFrame key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ 7. LE PARCOURS COMPLET ══════════ */}
      <section id="programme" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow>Le parcours complet</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            De l'idée à la <span className="gradient-text">commercialisation</span>
          </h2>
          <p className="text-gray-400 text-lg">Un chemin en 10 étapes. Rien n'est laissé au hasard, rien n'est oublié.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {JOURNEY.map(({ Icon, title, text }, i) => (
            <div key={title} className="glass-panel rounded-2xl border-white/5 p-5 relative text-center">
              <span className="absolute top-4 right-4 text-3xl font-black text-white/5">{String(i + 1).padStart(2, "0")}</span>
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4 mx-auto">
                <Icon className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-white font-bold mb-1">{title}</h3>
              <p className="text-gray-500 text-xs leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 8. LES MODULES ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow color="orange">Le Défi 30 jours, semaine par semaine</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            Ce que vous serez capable de faire
          </h2>
          <p className="text-gray-400 text-lg">On ne vous décrit pas des vidéos. On vous dit ce que vous saurez faire à la fin de chaque semaine.</p>
        </div>
        <div className="space-y-5">
          {MODULES.map(({ week, title, outcome, points }, i) => (
            <div key={week} className="glass-panel rounded-2xl border-white/5 p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start glass-panel-hover">
              <div className="lg:col-span-4">
                <span className="inline-block text-xs font-black text-orange-400 uppercase tracking-widest mb-2">{week}</span>
                <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">{title}</h3>
              </div>
              <div className="lg:col-span-8">
                <div className="flex items-start gap-3 mb-5 bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4">
                  <Target className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-emerald-100/90 text-sm font-medium">{outcome}</p>
                </div>
                <ul className="grid sm:grid-cols-2 gap-3">
                  {points.map((p) => (
                    <li key={p} className="flex items-start gap-2.5 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 9. LES BONUS ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow>Les accélérateurs offerts</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            4 bonus pour aller <span className="gradient-text">deux fois plus vite</span>
          </h2>
          <p className="text-gray-400 text-lg">Inclus dans le programme, sans supplément.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {BONUSES.map(({ badge, title, value, text }) => (
            <div key={badge} className="glass-panel rounded-2xl border-white/5 p-8 relative overflow-hidden glass-panel-hover">
              <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-black text-orange-300 bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                  <Gift className="w-3 h-3" /> {badge}
                </span>
                <span className="text-xs font-bold text-emerald-400">Valeur {value}</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 10. CE QUE VOUS SAUREZ FAIRE ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <Eyebrow color="orange">Vos nouvelles compétences</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            À la fin, voici ce que vous saurez faire
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-4xl mx-auto">
          {OUTCOMES.map((o) => (
            <div key={o} className="flex items-center gap-3 glass-panel rounded-xl border-white/5 px-5 py-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="text-gray-200 text-sm font-medium">{o}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ 11. À QUI S'ADRESSE ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow>Pour qui ?</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            Si vous avez une idée, <span className="gradient-text">c'est pour vous</span>
          </h2>
          <p className="text-gray-400 text-lg">Aucun prérequis technique. Une seule condition : l'envie de passer à l'action.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {AUDIENCE.map(({ Icon, t }) => (
            <div key={t} className="glass-panel rounded-2xl border-white/5 p-6 text-center glass-panel-hover">
              <Icon className="w-7 h-7 text-emerald-400 mx-auto mb-3" />
              <p className="text-white font-semibold text-sm">{t}</p>
            </div>
          ))}
        </div>
        <p className="text-center text-gray-400 mt-8 max-w-xl mx-auto text-sm">
          <span className="text-white font-semibold">Ce n'est pas pour vous</span> si vous cherchez une pilule magique sans effort. Ici, on construit vraiment — et on va au bout.
        </p>
      </section>

      {/* ══════════ 12. TÉMOIGNAGES ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <Eyebrow color="orange">Ils sont passés à l'action</Eyebrow>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mt-3 mb-4 leading-tight">
            Ce qu'ils pensent de VIBE CODING MASTERY
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((tm, i) => (
            <div key={i} className="glass-panel rounded-2xl border-white/5 p-7 flex flex-col">
              <Quote className="w-8 h-8 text-emerald-400/40 mb-4" />
              <p className="text-gray-300 text-sm leading-relaxed flex-grow italic">{tm.text}</p>
              <div className="flex items-center gap-1 mt-4 text-orange-400">
                {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-current" />)}
              </div>
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-white/5">
                <div className="w-9 h-9 rounded-full gradient-btn" />
                <div>
                  <p className="text-white text-sm font-bold">{tm.name}</p>
                  <p className="text-gray-500 text-xs">{tm.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════ PRICING ══════════ */}
      <section id="pricing" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="glass-panel rounded-3xl border-white/10 p-8 sm:p-12 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn" />
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <span className="inline-block text-xs font-black text-orange-300 bg-orange-500/10 border border-orange-500/20 px-4 py-1.5 rounded-full mb-6">
            Offre spéciale de lancement
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Rejoignez le Défi 30 jours</h2>
          <p className="text-gray-400 max-w-lg mx-auto mb-8">
            Accès à vie au programme complet, au Défi 30 jours, aux 4 bonus et à toutes les mises à jour futures.
          </p>

          {/* Value stack */}
          <div className="text-left max-w-md mx-auto mb-8 space-y-2.5">
            {[
              ["Programme complet Vibe Coding Mastery", "Inclus"],
              ["Le Défi 30 jours (idée → SaaS en ligne)", "Inclus"],
              ["Bibliothèque de prompts SaaS", "45 000 FCFA"],
              ["Discord privé des SaaS Builders", "69 000 FCFA"],
              ["Coaching live mensuel", "50 000 FCFA"],
              ["Modèles de déploiement & sécurité", "47 000 FCFA"],
            ].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between gap-4 text-sm border-b border-white/5 pb-2.5">
                <span className="flex items-center gap-2 text-gray-300"><Check className="w-4 h-4 text-emerald-400 shrink-0" /> {label}</span>
                <span className="text-gray-500 shrink-0">{val}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col items-center mb-8">
            <span className="text-lg text-gray-500 line-through">{info.originalPrice}</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-5xl sm:text-6xl font-black text-orange-400">{info.price}</span>
            </div>
            <span className="text-xs text-gray-500 uppercase tracking-widest mt-2">Paiement unique · accès à vie</span>
          </div>

          <button
            onClick={handleBuy}
            className="w-full sm:w-auto px-10 py-4 rounded-xl font-bold text-white gradient-btn inline-flex items-center justify-center gap-2 shadow-lg cursor-pointer hover:scale-[1.02] transition-transform"
          >
            <CreditCard className="w-5 h-5" /> Je rejoins le Défi 30 jours
          </button>

          <p className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Paiement sécurisé Moneroo (Carte / Mobile Money) · accès immédiat dans « Mon espace »
          </p>

          <Countdown />
        </div>
      </section>

      {/* ══════════ 14. GARANTIE ══════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="glass-panel rounded-3xl border-emerald-500/20 p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center shrink-0">
            <BadgeCheck className="w-10 h-10 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">Garantie 14 jours — zéro risque</h3>
            <p className="text-gray-400 leading-relaxed">
              Rejoignez le programme, suivez les premières étapes du Défi 30 jours, installez vos outils et commencez à construire. Si dans les 14 jours vous estimez que ce n'est pas pour vous, un simple e-mail suffit pour être <span className="text-white font-semibold">remboursé intégralement</span>. Le seul risque, c'est de rester exactement là où vous êtes aujourd'hui.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════ 13. FAQ ══════════ */}
      <section id="faq" className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 border-t border-white/5">
        <div className="text-center mb-12">
          <Eyebrow>On répond à tout</Eyebrow>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">Vos questions, nos réponses</h2>
        </div>
        <div className="space-y-3">
          {FAQ.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="glass-panel rounded-2xl border-white/5 overflow-hidden">
                <button onClick={() => setOpenFaq(open ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left" aria-expanded={open}>
                  <span className="text-sm sm:text-md font-bold text-white">{item.q}</span>
                  <span className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    {open ? <Minus className="w-4 h-4 text-orange-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                  </span>
                </button>
                {open && <div className="px-6 pb-5 -mt-1"><p className="text-sm text-gray-400 leading-relaxed">{item.a}</p></div>}
              </div>
            );
          })}
        </div>
      </section>

      {/* ══════════ 15. DERNIER CTA ══════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4">
        <div className="glass-panel rounded-3xl border-white/10 p-10 sm:p-16 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/8 to-orange-500/8 pointer-events-none" />
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <Flame className="w-12 h-12 text-orange-400 mx-auto mb-6" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white mb-5 leading-tight max-w-3xl mx-auto">
            Dans 30 jours, vous aurez soit un SaaS en ligne… <span className="gradient-text">soit les mêmes regrets.</span>
          </h2>
          <p className="text-gray-300 max-w-xl mx-auto mb-4 text-lg">
            L'IA n'attendra pas. Ceux qui agissent maintenant construisent l'avenir. Les autres le regarderont passer.
          </p>
          <p className="text-gray-400 max-w-xl mx-auto mb-9">
            Vous avez l'idée. Vous avez enfin la méthode. Il ne manque plus qu'une décision.
          </p>
          <PrimaryCTA label="Je lance mon SaaS maintenant" className="text-lg px-10 py-5" />
          <p className="text-xs text-gray-500 mt-5">Accès immédiat · Garantie 14 jours · Paiement sécurisé Moneroo</p>
        </div>
      </section>

      {/* Sticky CTA */}
      {showSticky && (
        <div className="fixed bottom-0 left-0 w-full z-40 glass-panel border-t border-white/10 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">Défi 30 jours — lancez votre SaaS</p>
              <p className="text-xs text-gray-400">
                <span className="text-gray-500 line-through mr-2">{info.originalPrice}</span>
                <span className="text-emerald-400 font-bold">{info.price}</span> · accès à vie
              </p>
            </div>
            <button onClick={handleBuy} className="shrink-0 px-5 sm:px-7 py-3 rounded-xl font-bold text-white gradient-btn inline-flex items-center gap-2 shadow-md text-sm">
              Rejoindre <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        itemTitle={info.title}
        price={info.price}
        itemType="course"
        itemId={VIBE_COURSE_ID}
        successMessage="Bienvenue dans le Défi 30 jours ! Votre accès est disponible dans « Mon espace »."
      />
    </div>
  );
}

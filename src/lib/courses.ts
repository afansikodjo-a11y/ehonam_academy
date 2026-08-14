// ──────────────────────────────────────────────────────────────
// Single source of truth for the course catalogue.
// Consumed by the home page, the course detail page and the admin
// dashboard. Replace this in-memory data with a Supabase query when
// the backend is wired up — the shape below is the contract.
// ──────────────────────────────────────────────────────────────

export interface Lesson {
  title: string;
  duration: string;
  /** Legacy: bare YouTube id (still supported for playback) */
  youtubeId?: string;
  /** Full video link (YouTube watch/share, youtu.be, or Google Drive share) */
  videoUrl?: string;
}

export interface Chapter {
  title: string;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  /** Formatted price for display, e.g. "45 000 FCFA" */
  price: string;
  /** Raw amount used for payment/checkout */
  priceNumeric: number;
  /** Strikethrough reference price (formatted, derived from originalPriceNumeric) */
  originalPrice: string;
  /** Raw strikethrough amount (0 = none) */
  originalPriceNumeric?: number;
  duration: string;
  students: string;
  rating: number;
  category: string;
  tag?: string;
  /** Tailwind gradient classes for the card header */
  gradient: string;
  /** Tailwind hover border classes for the card */
  borderColor: string;
  /** Cover image URL (thumbnail). Empty = dégradé + icône par défaut. */
  image?: string;
  chapters: Chapter[];
  /** Show the "X heures" duration mention (default true) */
  showDuration?: boolean;
  /** Show the "X leçons" count mention (default true) */
  showLessons?: boolean;
  /** Inscriptions fermées : le bouton d'achat devient une liste d'attente (default false) */
  closed?: boolean;
}

/**
 * Identifiant du programme « Vibe Coding Mastery ».
 * Il possède sa propre page de vente dédiée (/vibe-coding-mastery) et est
 * volontairement masqué de la grille du catalogue de l'accueil.
 */
export const VIBE_COURSE_ID = "vibe-coding-mastery";

/**
 * Identifiant de la formation « Créer des Affiches Professionnelles avec l'IA ».
 * Possède sa propre page de vente dédiée (/formation-affiche-ia).
 */
export const AFFICHE_COURSE_ID = "formation-affiche-ia";

/**
 * Identifiant de la formation « Créer des Portraits Professionnels avec l'IA ».
 * Possède sa propre page de vente dédiée (/formation-photo-portrait-ia).
 */
export const PORTRAIT_COURSE_ID = "formation-photo-portrait-ia";

export const courses: Course[] = [
  {
    id: PORTRAIT_COURSE_ID,
    title: "Créer des Portraits Professionnels avec l'IA",
    description:
      "Apprenez à créer des portraits professionnels grâce à l'intelligence artificielle — photo de profil LinkedIn, CV, réseaux sociaux, portraits artistiques et bien plus, sans appareil photo ni studio.",
    price: "15 000 FCFA",
    priceNumeric: 15000,
    originalPrice: "45 000 FCFA",
    originalPriceNumeric: 45000,
    duration: "Accès à vie",
    students: "0",
    rating: 5.0,
    category: "Photographie",
    tag: "Nouveau",
    gradient: "from-emerald-600/20 to-orange-600/20",
    borderColor: "group-hover:border-emerald-500/50",
    showDuration: false,
    showLessons: false,
    chapters: [
      {
        title: "L'IA et le portrait professionnel",
        lessons: [
          { title: "Le potentiel de l'IA pour créer des portraits professionnels", duration: "—" },
          { title: "Les meilleurs outils IA pour le portrait", duration: "—" },
          { title: "Les principes d'un portrait qui inspire confiance", duration: "—" },
        ],
      },
      {
        title: "Maîtriser l'art du prompt portrait",
        lessons: [
          { title: "Décrire une pose, une lumière et une expression avec précision", duration: "—" },
          { title: "Garder un visage cohérent d'une génération à l'autre", duration: "—" },
          { title: "Itérer et affiner un portrait étape par étape", duration: "—" },
        ],
      },
      {
        title: "Portraits professionnels & corporate",
        lessons: [
          { title: "Photo de profil LinkedIn et CV qui inspire confiance", duration: "—" },
          { title: "Portraits d'équipe et trombinoscopes d'entreprise", duration: "—" },
          { title: "Portraits pour entrepreneurs et indépendants", duration: "—" },
        ],
      },
      {
        title: "Portraits réseaux sociaux & créatifs",
        lessons: [
          { title: "Photo de profil Instagram, Facebook et TikTok", duration: "—" },
          { title: "Portraits artistiques, mode et éditorial", duration: "—" },
          { title: "Avatars et identités visuelles personnalisées", duration: "—" },
        ],
      },
      {
        title: "Retouche, restauration & compétence",
        lessons: [
          { title: "Améliorer et restaurer d'anciennes photos avec l'IA", duration: "—" },
          { title: "Corriger les détails et augmenter la qualité d'un portrait", duration: "—" },
          { title: "Constituer un portfolio et vendre des séances de portraits IA", duration: "—" },
        ],
      },
    ],
  },
  {
    id: AFFICHE_COURSE_ID,
    title: "Créer des Affiches Professionnelles avec l'IA",
    description:
      "Apprenez à créer des affiches professionnelles de différents types grâce à l'intelligence artificielle — promotions, événements, restaurants, réseaux sociaux et bien plus.",
    price: "15 000 FCFA",
    priceNumeric: 15000,
    originalPrice: "45 000 FCFA",
    originalPriceNumeric: 45000,
    duration: "Accès à vie",
    students: "0",
    rating: 5.0,
    category: "Design",
    tag: "Nouveau",
    gradient: "from-orange-600/20 to-emerald-600/20",
    borderColor: "group-hover:border-orange-500/50",
    showDuration: false,
    showLessons: false,
    chapters: [
      {
        title: "L'IA et la création d'affiches",
        lessons: [
          { title: "Le potentiel de l'IA pour créer des affiches professionnelles", duration: "—" },
          { title: "Les meilleurs outils IA pour la création graphique", duration: "—" },
          { title: "Les principes d'une affiche qui capte l'attention", duration: "—" },
        ],
      },
      {
        title: "Maîtriser l'art du prompt visuel",
        lessons: [
          { title: "La structure d'un prompt efficace pour les visuels", duration: "—" },
          { title: "Les mots-clés qui font la différence", duration: "—" },
          { title: "Itérer et affiner vos créations étape par étape", duration: "—" },
        ],
      },
      {
        title: "Affiches commerciales & promotionnelles",
        lessons: [
          { title: "Affiches de promotion pour boutiques et commerces", duration: "—" },
          { title: "Visuels publicitaires pour Facebook et Instagram", duration: "—" },
          { title: "Affiches de soldes et offres spéciales", duration: "—" },
        ],
      },
      {
        title: "Affiches restaurants, événements & entreprises",
        lessons: [
          { title: "Menus et affiches de restaurant", duration: "—" },
          { title: "Affiches d'événements et flyers de formations", duration: "—" },
          { title: "Affiches institutionnelles pour entreprises", duration: "—" },
        ],
      },
      {
        title: "Visuels réseaux sociaux & amélioration IA",
        lessons: [
          { title: "Visuels Instagram, Facebook, TikTok et LinkedIn", duration: "—" },
          { title: "Affiches produits et packagings", duration: "—" },
          { title: "Retoucher et améliorer des photos existantes avec l'IA", duration: "—" },
        ],
      },
    ],
  },
  {
    id: VIBE_COURSE_ID,
    title: "Vibe Coding Mastery",
    description:
      "Le bootcamp pour concevoir et lancer vos applications et SaaS en pilotant l'IA — Antigravity, Claude Code, Gemini, Supabase, Vercel, Git & GitHub — sans écrire de code manuellement.",
    price: "35 000 FCFA",
    priceNumeric: 35000,
    originalPrice: "149 000 FCFA",
    originalPriceNumeric: 149000,
    duration: "Accès à vie",
    students: "320",
    rating: 4.9,
    category: "Développement",
    tag: "Nouveau",
    gradient: "from-emerald-600/20 to-orange-600/20",
    borderColor: "group-hover:border-emerald-500/50",
    showDuration: false,
    chapters: [
      {
        title: "Fondations & Écosystème IA",
        lessons: [
          { title: "Prise en main d'Antigravity pour le co-développement", duration: "—" },
          { title: "Lancement rapide de Claude Code dans votre terminal", duration: "—" },
          { title: "Modèles Gemini : paramètres avancés de contexte", duration: "—" },
        ],
      },
      {
        title: "L'Art du Prompting Structurel",
        lessons: [
          { title: "Rédaction de documents de spécifications pour l'IA", duration: "—" },
          { title: "Guidage itératif étape par étape (prompt chaining)", duration: "—" },
          { title: "Gestion du contexte et des jetons (token management)", duration: "—" },
        ],
      },
      {
        title: "Débogage & Résolution Contextuelle",
        lessons: [
          { title: "Lecture et transmission des logs de la console", duration: "—" },
          { title: "Technique du « sandboxing » pour tester les modules", duration: "—" },
          { title: "Briser les boucles d'erreurs récurrentes de l'IA", duration: "—" },
        ],
      },
      {
        title: "Déploiement Cloud & Supabase",
        lessons: [
          { title: "Déploiement automatisé en production sur Vercel", duration: "—" },
          { title: "Base de données SQL et authentification avec Supabase", duration: "—" },
          { title: "Intégration et sécurisation des webhooks de paiement", duration: "—" },
        ],
      },
    ],
  },
  {
    id: "nextjs-fullstack",
    title: "Devenir Développeur Full-Stack avec React, Next.js & Supabase",
    description:
      "Apprenez à concevoir des applications web de bout en bout, de l'interface de paiement Moneroo à l'intégration d'une base de données PostgreSQL sécurisée sur Supabase.",
    price: "45 000 FCFA",
    priceNumeric: 45000,
    originalPrice: "90 000 FCFA",
    duration: "42 heures",
    students: "1,240",
    rating: 4.9,
    category: "Développement",
    tag: "Populaire",
    gradient: "from-emerald-600/20 to-teal-600/20",
    borderColor: "group-hover:border-emerald-500/50",
    chapters: [
      {
        title: "Introduction & Architecture",
        lessons: [
          { title: "Présentation de la formation & objectifs", duration: "08:12", youtubeId: "ScMzIvxBSi4" },
          { title: "Configuration de l'environnement Next.js 15 & Tailwind", duration: "15:45", youtubeId: "ScMzIvxBSi4" },
        ],
      },
      {
        title: "Le Cœur de Next.js (App Router)",
        lessons: [
          { title: "Routage dynamique & Pages spéciales", duration: "24:10", youtubeId: "ScMzIvxBSi4" },
          { title: "Server Components vs Client Components", duration: "32:15", youtubeId: "ScMzIvxBSi4" },
        ],
      },
      {
        title: "Base de Données & Authentification",
        lessons: [
          { title: "Mise en place de Supabase Database", duration: "28:50", youtubeId: "ScMzIvxBSi4" },
          { title: "Authentification avec Row Level Security (RLS)", duration: "35:40", youtubeId: "ScMzIvxBSi4" },
        ],
      },
      {
        title: "Passerelle de Paiement Moneroo",
        lessons: [
          { title: "Intégration de l'API Moneroo Checkout", duration: "42:10", youtubeId: "ScMzIvxBSi4" },
          { title: "Gestion sécurisée du Webhook de confirmation", duration: "30:15", youtubeId: "ScMzIvxBSi4" },
        ],
      },
    ],
  },
  {
    id: "uiux-figma",
    title: "Masterclass UI/UX Design : Maîtriser Figma de A à Z",
    description:
      "Créez des interfaces utilisateurs sublimes et ergonomiques pour le web et le mobile grâce aux meilleures pratiques de design.",
    price: "25 000 FCFA",
    priceNumeric: 25000,
    originalPrice: "50 000 FCFA",
    duration: "28 heures",
    students: "850",
    rating: 4.8,
    category: "Design",
    tag: "Nouveau",
    gradient: "from-orange-600/20 to-amber-600/20",
    borderColor: "group-hover:border-orange-500/50",
    chapters: [
      {
        title: "Les Fondations de l'UI/UX",
        lessons: [
          { title: "Introduction aux règles d'utilisabilité", duration: "12:15", youtubeId: "ScMzIvxBSi4" },
          { title: "Théorie des couleurs et typographie moderne", duration: "18:40", youtubeId: "ScMzIvxBSi4" },
        ],
      },
      {
        title: "Maîtrise de Figma",
        lessons: [
          { title: "Utilisation des Auto-Layouts complexes", duration: "35:10", youtubeId: "ScMzIvxBSi4" },
          { title: "Composants réutilisables & Variantes", duration: "40:20", youtubeId: "ScMzIvxBSi4" },
        ],
      },
    ],
  },
  {
    id: "business-afrique",
    title: "Lancer et Réussir son Business en Ligne en Afrique",
    description:
      "Stratégies concrètes de marketing digital, de e-commerce et de logistique adaptées au marché ouest et centre africain.",
    price: "30 000 FCFA",
    priceNumeric: 30000,
    originalPrice: "60 000 FCFA",
    duration: "18 heures",
    students: "1,980",
    rating: 4.9,
    category: "Business",
    tag: "Best-seller",
    gradient: "from-emerald-600/20 to-teal-600/20",
    borderColor: "group-hover:border-emerald-500/50",
    chapters: [
      {
        title: "Comprendre le Marché Digital Local",
        lessons: [
          { title: "Opportunités et contraintes du e-commerce", duration: "15:20", youtubeId: "ScMzIvxBSi4" },
          { title: "Ciblage publicitaire avec Facebook/TikTok", duration: "25:35", youtubeId: "ScMzIvxBSi4" },
        ],
      },
      {
        title: "Logistique, Livraisons & Paiements",
        lessons: [
          { title: "Optimiser les livraisons à domicile", duration: "22:15", youtubeId: "ScMzIvxBSi4" },
          { title: "Intégration de passerelle de paiement locale", duration: "19:50", youtubeId: "ScMzIvxBSi4" },
        ],
      },
    ],
  },
];

/** Format an amount as a price, e.g. 45000 → "45 000 FCFA". 0/empty → "". */
export function formatPrice(n: number | null | undefined): string {
  const v = Number(n);
  if (!v || v <= 0) return "";
  return `${v.toLocaleString("fr-FR").replace(/ | /g, " ")} FCFA`;
}

// Paramètres pour un lecteur YouTube le plus épuré possible :
// nocookie (privacy), pas d'annotations, suggestions limitées à la chaîne,
// lecture inline sur mobile. (YouTube impose tout de même son logo, le titre
// et l'écran de fin — non supprimables dans une vidéo intégrée.)
function youtubeEmbed(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&color=white`;
}

/** Turn a YouTube or Google Drive link (or bare YouTube id) into an embeddable URL. */
export function videoEmbedUrl(input: string): string {
  const s = (input || "").trim();
  if (!s) return "";
  // YouTube (watch, youtu.be, embed)
  const yt = s.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) return youtubeEmbed(yt[1]);
  // Bare 11-char YouTube id
  if (/^[\w-]{11}$/.test(s)) return youtubeEmbed(s);
  // Google Drive
  if (s.includes("drive.google.")) {
    const gd = s.match(/\/file\/d\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
    if (gd) return `https://drive.google.com/file/d/${gd[1]}/preview`;
  }
  // Fallback: assume it's already a valid embed URL
  return s;
}

/** Embeddable URL for a lesson (prefers videoUrl, falls back to youtubeId). */
export function lessonVideoSrc(lesson: Lesson): string {
  return videoEmbedUrl(lesson.videoUrl || lesson.youtubeId || "");
}

/** Direct <img> src for a cover image (convertit les liens de partage Google Drive). */
export function courseImageSrc(input: string | undefined | null): string {
  const s = (input || "").trim();
  if (!s) return "";
  if (s.includes("drive.google.")) {
    const gd = s.match(/\/file\/d\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
    if (gd) return `https://drive.google.com/thumbnail?id=${gd[1]}&sz=w1200`;
  }
  return s;
}

/** Find a course by its id. */
export function getCourse(id: string): Course | undefined {
  return courses.find((c) => c.id === id);
}

/** Flatten every lesson of a course into a single ordered list. */
export function getAllLessons(course: Course): Lesson[] {
  return course.chapters.flatMap((ch) => ch.lessons);
}

/** Total number of lessons in a course. */
export function lessonCount(course: Course): number {
  return course.chapters.reduce((total, ch) => total + ch.lessons.length, 0);
}

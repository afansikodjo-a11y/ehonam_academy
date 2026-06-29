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
  chapters: Chapter[];
  /** Show the "X heures" duration mention (default true) */
  showDuration?: boolean;
  /** Show the "X leçons" count mention (default true) */
  showLessons?: boolean;
}

export const courses: Course[] = [
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

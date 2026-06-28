// ──────────────────────────────────────────────────────────────
// Blog post type + static fallback (used when Supabase isn't configured).
// ──────────────────────────────────────────────────────────────

export type PostStatus = "draft" | "published";

export interface BlogPost {
  id: string; // slug
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  coverImage: string; // optional URL ("")
  gradient: string;
  status: PostStatus;
  /** ISO timestamp; the post is live when status="published" and publishedAt <= now */
  publishedAt: string;
}

export const staticPosts: BlogPost[] = [
  {
    id: "bienvenue-sur-ehonam-academy",
    title: "Bienvenue sur Ehonam Academy",
    excerpt:
      "Découvrez la plateforme : formations en ligne, accompagnement privé et conseils pour réussir votre reconversion digitale.",
    content:
      "Bienvenue sur Ehonam Academy !\n\nCette plateforme rassemble des formations à forte valeur ajoutée et un accompagnement privé pour vous aider à développer des compétences technologiques et financières.\n\nQue vous souhaitiez devenir développeur, maîtriser le design, lancer votre business en ligne ou progresser en trading, vous trouverez ici des contenus concrets et un suivi personnalisé.\n\nBonne découverte, et surtout : passez à l'action !",
    category: "Actualités",
    author: "Ehonam AFANSI",
    coverImage: "",
    gradient: "from-emerald-600/20 to-teal-600/20",
    status: "published",
    publishedAt: "2026-06-01T09:00:00.000Z",
  },
  {
    id: "reussir-sa-reconversion-digitale",
    title: "5 clés pour réussir sa reconversion digitale",
    excerpt:
      "La reconversion vers le digital est à la portée de tous, à condition d'avoir une méthode. Voici 5 principes essentiels.",
    content:
      "La reconversion vers le digital est à la portée de tous, à condition d'avoir une méthode claire.\n\n1. Clarifiez votre objectif : choisissez un métier précis plutôt que de vous disperser.\n\n2. Apprenez en faisant : la pratique régulière vaut mieux que la théorie accumulée.\n\n3. Entourez-vous : un mentor accélère votre progression et vous évite des erreurs coûteuses.\n\n4. Construisez un portfolio : montrez ce que vous savez faire, pas seulement ce que vous avez appris.\n\n5. Soyez régulier : la constance sur plusieurs mois fait toute la différence.\n\nAvec de la discipline et le bon accompagnement, votre transition réussira.",
    category: "Conseils",
    author: "Ehonam AFANSI",
    coverImage: "",
    gradient: "from-orange-600/20 to-amber-600/20",
    status: "published",
    publishedAt: "2026-06-15T09:00:00.000Z",
  },
];

/** Format an ISO date to a readable French date. */
export function formatPostDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

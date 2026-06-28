// ──────────────────────────────────────────────────────────────
// Private coaching / accompagnement offers.
// This is the personalised, 1-on-1 side of the activity (as opposed
// to the self-paced formations in courses.ts). Single source of truth
// consumed by the home page.
// ──────────────────────────────────────────────────────────────

export interface CoachingOffer {
  id: string;
  title: string;
  /** Short punchy line under the title */
  tagline: string;
  description: string;
  /** Formatted price for display, e.g. "150 000 FCFA" */
  price: string;
  /** Raw amount used for payment/checkout */
  priceNumeric: number;
  /** Delivery format, e.g. "Visio 1-on-1 · 6 séances" */
  format: string;
  highlights: string[];
  popular?: boolean;
  /** Tailwind gradient classes for the card accent */
  gradient: string;
}

export const coachingOffers: CoachingOffer[] = [
  {
    id: "accompagnement-web-saas",
    title: "Accompagnement Web & SaaS",
    tagline: "De l'idée au produit en ligne",
    description:
      "Un suivi privé pour concevoir, développer et lancer votre application ou projet SaaS, avec une feuille de route claire et des points hebdomadaires.",
    price: "150 000 FCFA",
    priceNumeric: 150000,
    format: "Visio 1-on-1 · 6 séances · 3 mois",
    highlights: [
      "Audit de votre projet & roadmap personnalisée",
      "Architecture technique et choix des outils",
      "Revue de code et bonnes pratiques",
      "Support prioritaire par message entre les séances",
    ],
    gradient: "from-teal-600/20 to-emerald-600/20",
  },
  {
    id: "mentorat-trading-forex",
    title: "Mentorat Trading & Forex",
    tagline: "Trader avec rigueur et méthode",
    description:
      "Un mentorat individuel centré sur la gestion des risques, le plan de trading et la discipline, basé sur des stratégies validées sur le marché du Forex.",
    price: "120 000 FCFA",
    priceNumeric: 120000,
    format: "Visio 1-on-1 · 8 séances · 2 mois",
    highlights: [
      "Construction de votre plan de trading",
      "Gestion stricte du risque et du capital",
      "Analyse de vos trades en direct",
      "Suivi de votre journal de trading",
    ],
    popular: true,
    gradient: "from-orange-600/20 to-amber-600/20",
  },
  {
    id: "coaching-reconversion-digitale",
    title: "Coaching Reconversion Digitale",
    tagline: "Lancer son business en ligne",
    description:
      "Un accompagnement sur-mesure pour réussir votre transition vers le digital : positionnement, première offre et premiers clients sur le marché africain.",
    price: "90 000 FCFA",
    priceNumeric: 90000,
    format: "Visio 1-on-1 · 4 séances · 1 mois",
    highlights: [
      "Clarification de votre projet et de vos objectifs",
      "Définition d'une offre qui se vend",
      "Plan d'acquisition de vos premiers clients",
      "Accountability et suivi des actions",
    ],
    gradient: "from-emerald-600/20 to-teal-600/20",
  },
];

import { GraduationCap, Users, FileText, type LucideIcon } from "lucide-react";

// Réalisations réelles d'Ehonam (SaaS en production), réutilisées comme
// preuve de savoir-faire sur vibe-coding-mastery et /saas-builder.
export interface PortfolioProduct {
  name: string;
  tag: string;
  Icon: LucideIcon;
  image: string;
  desc: string;
  accent: string;
  url: string;
}

export const SAAS_PORTFOLIO: PortfolioProduct[] = [
  {
    name: "GeScole",
    tag: "EdTech · Gestion scolaire",
    Icon: GraduationCap,
    image: "/gescole.png",
    desc: "Plateforme 100 % cloud qui digitalise la gestion des établissements : élèves, notes, présences, finances et communication.",
    accent: "text-emerald-400",
    url: "https://www.gescole.com",
  },
  {
    name: "Edossime",
    tag: "Marketplace · Talents africains",
    Icon: Users,
    image: "/edossime.png",
    desc: "La marketplace de l'élite du freelancing africain, où expertise humaine et IA se combinent pour livrer plus vite.",
    accent: "text-orange-400",
    url: "https://www.edossime.com",
  },
  {
    name: "ChapFacture",
    tag: "FinTech · Gestion commerciale",
    Icon: FileText,
    image: "/chapfacture.png",
    desc: "Devis, factures, proformas, bons de commande et de livraison — avec suivi des paiements, en quelques secondes.",
    accent: "text-emerald-400",
    url: "https://www.chapfacture.com",
  },
];

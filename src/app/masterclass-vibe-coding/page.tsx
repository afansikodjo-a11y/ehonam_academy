import type { Metadata } from "next";
import MasterclassVibeCodingClient from "./MasterclassVibeCodingClient";

export const metadata: Metadata = {
  title: "Masterclass Vibe Coding — Créez votre application avec l'IA, sans coder | Ehonam Academy",
  description:
    "Transformez votre idée en véritable application web grâce à l'intelligence artificielle. La méthode Vibe Coding pour entrepreneurs et porteurs de projets non techniques, pensée pour l'Afrique francophone. Masterclass à 7 500 FCFA.",
  keywords: [
    "Vibe Coding",
    "créer une application avec l'IA",
    "créer une application sans coder",
    "formation Vibe Coding",
    "créer une application web avec l'IA",
    "intelligence artificielle",
    "création d'application",
    "formation IA Afrique",
  ],
  openGraph: {
    title: "Masterclass Vibe Coding — Créez votre application avec l'IA, sans coder",
    description:
      "Transformez votre idée en véritable application web grâce à l'IA, même si vous ne savez pas coder. La méthode Vibe Coding pour non-développeurs, pensée pour l'Afrique francophone.",
    type: "website",
    locale: "fr_FR",
    siteName: "Ehonam Academy",
  },
  twitter: {
    card: "summary_large_image",
    title: "Masterclass Vibe Coding — Créez votre application avec l'IA, sans coder",
    description: "Transformez votre idée en véritable application web grâce à l'IA, même si vous ne savez pas coder.",
  },
};

export default function MasterclassVibeCodingPage() {
  return <MasterclassVibeCodingClient />;
}

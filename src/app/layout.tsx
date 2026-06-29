import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: "Ehonam Academy - Plateforme de Formations en Ligne Premium",
  description: "Achetez et suivez vos formations en ligne facilement via Carte Bancaire. Espace d'apprentissage immersif de qualité supérieure.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <body className="antialiased min-h-screen flex flex-col justify-between selection:bg-emerald-500/30">
        <ThemeProvider>
          {/* Glow Effects Background */}
          <div className="glow-blob w-[500px] h-[500px] bg-orange-600 top-[-10%] left-[-10%] animated-glow-1"></div>
          <div className="glow-blob w-[500px] h-[500px] bg-emerald-600 bottom-[10%] right-[-10%] animated-glow-2"></div>

          {/* Header / Navbar */}
          <Navbar />

          {/* Main Content (z-20 so modals inside pages stack above the footer) */}
          <main className="flex-grow z-20 relative">
            {children}
          </main>

          {/* Footer */}
          <footer className="site-footer z-10 relative border-t border-black/5 dark:border-white/5 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <img src="/logo-mark.svg" alt="" aria-hidden="true" className="h-8 w-auto" />
                <span className="brand-font text-lg font-extrabold tracking-tight">
                  <span className="brand-green">Ehonam</span> <span className="brand-orange">Academy</span>
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 text-center md:text-left whitespace-nowrap">
                &copy; {new Date().getFullYear()} Ehonam Academy. Tous droits réservés.
              </p>
              <div className="flex gap-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Conditions</a>
                <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
                <a href="/contact" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}

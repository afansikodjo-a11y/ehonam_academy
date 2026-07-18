"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { User, Menu, X, Compass, Sparkles, Mail, Newspaper, LogOut, LayoutDashboard, UserCog } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { isCurrentUserAdmin } from "@/lib/auth";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [spaceHref, setSpaceHref] = useState("/");
  const router = useRouter();
  const pathname = usePathname();

  // Landing page dédiée : aucune navigation (funnel de vente).
  const hideNav = pathname === "/vibe-coding-mastery";

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let active = true;
    const refresh = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      if (data.session) {
        setLoggedIn(true);
        setSpaceHref((await isCurrentUserAdmin()) ? "/admin/dashboard" : "/mon-espace");
      } else {
        setLoggedIn(false);
      }
    };
    refresh();
    const { data: sub } = supabase.auth.onAuthStateChange(() => refresh());
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
  };

  const accountBtnClass =
    "flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white gradient-btn shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all whitespace-nowrap";

  if (hideNav) return null;

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <img
            src="/logo-mark.svg"
            alt=""
            aria-hidden="true"
            className="h-9 sm:h-10 w-auto group-hover:scale-105 transition-transform duration-300"
          />
          <span className="brand-font text-lg sm:text-2xl font-extrabold tracking-tight">
            <span className="brand-green">Ehonam</span> <span className="brand-orange">Academy</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#accompagnement" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            Accompagnement
          </Link>
          <Link href="/#courses" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
            <Compass className="w-4 h-4" />
            Formations
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
            <Newspaper className="w-4 h-4" />
            Blog
          </Link>
          <Link href="/contact" className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
            <Mail className="w-4 h-4" />
            Contact
          </Link>
        </nav>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* Dark/Light Mode Toggle */}
          <ThemeToggle />

          {loggedIn ? (
            <>
              <Link href={spaceHref} className={accountBtnClass}>
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Mon espace</span>
              </Link>
              <Link
                href="/profil"
                aria-label="Mon profil"
                title="Mon profil"
                className="hidden md:flex items-center justify-center p-2.5 rounded-full text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                <UserCog className="w-4 h-4" />
              </Link>
              <button
                onClick={handleLogout}
                aria-label="Déconnexion"
                className="hidden md:flex items-center justify-center p-2.5 rounded-full text-gray-300 hover:text-white border border-white/10 hover:bg-white/5 transition-all"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <Link href="/login" className={accountBtnClass}>
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Se Connecter</span>
            </Link>
          )}

          {/* Toggle Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X className="w-5.5 h-5.5" /> : <Menu className="w-5.5 h-5.5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isOpen && (
        <div className="md:hidden glass-panel border-t border-white/5 absolute top-20 left-0 w-full p-6 space-y-4 shadow-2xl backdrop-blur-lg">
          <nav className="flex flex-col gap-4">
            <Link
              href="/#accompagnement"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2"
            >
              <Sparkles className="w-4.5 h-4.5" />
              Accompagnement
            </Link>
            <Link
              href="/#courses"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2"
            >
              <Compass className="w-4.5 h-4.5" />
              Formations
            </Link>
            <Link
              href="/blog"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2"
            >
              <Newspaper className="w-4.5 h-4.5" />
              Blog
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2"
            >
              <Mail className="w-4.5 h-4.5" />
              Contact
            </Link>
            {loggedIn && (
              <>
                <Link
                  href={spaceHref}
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2 border-t border-white/5 pt-4"
                >
                  <LayoutDashboard className="w-4.5 h-4.5" />
                  Mon espace
                </Link>
                <Link
                  href="/profil"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-semibold text-gray-300 hover:text-white transition-colors flex items-center gap-2 py-2"
                >
                  <UserCog className="w-4.5 h-4.5" />
                  Mon profil
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm font-semibold text-rose-300 hover:text-rose-200 transition-colors flex items-center gap-2 py-2 w-full text-left"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Déconnexion
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  Flame, Sparkles, CheckCircle2, ArrowRight, XCircle,
  Zap, Building2, Wand2, RefreshCw, Lock, Clock,
  ShieldCheck, Briefcase, GraduationCap, Rocket, Users,
  Plus, Minus, MessageCircle,
} from "lucide-react";
import Eyebrow from "@/components/Eyebrow";
import BrowserFrame from "@/components/BrowserFrame";
import { SAAS_PORTFOLIO } from "@/lib/portfolio";
import { useScrollReveal } from "@/lib/useScrollReveal";
import { trackFbEvent } from "@/lib/fb-pixel";

const CONTACT_HREF = `/contact?sujet=${encodeURIComponent("Projet SaaS / application métier")}`;

const TRUST_PILLS = [
  "3 SaaS déjà en production",
  "Une équipe dédiée, délais record",
  "Développement accéléré par l'IA",
  "Maintenance après la mise en ligne",
];

const PAIN_POINTS = [
  { text: "Vous gérez encore votre activité avec Excel, WhatsApp ou du papier, et ça devient ingérable." },
  { text: "Aucun logiciel du marché ne correspond exactement à votre façon de travailler." },
  { text: "Les agences de développement sont lentes et chères, avec des délais de plusieurs mois." },
  { text: "Vous avez une idée de SaaS mais vous ne savez pas par où commencer techniquement." },
  { text: "Un outil interne existe déjà, mais il est instable, dépassé, ou plus personne ne peut le maintenir." },
  { text: "Vous voulez digitaliser un processus (facturation, stock, RH, réservations…) sans recruter une équipe technique." },
];

const SERVICES = [
  { Icon: Zap, title: "SaaS multi-utilisateurs", text: "Votre propre plateforme, prête à être commercialisée auprès de vos clients." },
  { Icon: Building2, title: "Applications métier internes", text: "Gestion, facturation, stock, RH, CRM — construits autour de votre process réel." },
  { Icon: Wand2, title: "Automatisation de tâches", text: "Remplacer les tâches manuelles répétitives par des outils qui font le travail." },
  { Icon: RefreshCw, title: "Reprise d'un outil existant", text: "Refondre une application instable ou obsolète sans repartir de zéro." },
  { Icon: Lock, title: "Base de données & paiements sécurisés", text: "Authentification, base de données et intégration de paiement, dès la conception." },
  { Icon: Clock, title: "Maintenance & évolution", text: "Un accompagnement continu après la mise en ligne, pas juste une livraison." },
];

const PROCESS = [
  { step: "Cadrage", text: "Un échange pour comprendre votre besoin réel, votre process actuel et vos contraintes." },
  { step: "Proposition", text: "Un périmètre clair, un délai et un prix, avant de commencer quoi que ce soit." },
  { step: "Conception", text: "Maquettes et architecture technique validées avec vous avant le développement." },
  { step: "Développement", text: "Construction assistée par l'IA pour avancer vite sans sacrifier la qualité." },
  { step: "Déploiement", text: "Mise en ligne sécurisée et prise en main avec votre équipe." },
  { step: "Suivi", text: "Maintenance, évolutions et support après la livraison." },
];

const WHY = [
  { Icon: Users, title: "Une équipe dédiée à votre projet", text: "Développeurs et pilote de projet mobilisés pour vous, pas un généraliste isolé sur dix dossiers à la fois." },
  { Icon: Zap, title: "Des délais record", text: "Une équipe rodée à l'IA, avec les méthodes qui ont déjà permis de livrer 3 SaaS en production." },
  { Icon: Briefcase, title: "Expérience de terrain", text: "Des produits réellement utilisés par de vrais clients, pas des démos." },
  { Icon: ShieldCheck, title: "Zéro engagement caché", text: "Un périmètre et un prix validés avant de démarrer, pas de surprise en cours de route." },
];

const AUDIENCE = [
  { Icon: Briefcase, t: "PME & TPE" },
  { Icon: GraduationCap, t: "Écoles & centres de formation" },
  { Icon: Rocket, t: "Startups avec un MVP à lancer" },
  { Icon: Users, t: "Associations & organisations" },
  { Icon: Building2, t: "Entreprises avec un process à digitaliser" },
  { Icon: Sparkles, t: "Entrepreneurs avec une idée de produit" },
];

const FAQ = [
  { q: "Combien de temps prend un projet ?", a: "Ça dépend du périmètre : un outil métier simple peut être livré en quelques semaines, un SaaS complet prend plus de temps. Le délai exact est toujours donné avant de démarrer, dans la proposition." },
  { q: "Quel budget prévoir ?", a: "Chaque projet est chiffré sur mesure selon son périmètre réel — il n'y a pas de tarif unique. Le premier échange sert justement à cadrer le besoin et à vous donner un prix clair avant tout engagement." },
  { q: "Est-ce que je reste propriétaire de mon application ?", a: "Oui. Le code et le produit livré vous appartiennent." },
  { q: "Que se passe-t-il après la mise en ligne ?", a: "Un suivi de maintenance et d'évolution est proposé après la livraison, pour que votre outil continue de vivre avec votre activité." },
  { q: "Puis-je juste avoir un avis technique sans développement complet ?", a: "Oui, un premier échange de cadrage ne vous engage à rien : il sert à clarifier votre besoin, que vous décidiez de continuer ou non." },
];

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
      {children}
    </h2>
  );
}

export default function SaasBuilderPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showSticky, setShowSticky] = useState(false);
  useScrollReveal();

  useEffect(() => {
    const onScroll = () => setShowSticky(window.scrollY > 720);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    trackFbEvent("ViewContent", {
      content_name: "SaaS Builder — Prestations sur mesure",
      content_type: "service",
    });
  }, []);

  return (
    <>
      {/* Sticky CTA */}
      <div className={`fixed bottom-0 left-0 w-full z-50 transition-all duration-500 ${showSticky ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"}`}>
        <div className="glass-panel border-t border-white/10 px-4 py-3 sm:py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="hidden sm:block">
              <p className="text-sm font-bold text-white">SaaS Builder — prestations sur mesure</p>
              <p className="text-xs text-gray-400 mt-0.5">Un projet en tête ? Discutons-en.</p>
            </div>
            <a
              href={CONTACT_HREF}
              id="sticky-cta"
              className="gradient-btn flex-1 sm:flex-none px-6 py-3 rounded-xl text-white font-black text-sm tracking-wide text-center"
            >
              DISCUTONS DE VOTRE PROJET →
            </a>
          </div>
        </div>
      </div>

      <div className="relative min-h-screen">
        {/* Background glows */}
        <div className="glow-blob w-[600px] h-[600px] bg-emerald-600 top-[-5%] right-[-15%] animated-glow-2" />
        <div className="glow-blob w-[500px] h-[500px] bg-orange-600 top-[30%] left-[-10%] animated-glow-1" />

        {/* ── HERO ── */}
        <section className="relative pt-10 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 vibe-grid pointer-events-none" />
          <div className="relative max-w-7xl mx-auto z-10">

            <div className="flex flex-wrap items-center justify-center gap-3 mb-8 animate-fade-up ad-1">
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-bold text-orange-400">
                <Flame className="w-3.5 h-3.5" /> Prestations sur mesure
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-panel border-white/10 text-xs font-bold text-emerald-400">
                <Sparkles className="w-3.5 h-3.5" /> Développement assisté par l'IA
              </span>
            </div>

            <div className="text-center mb-8">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight animate-fade-up ad-1 mb-4">
                Votre <span className="gradient-text">SaaS</span> ou votre application métier,
                {" "}conçue et livrée par un vrai SaaS Builder.
              </h1>
              <p className="text-xl sm:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed animate-fade-up ad-2 mt-6">
                Ehonam et son équipe conçoivent et développent des plateformes SaaS et des outils métier sur mesure pour les entreprises —
                {" "}<strong className="text-white">en temps record, grâce à une équipe outillée à l'IA.</strong>
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-fade-up ad-2">
              {TRUST_PILLS.map((pill) => (
                <span key={pill} className="flex items-center gap-1.5 text-xs text-gray-300 px-3 py-1.5 rounded-full glass-panel border-white/8">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  {pill}
                </span>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-fade-up ad-3">
              <a
                href={CONTACT_HREF}
                id="hero-cta-primary"
                className="gradient-btn w-full sm:w-auto px-8 py-4 rounded-xl text-white font-black text-base sm:text-lg tracking-wide flex items-center justify-center gap-2 shadow-2xl"
              >
                <MessageCircle className="w-5 h-5" />
                DISCUTONS DE VOTRE PROJET
              </a>
            </div>

            {/* Portfolio en aperçu */}
            <div className="max-w-5xl mx-auto animate-fade-up ad-3">
              <p className="text-center text-xs uppercase tracking-widest text-gray-500 font-bold mb-5">Déjà en production</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {SAAS_PORTFOLIO.map((p) => (
                  <BrowserFrame key={p.name} {...p} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLÈME ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">Vous reconnaissez-vous ?</Eyebrow>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mt-3 leading-tight">
                Gérer une entreprise sans les bons outils…<br />
                <span className="gradient-text">ça finit toujours par coûter plus cher.</span>
              </h2>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-lg">
                Voilà ce que vivent la plupart des entreprises avant de digitaliser leur activité.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {PAIN_POINTS.map(({ text }, i) => (
                <div key={i} className="glass-panel rounded-2xl p-5 border-white/5 flex items-start gap-4 reveal">
                  <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <XCircle className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center reveal">
              <div className="inline-block glass-panel rounded-2xl px-8 py-6 border-orange-500/15">
                <p className="text-xl sm:text-2xl font-black text-white">Si l'une de ces situations vous parle…</p>
                <p className="text-orange-400 font-bold mt-2">c'est exactement ce que mon équipe et moi résolvons.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Ce qui peut être construit pour vous</Eyebrow>
              <SectionTitle>
                Des outils pensés{" "}
                <span className="gradient-text">pour votre activité réelle</span>
              </SectionTitle>
              <p className="text-gray-400 mt-4 max-w-2xl mx-auto">
                Pas de solution générique : chaque projet part de votre process, pas d'un modèle tout fait.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SERVICES.map(({ Icon, title, text }, i) => (
                <div key={i} className="glass-panel rounded-2xl border-white/5 p-7 glass-panel-hover reveal">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                    <Icon className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow color="orange">Comment ça se passe</Eyebrow>
              <SectionTitle>
                Un processus clair,{" "}
                <span className="gradient-text">du premier échange à la livraison</span>
              </SectionTitle>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {PROCESS.map(({ step, text }, i) => (
                <div key={step} className="glass-panel rounded-2xl border-white/5 p-6 relative reveal">
                  <span className="absolute top-4 right-4 text-3xl font-black text-white/5">{String(i + 1).padStart(2, "0")}</span>
                  <div className="w-10 h-10 rounded-lg gradient-btn flex items-center justify-center mb-4 text-xs font-black text-white">
                    {i + 1}
                  </div>
                  <h3 className="text-white font-bold mb-2">{step}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── POURQUOI ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-emerald-500/15 reveal">
              <div className="text-center mb-10">
                <Eyebrow>Pourquoi travailler avec Ehonam</Eyebrow>
                <h2 className="text-3xl sm:text-4xl font-black text-white mt-3 leading-tight">
                  Une équipe qui construit.{" "}
                  <span className="gradient-text">Des délais qui tiennent.</span>
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {WHY.map(({ Icon, title, text }, i) => (
                  <div key={i} className="text-center">
                    <div className="w-14 h-14 rounded-2xl gradient-btn mx-auto flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="font-black text-white mb-2">{title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── POUR QUI ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Pour qui ?</Eyebrow>
              <SectionTitle>
                Cette offre est faite{" "}
                <span className="gradient-text">pour vous si…</span>
              </SectionTitle>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {AUDIENCE.map(({ Icon, t }, i) => (
                <div key={i} className="glass-panel glass-panel-hover rounded-2xl p-5 border-white/5 text-center reveal">
                  <div className="w-12 h-12 rounded-xl gradient-btn mx-auto flex items-center justify-center mb-3">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-gray-200 text-xs font-semibold leading-snug">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OFFRE / CTA ── */}
        <section id="contact-cta" className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border-emerald-500/20 shadow-2xl text-center reveal">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Un projet en tête ?</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Le premier échange sert à cadrer votre besoin et vous donner un périmètre et un prix clairs — sans engagement.
              </p>
              <a
                href={CONTACT_HREF}
                id="pricing-cta"
                className="gradient-btn w-full py-4 rounded-xl text-white font-black text-base tracking-wide flex items-center justify-center gap-2 shadow-xl"
              >
                <ArrowRight className="w-5 h-5" />
                DISCUTONS DE VOTRE PROJET
              </a>
              <p className="text-center text-xs text-gray-500 mt-4">Réponse sous 24h · Premier échange sans engagement</p>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14 reveal">
              <Eyebrow>Vos questions</Eyebrow>
              <SectionTitle>
                On répond à{" "}
                <span className="gradient-text">vos doutes</span>
              </SectionTitle>
            </div>
            <div className="space-y-3">
              {FAQ.map(({ q, a }, i) => (
                <div key={i} className="glass-panel rounded-2xl border-white/5 overflow-hidden reveal">
                  <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left">
                    <span className="font-bold text-white text-sm sm:text-base pr-4">{q}</span>
                    <div className="shrink-0 w-7 h-7 rounded-lg glass-panel flex items-center justify-center border-white/10">
                      {openFaq === i ? <Minus className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4 text-gray-400" />}
                    </div>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 border-t border-white/5 pt-4">
                      <p className="text-gray-400 text-sm leading-relaxed">{a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
          <div className="absolute inset-0 vibe-grid pointer-events-none opacity-60" />
          <div className="glow-blob w-[600px] h-[600px] bg-emerald-600 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animated-glow-1 opacity-15" />

          <div className="relative max-w-4xl mx-auto z-10 text-center reveal">
            <Eyebrow color="orange">La décision vous appartient</Eyebrow>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white mt-4 mb-6 leading-tight">
              Pendant que vous hésitez,{" "}
              <span className="gradient-text">vos concurrents digitalisent.</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-4">
              Chaque mois passé avec les mêmes outils manuels, c'est du temps et de l'argent perdus.
            </p>
            <p className="text-xl font-bold text-white max-w-2xl mx-auto leading-relaxed mb-12">
              Un échange de 20 minutes suffit pour savoir si votre projet est réalisable,{" "}
              <span className="gradient-text">et à quel prix.</span>
            </p>

            <a
              href={CONTACT_HREF}
              id="final-cta"
              className="gradient-btn inline-flex items-center justify-center gap-3 px-10 py-5 rounded-xl text-white font-black text-lg tracking-wide shadow-2xl mb-4"
            >
              <MessageCircle className="w-6 h-6" />
              DISCUTONS DE VOTRE PROJET
            </a>
            <p className="text-xs text-gray-500">Réponse sous 24h · Aucun engagement</p>
          </div>
        </section>
      </div>
    </>
  );
}

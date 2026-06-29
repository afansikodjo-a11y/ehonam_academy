"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Play, Sparkles, BookOpen, Clock, Users, ArrowRight, Star, Smartphone, ShieldCheck, Zap, CreditCard, Video, Check, Newspaper, Calendar } from "lucide-react";
import { courses as staticCourses, type Course } from "@/lib/courses";
import { fetchPublishedCourses } from "@/lib/courses-db";
import { coachingOffers as staticOffers, type CoachingOffer } from "@/lib/coaching";
import { fetchPublishedCoaching } from "@/lib/coaching-db";
import { staticPosts as staticBlogPosts, formatPostDate, type BlogPost } from "@/lib/blog";
import { fetchLivePosts } from "@/lib/blog-db";
import CheckoutModal from "@/components/CheckoutModal";
import Reveal from "@/components/Reveal";

export default function HomePage() {
  const router = useRouter();
  const [selectedOffer, setSelectedOffer] = useState<CoachingOffer | null>(null);
  const [courses, setCourses] = useState<Course[]>(staticCourses);
  const [offers, setOffers] = useState<CoachingOffer[]>(staticOffers);
  const [posts, setPosts] = useState<BlogPost[]>(staticBlogPosts.slice(0, 3));

  useEffect(() => {
    fetchPublishedCourses().then(setCourses);
    fetchPublishedCoaching().then(setOffers);
    fetchLivePosts().then((p) => setPosts(p.slice(0, 3)));
  }, []);

  const startCoaching = async (offer: CoachingOffer) => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
      return;
    }
    setSelectedOffer(offer);
  };

  return (
    <div className="w-full pb-12 sm:pb-24">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-20 pb-10 sm:pb-16 text-center">
        {/* Glow behind Title */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/20 rounded-full filter blur-[100px] pointer-events-none"></div>

        {/* Main Heading */}
        <h1 className="animate-fade-up text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Propulsez votre carrière,{" "}<br className="hidden sm:inline" />
          appréhendez votre{" "}
          <span className="gradient-text font-black">reconversion professionnelle</span>
        </h1>

        {/* Description */}
        <p className="animate-fade-up ad-1 max-w-2xl mx-auto text-lg text-gray-400 mb-10 leading-relaxed">
          Accédez à des formations et accompagnements qui vous outillent pour faire face aux grands changements de notre siècle.
        </p>

        {/* CTA Buttons */}
        <div className="animate-fade-up ad-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <a href="#accompagnement" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg cursor-pointer">
            Découvrir l'accompagnement
            <ArrowRight className="w-5 h-5" />
          </a>
          <a href="#courses" className="w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-gray-300 hover:text-white glass-panel border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-2">
            Voir les formations
          </a>
        </div>
      </section>

      {/* Benefits / Features Section */}
      <section id="benefits" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="glass-panel p-8 rounded-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-500/10 rounded-full filter blur-xl group-hover:scale-125 transition-transform"></div>
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center mb-6 mx-auto">
              <Users className="w-6 h-6 text-orange-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Accompagnement Personnalisé</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Bénéficiez d'un suivi individuel et de mentors expérimentés pour vous guider pas à pas dans votre transition professionnelle.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-panel p-8 rounded-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full filter blur-xl group-hover:scale-125 transition-transform"></div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center mb-6 mx-auto">
              <Video className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Sessions Privées en Visio</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Des séances individuelles en direct, adaptées à votre rythme et à vos objectifs, pour progresser avec un accompagnement réellement sur-mesure.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-panel p-8 rounded-2xl border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/10 rounded-full filter blur-xl group-hover:scale-125 transition-transform"></div>
            <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center mb-6 mx-auto">
              <Zap className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Accès à Vie & Mises à jour</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Apprenez à votre rythme. Une fois le cours acheté, le contenu reste disponible à vie ainsi que toutes les futures leçons.
            </p>
          </div>
        </div>
      </section>

      {/* Accompagnement Privé Section */}
      <section id="accompagnement" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-white/5">
        <Reveal className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-xs font-bold text-orange-300 mb-5">
            <Sparkles className="w-3.5 h-3.5" />
            Accompagnement privé
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Un suivi <span className="gradient-text">1-on-1</span> pour atteindre vos objectifs
          </h2>
          <p className="text-gray-400">
            Au-delà des formations, bénéficiez d'un accompagnement personnalisé en visio, pensé pour votre projet et votre rythme.
          </p>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className={`group glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col glass-panel-hover relative ${offer.popular ? "ring-1 ring-orange-500/40" : ""}`}
            >
              {/* Accent header */}
              <div className={`h-2 w-full bg-gradient-to-r ${offer.gradient}`}></div>

              <div className="p-7 flex-grow flex flex-col">
                <h3 className="text-xl font-bold text-white">{offer.title}</h3>
                <p className="text-xs font-semibold text-orange-300 mt-1 mb-4">{offer.tagline}</p>
                <p className="text-gray-400 text-sm leading-relaxed mb-5">{offer.description}</p>

                <div className="flex items-center gap-2 text-xs text-gray-500 mb-5">
                  <Users className="w-3.5 h-3.5" />
                  {offer.format}
                </div>

                <ul className="space-y-3 mb-6">
                  {offer.highlights.map((h, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300">
                      <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-emerald-400" />
                      </div>
                      {h}
                    </li>
                  ))}
                </ul>

                {/* Price + CTA */}
                <div className="mt-auto pt-5 border-t border-white/5 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-gray-500 uppercase tracking-widest">À partir de</span>
                    <span className="text-lg font-black text-white">{offer.price}</span>
                  </div>
                  <button
                    onClick={() => startCoaching(offer)}
                    className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white gradient-btn flex items-center gap-1.5 shadow-md shrink-0"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Démarrer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Courses Catalogue Grid */}
      <section id="courses" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Explorez nos Formations Disponibles
            </h2>
            <p className="text-gray-400 max-w-xl">
              Choisissez la compétence que vous souhaitez développer et commencez dès aujourd'hui.
            </p>
          </div>
          <span className="text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1 mt-4 md:mt-0">
            {courses.length} cours actifs
          </span>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <div key={course.id} className="group glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col justify-between glass-panel-hover cursor-pointer">
              {/* Header Image Gradient */}
              <div className={`h-48 w-full bg-gradient-to-br ${course.gradient} relative flex items-center justify-center border-b border-white/5`}>
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                  {course.category}
                </div>
                {course.tag && (
                  <div className="absolute top-4 right-4 bg-orange-600 px-3 py-1 rounded-full text-xs font-bold text-white shadow-md">
                    {course.tag}
                  </div>
                )}
                <BookOpen className="w-16 h-16 text-white/40 group-hover:scale-110 transition-transform duration-300" />
              </div>

              {/* Course Info */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-orange-300 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {course.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-4 mb-6">
                  {course.showDuration !== false && course.duration && (
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {course.duration}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    {course.students} apprenants
                  </span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    {course.rating}
                  </span>
                </div>

                {/* Purchase Area */}
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    {course.originalPrice && (
                      <span className="text-xs text-gray-500 line-through">{course.originalPrice}</span>
                    )}
                    <span className="text-lg font-black text-white">{course.price}</span>
                  </div>
                  <Link href={`/cours/${course.id}`} className="px-5 py-2.5 rounded-xl text-xs font-extrabold text-white gradient-btn flex items-center gap-1.5 shadow-md">
                    Découvrir le cours
                    <Play className="w-3 h-3 fill-current" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-white/5 relative">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[300px] h-[300px] bg-orange-500/10 rounded-full filter blur-[120px] pointer-events-none"></div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Side: Photo with interactive premium frames */}
          <div className="lg:col-span-5 flex justify-center relative group">
            {/* Ambient Purple/Indigo Glow backing */}
            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500 to-emerald-500 rounded-3xl filter blur-2xl opacity-20 group-hover:opacity-30 group-hover:scale-105 transition-all duration-500"></div>
            
            {/* The Outer Glassy Card */}
            <div className="relative p-3.5 glass-panel rounded-3xl border-white/10 shadow-2xl transition-transform duration-500 group-hover:scale-[1.01]">
              <img 
                src="/ehonam.jpg" 
                alt="Ehonam AFANSI"
                className="w-full max-w-[320px] lg:max-w-full rounded-2xl object-cover aspect-[4/5] object-center border border-white/5 filter brightness-95 group-hover:brightness-100 transition-all duration-500"
              />
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md border border-white/10 px-5 py-3 rounded-2xl shadow-xl flex items-center justify-center gap-2 whitespace-nowrap">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                <span className="text-xs font-bold">Disponible pour vous guider</span>
              </div>
            </div>
          </div>

          {/* Right Side: Text & Selling Presentation Copy */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-orange-400" />
              À Propos du Fondateur
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
              Faites décoller vos projets avec{" "}
              <span className="gradient-text font-black">Ehonam AFANSI</span>
            </h2>
            
            <p className="text-gray-300 leading-relaxed text-sm sm:text-md">
              Bonjour ! Je suis <span className="text-white font-semibold">Ehonam AFANSI</span>, Web entrepreneur, promoteur de plusieurs plateformes numériques et projets SaaS à succès, et Trader-Formateur sur le marché du Forex. 
            </p>
            <p className="text-gray-400 leading-relaxed text-sm">
              Mon objectif à travers <span className="text-white font-semibold">Ehonam Academy</span> est de démocratiser l&apos;accès aux compétences à forte valeur ajoutée technologique et financière. J&apos;accompagne la nouvelle génération de talents en Afrique à concevoir des applications, bâtir des business en ligne pérennes et maîtriser les marchés financiers avec rigueur.
            </p>

            {/* Quick Pitch list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4">
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">SaaS & Web Entrepreneuriat</h4>
                  <p className="text-xs text-gray-500 mt-1">Conception et promotion de projets tech adaptés aux réalités du marché local.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Expertise Forex & Trading</h4>
                  <p className="text-xs text-gray-500 mt-1">Formations basées sur une gestion des risques stricte et des stratégies validées.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-teal-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Paiement Carte & Mobile Money</h4>
                  <p className="text-xs text-gray-500 mt-1">Réglez en toute sécurité par Carte Visa/Mastercard ou Mobile Money (Orange, MTN, Moov, Wave).</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Accompagnement & Mentorat</h4>
                  <p className="text-xs text-gray-500 mt-1">Un suivi continu pour s'assurer que vous atteignez vos objectifs professionnels.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 border-t border-white/5 mt-10">
        <Reveal>
          <h2 className="text-3xl font-extrabold text-white text-center mb-12">
            Ils apprennent avec nous
          </h2>
        </Reveal>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div className="glass-panel p-7 rounded-xl border-white/5">
            <p className="text-gray-300 italic text-sm leading-relaxed mb-4">
              "Grâce à l'inscription en ligne ultra rapide, j'ai pu commencer immédiatement la formation Figma. Le contenu est de grande qualité et très orienté vers la pratique !"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center font-bold text-emerald-300 text-sm">
                MK
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Mamadou Kone</h4>
                <p className="text-xs text-gray-500">UI/UX Designer, Abidjan</p>
              </div>
            </div>
          </div>

          <div className="glass-panel p-7 rounded-xl border-white/5">
            <p className="text-gray-300 italic text-sm leading-relaxed mb-4">
              "La formation Next.js est complète. J'ai beaucoup apprécié le lecteur de cours sans distraction. L'intégration de Supabase m'a permis de créer mes premières applications !"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center font-bold text-orange-300 text-sm">
                AS
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Awa Sarr</h4>
                <p className="text-xs text-gray-500">Développeuse Web, Dakar</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Derniers articles du blog */}
      {posts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 border-t border-white/5">
          <Reveal className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300 mb-4">
                <Newspaper className="w-3.5 h-3.5" />
                Le Blog
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">Derniers articles</h2>
              <p className="text-gray-400 max-w-xl">
                Conseils et actualités pour avancer dans votre projet.
              </p>
            </div>
            <Link
              href="/blog"
              className="text-sm font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 mt-4 md:mt-0"
            >
              Voir tout le blog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col glass-panel-hover"
              >
                <div className={`h-40 w-full bg-gradient-to-br ${post.gradient} relative flex items-center justify-center border-b border-white/5`}>
                  {post.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={post.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <Newspaper className="w-10 h-10 text-white/40 group-hover:scale-110 transition-transform duration-300" />
                  )}
                  {post.category && (
                    <span className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                      {post.category}
                    </span>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatPostDate(post.publishedAt)}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-2 mb-4">{post.excerpt}</p>
                  <span className="mt-auto text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                    Lire l'article
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <CheckoutModal
        open={selectedOffer !== null}
        onClose={() => setSelectedOffer(null)}
        itemTitle={selectedOffer?.title ?? ""}
        price={selectedOffer?.price ?? ""}
        itemType="coaching"
        itemId={selectedOffer?.id ?? ""}
        successMessage="Paiement validé ! Votre accompagnement apparaît dans « Mon espace ». Je vous recontacte sous 24h."
      />
    </div>
  );
}

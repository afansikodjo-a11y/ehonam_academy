"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, CreditCard, Award, BookOpen, Layers, Check, Clock, PlayCircle, Loader2 } from "lucide-react";
import { getCourse, getAllLessons, type Course } from "@/lib/courses";
import { fetchCourseById } from "@/lib/courses-db";
import { supabase } from "@/lib/supabase";
import CheckoutModal from "@/components/CheckoutModal";

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [course, setCourse] = useState<Course | null>(() => getCourse(id) ?? null);
  const [loading, setLoading] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  useEffect(() => {
    let active = true;
    fetchCourseById(id).then((c) => {
      if (active) {
        if (c) setCourse(c);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [id]);

  if (!course) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
        {loading ? (
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
        ) : (
          <div className="space-y-5">
            <p className="text-white font-bold text-lg">Formation introuvable.</p>
            <button
              onClick={() => router.push("/")}
              className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au catalogue
            </button>
          </div>
        )}
      </div>
    );
  }

  const allLessons = getAllLessons(course);

  const handleBuy = async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      router.push("/login");
      return;
    }
    setCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au catalogue
      </button>

      {/* Main Grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left Column: Presentation + Programme */}
        <div className="lg:col-span-2 space-y-8">
          {/* HERO PRESENTATION */}
          <div className="p-8 sm:p-12 glass-panel rounded-3xl border-white/5 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full filter blur-3xl"></div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300">
              <Award className="w-3.5 h-3.5" />
              Formation de niveau professionnel
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight">
              {course.title}
            </h1>
            <p className="text-gray-300 leading-relaxed text-md sm:text-lg">
              {course.description}
            </p>
            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-400">
              <span className="flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-emerald-400" />
                {course.duration} de formation
              </span>
              <span className="flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-emerald-400" />
                {allLessons.length} leçons
              </span>
            </div>
          </div>

          {/* PROGRAMME DE LA FORMATION */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-emerald-400" />
              Programme de la formation
            </h2>

            <div className="space-y-4">
              {course.chapters.map((chapter, chIndex) => (
                <div key={chIndex} className="glass-panel rounded-2xl border-white/5 overflow-hidden">
                  <div className="bg-white/3 px-6 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-gray-200">
                      Module {chIndex + 1} : {chapter.title}
                    </h3>
                    <span className="text-xs text-gray-500">{chapter.lessons.length} leçons</span>
                  </div>
                  <div className="divide-y divide-white/3">
                    {chapter.lessons.map((lesson, lIndex) => (
                      <div
                        key={lIndex}
                        className="px-6 py-4 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <PlayCircle className="w-5 h-5 text-emerald-400/70 shrink-0" />
                          <span className="text-sm font-medium text-gray-300">{lesson.title}</span>
                        </div>
                        <span className="text-xs text-gray-500 shrink-0">{lesson.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Card */}
        <div className="space-y-6">
          <div className="glass-panel p-8 rounded-3xl border-white/5 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 gradient-btn"></div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tarif Unique</span>
              <div className="flex items-baseline gap-2.5">
                <span className="text-3xl font-black text-white">{course.price}</span>
                <span className="text-xs text-gray-500 line-through">{course.originalPrice}</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={handleBuy}
                className="w-full py-4 rounded-2xl font-bold text-white gradient-btn flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <CreditCard className="w-5 h-5" />
                Acheter la formation
              </button>
              <p className="text-center text-xs text-gray-500 leading-relaxed">
                Paiement sécurisé via <span className="text-white font-semibold">Moneroo</span>. Vous devez être connecté ; l'accès apparaît dans <span className="text-white font-semibold">Mon espace</span>.
              </p>
            </div>

            <div className="border-t border-white/5 pt-6 space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Inclus dans la formation</h4>
              <ul className="space-y-3.5">
                {[
                  "Accès complet au programme à vie",
                  "Ressources & fichiers téléchargeables",
                  "Certificat de complétion",
                  "Support direct du formateur",
                ].map((benefit, bIndex) => (
                  <li key={bIndex} className="flex items-center gap-2.5 text-xs text-gray-300">
                    <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                    </div>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <CheckoutModal
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        itemTitle={course.title}
        price={course.price}
        itemType="course"
        itemId={course.id}
        successMessage="Paiement validé ! Votre formation est désormais disponible dans « Mon espace »."
      />
    </div>
  );
}

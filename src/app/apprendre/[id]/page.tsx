"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, PlayCircle, Loader2, Video, Layers, Lock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { fetchCourseById } from "@/lib/courses-db";
import { fetchMyPurchases } from "@/lib/purchases-db";
import { lessonVideoSrc, type Course } from "@/lib/courses";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [active, setActive] = useState({ ci: 0, li: 0 });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.replace("/login");
        return;
      }
      const mine = await fetchMyPurchases();
      const owns = mine.some((p) => p.itemType === "course" && p.itemId === id);
      if (!owns) {
        // Pas acheté → on renvoie vers la page de vente
        router.replace(`/cours/${id}`);
        return;
      }
      const c = await fetchCourseById(id);
      setCourse(c);
      setAllowed(true);
      setReady(true);
    });
  }, [id, router]);

  if (!ready) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-gray-400">
        <Loader2 className="w-7 h-7 animate-spin mx-auto" />
      </div>
    );
  }

  if (!allowed || !course) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-14 h-14 rounded-full bg-amber-500/15 flex items-center justify-center mx-auto border border-amber-500/30">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>
        <p className="text-white font-bold text-lg">Accès non disponible</p>
        <button
          onClick={() => router.push("/mon-espace")}
          className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Mon espace
        </button>
      </div>
    );
  }

  const activeLesson = course.chapters[active.ci]?.lessons[active.li];
  const src = activeLesson ? lessonVideoSrc(activeLesson) : "";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <button
        onClick={() => router.push("/mon-espace")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Mon espace
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl flex items-center justify-center">
            {src ? (
              <iframe
                key={src}
                src={src}
                title={activeLesson?.title || "Vidéo"}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="text-center text-gray-500 px-6">
                <Video className="w-10 h-10 mx-auto mb-3 opacity-60" />
                <p className="text-sm">Vidéo bientôt disponible pour cette leçon.</p>
              </div>
            )}
          </div>
          <div className="glass-panel rounded-2xl border-white/5 p-5">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Lecture en cours</span>
            <h1 className="text-lg sm:text-xl font-bold text-white mt-1">
              {activeLesson?.title || course.title}
            </h1>
          </div>
        </div>

        {/* Curriculum */}
        <div className="space-y-4">
          <div className="glass-panel rounded-2xl border-white/5 overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                {course.title}
              </h2>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-white/5">
              {course.chapters.map((chapter, ci) => (
                <div key={ci}>
                  <div className="px-5 py-3 bg-white/3 text-xs font-bold text-gray-300">
                    Module {ci + 1} : {chapter.title}
                  </div>
                  {chapter.lessons.map((lesson, li) => {
                    const isActive = active.ci === ci && active.li === li;
                    return (
                      <button
                        key={li}
                        onClick={() => setActive({ ci, li })}
                        className={`w-full text-left px-5 py-3 flex items-center justify-between gap-3 transition-colors ${
                          isActive ? "bg-emerald-500/10 border-l-2 border-emerald-500" : "hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2 min-w-0">
                          <PlayCircle
                            className={`w-4 h-4 shrink-0 ${isActive ? "text-emerald-400" : "text-gray-500"}`}
                          />
                          <span className={`text-sm truncate ${isActive ? "text-emerald-300 font-semibold" : "text-gray-300"}`}>
                            {lesson.title}
                          </span>
                        </span>
                        <span className="text-xs text-gray-500 shrink-0">{lesson.duration}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

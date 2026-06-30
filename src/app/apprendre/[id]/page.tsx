"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  PlayCircle,
  Loader2,
  Video,
  Layers,
  Lock,
  MessageCircle,
  Send,
  Trash2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";
import { fetchCourseById } from "@/lib/courses-db";
import { fetchMyPurchases } from "@/lib/purchases-db";
import { isCurrentUserAdmin } from "@/lib/auth";
import {
  fetchLessonComments,
  postLessonComment,
  deleteComment,
  type LessonComment,
} from "@/lib/comments-db";
import { lessonVideoSrc, type Course } from "@/lib/courses";

function formatWhen(iso: string): string {
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);
  const [course, setCourse] = useState<Course | null>(null);
  const [active, setActive] = useState({ ci: 0, li: 0 });

  // Identité (pour poster / supprimer)
  const [isAdmin, setIsAdmin] = useState(false);
  const [myUserId, setMyUserId] = useState("");
  const [myName, setMyName] = useState("Étudiant");

  // Q&A de la leçon active
  const [comments, setComments] = useState<LessonComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [posting, setPosting] = useState(false);

  const lessonKey = `${active.ci}:${active.li}`;

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
      const admin = await isCurrentUserAdmin();
      const mine = await fetchMyPurchases();
      const owns = mine.some((p) => p.itemType === "course" && p.itemId === id);
      // L'admin peut aussi accéder au lecteur (pour prévisualiser / répondre)
      if (!owns && !admin) {
        router.replace(`/cours/${id}`);
        return;
      }
      const c = await fetchCourseById(id);
      const u = data.session.user;
      const m = (u.user_metadata || {}) as Record<string, string>;
      setCourse(c);
      setIsAdmin(admin);
      setMyUserId(u.id);
      setMyName(m.full_name || m.name || (u.email ? u.email.split("@")[0] : "Étudiant"));
      setAllowed(true);
      setReady(true);
    });
  }, [id, router]);

  // Recharge les commentaires quand on change de leçon
  useEffect(() => {
    if (!allowed || !course) return;
    let active2 = true;
    setLoadingComments(true);
    fetchLessonComments(id, lessonKey).then((list) => {
      if (!active2) return;
      setComments(list);
      setLoadingComments(false);
    });
    return () => {
      active2 = false;
    };
  }, [allowed, course, id, lessonKey]);

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = commentText.trim();
    if (!text) return;
    setPosting(true);
    const created = await postLessonComment({
      courseId: id,
      lessonKey,
      content: text,
      authorName: myName,
      authorIsAdmin: isAdmin,
    });
    setPosting(false);
    if (created) {
      setComments((prev) => [...prev, created]);
      setCommentText("");
    }
  };

  const removeComment = async (cid: string) => {
    const ok = await deleteComment(cid);
    if (ok) setComments((prev) => prev.filter((c) => c.id !== cid));
  };

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
        onClick={() => router.push(isAdmin ? "/admin" : "/mon-espace")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        {isAdmin ? "Admin" : "Mon espace"}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Player + Q&A */}
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

          {/* Questions & commentaires */}
          <div className="glass-panel rounded-2xl border-white/5 p-5 sm:p-6">
            <h2 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              Questions & commentaires
            </h2>

            <form onSubmit={submitComment} className="mb-6">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={3}
                placeholder="Posez une question ou laissez un commentaire sur cette leçon…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/40 transition-colors resize-y"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={posting || !commentText.trim()}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2 disabled:opacity-50"
                >
                  {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Publier
                </button>
              </div>
            </form>

            {loadingComments ? (
              <div className="py-6 text-center">
                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
              </div>
            ) : comments.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                Aucune question pour cette leçon. Soyez le premier à participer.
              </p>
            ) : (
              <ul className="space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full gradient-btn flex items-center justify-center text-xs font-black text-white shrink-0">
                      {(c.authorName || "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-white">{c.authorName || "Étudiant"}</span>
                        {c.authorIsAdmin && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3" /> Formateur
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{formatWhen(c.createdAt)}</span>
                        {(c.userId === myUserId || isAdmin) && (
                          <button
                            onClick={() => removeComment(c.id)}
                            className="ml-auto text-gray-500 hover:text-rose-400 transition-colors"
                            aria-label="Supprimer le commentaire"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 mt-1 whitespace-pre-wrap break-words">{c.content}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
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

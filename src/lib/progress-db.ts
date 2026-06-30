// ──────────────────────────────────────────────────────────────
// Suivi de progression des leçons (par utilisateur).
// RLS : chaque utilisateur ne lit/écrit que SA propre progression.
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";

/** Ensemble des clés de leçons terminées pour un cours (utilisateur connecté). */
export async function fetchCourseProgress(courseId: string): Promise<Set<string>> {
  if (!isSupabaseConfigured) return new Set();
  const { data, error } = await supabase
    .from("lesson_progress")
    .select("lesson_key")
    .eq("course_id", courseId);
  if (error || !data) return new Set();
  return new Set((data as { lesson_key: string }[]).map((r) => r.lesson_key));
}

/** Marque une leçon comme terminée (true) ou non terminée (false). */
export async function setLessonProgress(
  courseId: string,
  lessonKey: string,
  completed: boolean
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return false;

  if (completed) {
    const { error } = await supabase.from("lesson_progress").upsert(
      { user_id: uid, course_id: courseId, lesson_key: lessonKey },
      { onConflict: "user_id,course_id,lesson_key", ignoreDuplicates: true }
    );
    return !error;
  }

  const { error } = await supabase
    .from("lesson_progress")
    .delete()
    .eq("course_id", courseId)
    .eq("lesson_key", lessonKey);
  return !error;
}

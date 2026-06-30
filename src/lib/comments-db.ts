// ──────────────────────────────────────────────────────────────
// Questions & commentaires sous les leçons (Q&A par leçon).
// RLS : lecture/écriture réservées aux inscrits au cours + admin.
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { isSupabaseConfigured } from "@/lib/courses-db";

export interface LessonComment {
  id: string;
  courseId: string;
  lessonKey: string;
  userId: string;
  authorName: string;
  authorIsAdmin: boolean;
  content: string;
  createdAt: string;
}

interface CommentRow {
  id: string;
  course_id: string;
  lesson_key: string;
  user_id: string;
  author_name: string;
  author_is_admin: boolean;
  content: string;
  created_at: string;
}

function toComment(r: CommentRow): LessonComment {
  return {
    id: r.id,
    courseId: r.course_id,
    lessonKey: r.lesson_key,
    userId: r.user_id,
    authorName: r.author_name,
    authorIsAdmin: !!r.author_is_admin,
    content: r.content,
    createdAt: r.created_at,
  };
}

/** Commentaires d'une leçon (ordre chronologique). */
export async function fetchLessonComments(courseId: string, lessonKey: string): Promise<LessonComment[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await supabase
    .from("lesson_comments")
    .select("*")
    .eq("course_id", courseId)
    .eq("lesson_key", lessonKey)
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as CommentRow[]).map(toComment);
}

/** Publie un commentaire/question au nom de l'utilisateur connecté. */
export async function postLessonComment(input: {
  courseId: string;
  lessonKey: string;
  content: string;
  authorName: string;
  authorIsAdmin: boolean;
}): Promise<LessonComment | null> {
  if (!isSupabaseConfigured) return null;
  const { data: sess } = await supabase.auth.getSession();
  const uid = sess.session?.user?.id;
  if (!uid) return null;

  const { data, error } = await supabase
    .from("lesson_comments")
    .insert({
      course_id: input.courseId,
      lesson_key: input.lessonKey,
      user_id: uid,
      author_name: input.authorName,
      author_is_admin: input.authorIsAdmin,
      content: input.content,
    })
    .select()
    .single();
  if (error || !data) return null;
  return toComment(data as CommentRow);
}

/** Supprime un commentaire (auteur ou admin — contrôlé par la RLS). */
export async function deleteComment(id: string): Promise<boolean> {
  const { error } = await supabase.from("lesson_comments").delete().eq("id", id);
  return !error;
}

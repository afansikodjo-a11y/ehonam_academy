// ──────────────────────────────────────────────────────────────
// Data-access layer for courses.
// Reads/writes Supabase when configured; otherwise falls back to the
// static catalogue in courses.ts so the site keeps working in dev.
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { courses as staticCourses, formatPrice, type Course, type Chapter } from "@/lib/courses";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
export const isSupabaseConfigured = url.length > 0 && !url.includes("placeholder");

export interface AdminCourse extends Course {
  published: boolean;
}

interface CourseRow {
  id: string;
  title: string;
  description: string;
  price: string;
  price_numeric: number;
  original_price: string;
  original_price_numeric?: number;
  duration: string;
  students: string;
  rating: number;
  category: string;
  tag: string | null;
  gradient: string;
  border_color: string;
  chapters: Chapter[];
  published: boolean;
  show_duration?: boolean;
  show_lessons?: boolean;
  created_at?: string;
}

function rowToCourse(r: CourseRow): AdminCourse {
  return {
    id: r.id,
    title: r.title,
    description: r.description,
    price: formatPrice(r.price_numeric),
    priceNumeric: r.price_numeric,
    originalPrice: formatPrice(r.original_price_numeric),
    originalPriceNumeric: r.original_price_numeric ?? 0,
    duration: r.duration,
    students: r.students,
    rating: Number(r.rating),
    category: r.category,
    tag: r.tag ?? undefined,
    gradient: r.gradient,
    borderColor: r.border_color,
    chapters: Array.isArray(r.chapters) ? r.chapters : [],
    published: r.published,
    showDuration: r.show_duration !== false,
    showLessons: r.show_lessons !== false,
  };
}

function courseToRow(c: AdminCourse) {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    price: formatPrice(c.priceNumeric),
    price_numeric: c.priceNumeric,
    original_price: formatPrice(c.originalPriceNumeric),
    original_price_numeric: c.originalPriceNumeric ?? 0,
    duration: c.duration,
    students: c.students,
    rating: c.rating,
    category: c.category,
    tag: c.tag ?? null,
    gradient: c.gradient,
    border_color: c.borderColor,
    chapters: c.chapters,
    published: c.published,
    show_duration: c.showDuration !== false,
    show_lessons: c.showLessons !== false,
  };
}

/** Published courses for the public site (falls back to the static list). */
export async function fetchPublishedCourses(): Promise<Course[]> {
  if (!isSupabaseConfigured) return staticCourses;
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: true });
  if (error || !data || data.length === 0) return staticCourses;
  return (data as CourseRow[]).map(rowToCourse);
}

/** A single course by id (falls back to the static list). */
export async function fetchCourseById(id: string): Promise<Course | null> {
  if (!isSupabaseConfigured) return staticCourses.find((c) => c.id === id) ?? null;
  const { data, error } = await supabase.from("courses").select("*").eq("id", id).maybeSingle();
  if (error || !data) return staticCourses.find((c) => c.id === id) ?? null;
  return rowToCourse(data as CourseRow);
}

/** All courses including drafts — admin only. */
export async function fetchAllCourses(): Promise<AdminCourse[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return [];
  return (data as CourseRow[]).map(rowToCourse);
}

/** Create or update a course (upsert by id). Returns an error or null. */
export async function upsertCourse(course: AdminCourse) {
  const { error } = await supabase.from("courses").upsert(courseToRow(course));
  return error;
}

/** Delete a course by id. Returns an error or null. */
export async function deleteCourse(id: string) {
  const { error } = await supabase.from("courses").delete().eq("id", id);
  return error;
}

// ──────────────────────────────────────────────────────────────
// Data-access layer for blog posts (with scheduling).
// A post is public when status="published" AND published_at <= now().
// Falls back to the static list in blog.ts when Supabase isn't set.
// ──────────────────────────────────────────────────────────────

import { supabase } from "@/lib/supabase";
import { staticPosts, type BlogPost, type PostStatus } from "@/lib/blog";
import { isSupabaseConfigured } from "@/lib/courses-db";

interface PostRow {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  cover_image: string;
  gradient: string;
  status: PostStatus;
  published_at: string;
  created_at?: string;
}

function rowToPost(r: PostRow): BlogPost {
  return {
    id: r.id,
    title: r.title,
    excerpt: r.excerpt,
    content: r.content,
    category: r.category,
    author: r.author,
    coverImage: r.cover_image,
    gradient: r.gradient,
    status: r.status,
    publishedAt: r.published_at,
  };
}

function postToRow(p: BlogPost) {
  return {
    id: p.id,
    title: p.title,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    author: p.author,
    cover_image: p.coverImage,
    gradient: p.gradient,
    status: p.status,
    published_at: p.publishedAt,
  };
}

function livePublicPosts(): BlogPost[] {
  const now = Date.now();
  return staticPosts
    .filter((p) => p.status === "published" && new Date(p.publishedAt).getTime() <= now)
    .sort((a, b) => +new Date(b.publishedAt) - +new Date(a.publishedAt));
}

/** Live posts for the public blog list (newest first). */
export async function fetchLivePosts(): Promise<BlogPost[]> {
  if (!isSupabaseConfigured) return livePublicPosts();
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("status", "published")
    .lte("published_at", nowIso)
    .order("published_at", { ascending: false });
  if (error || !data) return livePublicPosts();
  return (data as PostRow[]).map(rowToPost);
}

/** A single live post by slug (public). */
export async function fetchLivePostBySlug(slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) {
    return livePublicPosts().find((p) => p.id === slug) ?? null;
  }
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("id", slug)
    .eq("status", "published")
    .lte("published_at", nowIso)
    .maybeSingle();
  if (error || !data) return livePublicPosts().find((p) => p.id === slug) ?? null;
  return rowToPost(data as PostRow);
}

/** All posts including drafts & scheduled — admin only. */
export async function fetchAllPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .order("published_at", { ascending: false });
  if (error || !data) return [];
  return (data as PostRow[]).map(rowToPost);
}

/** Create or update a post (upsert by id). Returns an error or null. */
export async function upsertPost(post: BlogPost) {
  const { error } = await supabase.from("blog_posts").upsert(postToRow(post));
  return error;
}

/** Delete a post by id. Returns an error or null. */
export async function deletePost(id: string) {
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  return error;
}

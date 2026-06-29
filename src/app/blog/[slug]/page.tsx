"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, User, Loader2, Newspaper } from "lucide-react";
import { staticPosts, formatPostDate, type BlogPost } from "@/lib/blog";
import { fetchLivePostBySlug } from "@/lib/blog-db";

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [post, setPost] = useState<BlogPost | null>(
    () => staticPosts.find((p) => p.id === slug) ?? null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchLivePostBySlug(slug).then((p) => {
      if (active) {
        if (p) setPost(p);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (!post) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24 text-center">
        {loading ? (
          <Loader2 className="w-7 h-7 text-emerald-400 animate-spin mx-auto" />
        ) : (
          <div className="space-y-5">
            <p className="text-white font-bold text-lg">Article introuvable.</p>
            <button
              onClick={() => router.push("/blog")}
              className="px-6 py-3 rounded-xl font-bold text-white gradient-btn shadow-md inline-flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au blog
            </button>
          </div>
        )}
      </div>
    );
  }

  const paragraphs = post.content.split(/\n\n+/).filter((p) => p.trim() !== "");

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <button
        onClick={() => router.push("/blog")}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Retour au blog
      </button>

      {post.category && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300 mb-5">
          {post.category}
        </span>
      )}

      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-5">
        {post.title}
      </h1>

      <div className="flex flex-wrap items-center gap-5 text-sm text-gray-500 mb-8">
        <span className="flex items-center gap-1.5">
          <User className="w-4 h-4" />
          {post.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatPostDate(post.publishedAt)}
        </span>
      </div>

      {/* Cover */}
      <div className={`h-56 sm:h-72 w-full rounded-3xl bg-gradient-to-br ${post.gradient} relative overflow-hidden border border-white/5 mb-10 flex items-center justify-center`}>
        {post.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <Newspaper className="w-16 h-16 text-white/30" />
        )}
      </div>

      {/* Content */}
      <div className="space-y-5">
        {paragraphs.map((para, i) => (
          <p key={i} className="text-gray-300 leading-relaxed text-base sm:text-lg whitespace-pre-line">
            {para}
          </p>
        ))}
      </div>
    </article>
  );
}

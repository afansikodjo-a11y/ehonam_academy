"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, ArrowRight, Calendar, Loader2 } from "lucide-react";
import { staticPosts, formatPostDate, type BlogPost } from "@/lib/blog";
import { fetchLivePosts } from "@/lib/blog-db";

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>(staticPosts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLivePosts().then((p) => {
      setPosts(p);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-300 mb-5">
          <Newspaper className="w-3.5 h-3.5" />
          Le Blog
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
          Conseils, <span className="gradient-text">actualités</span> & ressources
        </h1>
        <p className="text-gray-400">
          Des articles pour progresser en développement, design, business en ligne et trading.
        </p>
      </div>

      {loading && posts.length === 0 ? (
        <div className="py-16 text-center text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" />
        </div>
      ) : posts.length === 0 ? (
        <div className="py-16 text-center text-gray-500">Aucun article pour le moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group glass-panel rounded-2xl border-white/5 overflow-hidden flex flex-col glass-panel-hover"
            >
              {/* Cover */}
              <div className={`h-44 w-full bg-gradient-to-br ${post.gradient} relative flex items-center justify-center border-b border-white/5`}>
                {post.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={post.coverImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                  <Newspaper className="w-12 h-12 text-white/40 group-hover:scale-110 transition-transform duration-300" />
                )}
                {post.category && (
                  <span className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-xs font-bold text-white">
                    {post.category}
                  </span>
                )}
              </div>

              {/* Body */}
              <div className="p-6 flex-grow flex flex-col">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatPostDate(post.publishedAt)}
                </div>
                <h2 className="text-lg font-bold text-white mb-2 line-clamp-2 group-hover:text-emerald-300 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-5">{post.excerpt}</p>
                <span className="mt-auto text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 group-hover:gap-2.5 transition-all">
                  Lire l'article
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Clock, Tag, ArrowRight, Settings } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { blogApi, type BlogPost } from '@/lib/api';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState<string | undefined>();

  useEffect(() => {
    setLoading(true);
    blogApi.listPosts({ tag: activeTag })
      .then(({ posts: p, total: t }) => { setPosts(p); setTotal(t); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTag]);

  const allTags = Array.from(new Set(posts.flatMap(p => p.tags))).slice(0, 10);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 max-w-5xl">

        {/* Header row */}
        <div className="flex items-start justify-between mb-10 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog</h1>
            <p className="text-muted-foreground">
              Resume tips, ATS strategies, and career advice — {total} article{total !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/blog/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Settings className="w-3.5 h-3.5" /> Blog Admin
          </Link>
        </div>

        {/* Tag filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTag(undefined)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                !activeTag ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40'
              }`}
            >
              All
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag === activeTag ? undefined : tag)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  activeTag === tag ? 'bg-primary text-white border-primary' : 'bg-white text-muted-foreground border-border hover:border-primary/40'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Post grid */}
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded mb-3 w-3/4" />
                <div className="h-3 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded mb-2 w-5/6" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-lg font-medium mb-1">No posts yet</p>
            <p className="text-sm">Check back soon for resume tips and career advice.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <Link
                key={post._id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl border shadow-sm p-6 flex flex-col hover:border-primary/30 hover:shadow-md transition-all"
              >
                {/* Tags */}
                {post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {post.tags.slice(0, 2).map(tag => (
                      <span key={tag} className="flex items-center gap-0.5 text-[10px] font-medium text-primary bg-primary/8 px-2 py-0.5 rounded-full border border-primary/15">
                        <Tag className="w-2.5 h-2.5" /> {tag}
                      </span>
                    ))}
                  </div>
                )}

                <h2 className="text-base font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" /> {post.readTime} min read
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary group-hover:gap-2 transition-all">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} ResumeFit. All rights reserved.
      </footer>
    </div>
  );
}

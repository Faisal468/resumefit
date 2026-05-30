'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, Clock, Tag, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { blogApi, type BlogPost } from '@/lib/api';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogApi.getPost(slug)
      .then(setPost)
      .catch(() => router.push('/blog'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-7 h-7 animate-spin text-primary" />
      </div>
    );
  }
  if (!post) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-10 max-w-3xl">

        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Blog
        </Link>

        {/* Meta */}
        <div className="mb-8">
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {post.tags.map(tag => (
                <span key={tag} className="flex items-center gap-1 text-xs font-medium text-primary bg-primary/8 px-2.5 py-0.5 rounded-full border border-primary/15">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-3xl font-bold text-gray-900 leading-tight mb-4">{post.title}</h1>
          <p className="text-lg text-muted-foreground mb-4">{post.excerpt}</p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> {post.readTime} min read
            </span>
            <span>{new Date(post.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>

        <hr className="mb-8" />

        {/* Content */}
        <article className="prose prose-gray prose-headings:font-bold prose-headings:text-gray-900 prose-a:text-primary prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-gray-900 prose-pre:text-gray-100 max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </article>

        <hr className="my-10" />

        {/* CTA */}
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to optimize your resume?</h3>
          <p className="text-sm text-muted-foreground mb-4">Get your ATS score and AI-powered rewrite in under 60 seconds.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Try ResumeFit Free →
          </Link>
        </div>
      </main>

      <footer className="border-t py-6 text-center text-xs text-muted-foreground mt-8">
        © {new Date().getFullYear()} ResumeFit. All rights reserved.
      </footer>
    </div>
  );
}

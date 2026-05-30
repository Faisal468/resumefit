'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Loader2,
  ArrowLeft, LogOut, Save, X, ChevronDown, ChevronUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { blogApi, type BlogPost } from '@/lib/api';

type AdminView = 'login' | 'list' | 'editor';

const EMPTY_FORM = { title: '', excerpt: '', content: '', tags: '', published: false };

export default function BlogAdminPage() {
  const [view, setView] = useState<AdminView>('login');
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const fetchPosts = async () => {
    try {
      const data = await blogApi.adminListPosts();
      setPosts(data);
    } catch {
      setView('login');
    }
  };

  // Check if already logged in
  useEffect(() => {
    blogApi.adminListPosts()
      .then(data => { setPosts(data); setView('list'); })
      .catch(() => setView('login'));
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await blogApi.adminLogin(email, password);
      await fetchPosts();
      setView('list');
      toast.success('Welcome, Blog Admin!');
    } catch (err: any) {
      toast.error(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await blogApi.adminLogout();
    setView('login');
    setPosts([]);
    toast.success('Logged out.');
  };

  const openEditor = (post?: BlogPost) => {
    if (post) {
      setEditingId(post._id);
      setForm({
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        tags: post.tags.join(', '),
        published: post.published,
      });
    } else {
      setEditingId(null);
      setForm(EMPTY_FORM);
    }
    setPreviewOpen(false);
    setView('editor');
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      return toast.error('Title, excerpt, and content are required.');
    }
    setLoading(true);
    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      published: form.published,
    };
    try {
      if (editingId) {
        await blogApi.updatePost(editingId, payload);
        toast.success('Post updated!');
      } else {
        await blogApi.createPost(payload);
        toast.success('Post created!');
      }
      await fetchPosts();
      setView('list');
    } catch (err: any) {
      toast.error(err.message || 'Failed to save post.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await blogApi.deletePost(id);
      setPosts(p => p.filter(x => x._id !== id));
      toast.success('Post deleted.');
    } catch {
      toast.error('Failed to delete post.');
    }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      await blogApi.updatePost(post._id, { published: !post.published });
      setPosts(p => p.map(x => x._id === post._id ? { ...x, published: !x.published } : x));
      toast.success(post.published ? 'Post unpublished.' : 'Post published!');
    } catch {
      toast.error('Failed to update post.');
    }
  };

  // ── Login ──────────────────────────────────────────────────────────────────
  if (view === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-gray-900">Blog Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage blog posts</p>
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div>
                <label className="text-sm font-medium block mb-1.5">Email</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="blog@resumefit.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Password</label>
                <input
                  type="password" value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</> : 'Sign In'}
              </button>
            </form>
          </div>
          <div className="text-center mt-4">
            <Link href="/blog" className="text-xs text-muted-foreground hover:text-foreground">← Back to Blog</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Editor ─────────────────────────────────────────────────────────────────
  if (view === 'editor') {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Toolbar */}
        <div className="sticky top-0 z-10 bg-white border-b px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setView('list')} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold">{editingId ? 'Edit Post' : 'New Post'}</span>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer select-none">
              <div
                onClick={() => setForm(f => ({ ...f, published: !f.published }))}
                className={`w-9 h-5 rounded-full transition-colors relative ${form.published ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${form.published ? 'left-4' : 'left-0.5'}`} />
              </div>
              {form.published ? 'Published' : 'Draft'}
            </label>
            <button
              onClick={handleSave} disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto py-8 px-4 flex flex-col gap-5">
          <input
            value={form.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Post title…"
            className="text-2xl font-bold border-0 border-b-2 border-gray-200 bg-transparent focus:outline-none focus:border-primary pb-2 w-full"
          />
          <input
            value={form.excerpt}
            onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
            placeholder="Short excerpt / meta description (shown in listing)…"
            className="px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
          <input
            value={form.tags}
            onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
            placeholder="Tags (comma-separated): ats, resume-tips, career"
            className="px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />

          {/* Content editor with preview toggle */}
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
              <span className="text-xs font-medium text-muted-foreground">Content (Markdown)</span>
              <button
                onClick={() => setPreviewOpen(o => !o)}
                className="flex items-center gap-1 text-xs text-primary hover:underline"
              >
                {previewOpen ? <><EyeOff className="w-3.5 h-3.5" /> Hide preview</> : <><Eye className="w-3.5 h-3.5" /> Preview</>}
              </button>
            </div>
            <textarea
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder={`Write your blog post in Markdown…\n\n## Introduction\n\nYour content here...`}
              rows={previewOpen ? 12 : 22}
              className="w-full px-4 py-3 text-sm font-mono resize-none focus:outline-none"
            />
            {previewOpen && (
              <div className="border-t px-6 py-5 prose prose-sm prose-gray max-w-none">
                {/* Dynamic import to avoid SSR issues */}
                <DynamicPreview content={form.content} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Post list ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href="/blog" className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-bold">Blog Admin</h1>
            <span className="text-xs text-muted-foreground bg-gray-200 px-2 py-0.5 rounded-full">{posts.length} posts</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEditor()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90"
            >
              <Plus className="w-4 h-4" /> New Post
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl border text-muted-foreground hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border p-12 text-center text-muted-foreground">
            <p className="font-medium mb-1">No posts yet</p>
            <p className="text-sm mb-4">Click "New Post" to write your first blog post.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {posts.map(post => (
              <div key={post._id} className="bg-white rounded-2xl border shadow-sm p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${post.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {post.published ? 'Published' : 'Draft'}
                    </span>
                    {post.tags.slice(0, 2).map(t => (
                      <span key={t} className="text-[10px] text-muted-foreground bg-gray-100 px-1.5 py-0.5 rounded">#{t}</span>
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-gray-900 truncate">{post.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(post.createdAt).toLocaleDateString()} · {post.readTime} min read
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleTogglePublish(post)}
                    title={post.published ? 'Unpublish' : 'Publish'}
                    className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors"
                  >
                    {post.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => openEditor(post)}
                    className="p-2 rounded-lg hover:bg-gray-100 text-muted-foreground transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(post._id, post.title)}
                    className="p-2 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {post.published && (
                    <Link
                      href={`/blog/${post.slug}`}
                      target="_blank"
                      className="p-2 rounded-lg hover:bg-gray-100 text-primary transition-colors text-xs font-medium"
                    >
                      View ↗
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Lazy preview to avoid SSR issues with react-markdown
function DynamicPreview({ content }: { content: string }) {
  const [ReactMarkdown, setRM] = useState<any>(null);
  const [remarkGfm, setRGfm] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      import('react-markdown').then(m => m.default),
      import('remark-gfm').then(m => m.default),
    ]).then(([rm, rgfm]) => { setRM(() => rm); setRGfm(() => rgfm); });
  }, []);

  if (!ReactMarkdown || !remarkGfm) return <p className="text-muted-foreground text-sm">Loading preview…</p>;
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>;
}

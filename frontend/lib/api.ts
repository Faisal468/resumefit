import axios from 'axios';
import type { AnalysisResult, ResumeHistoryItem, TemplateMeta } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  timeout: 120000,
  withCredentials: true, // send httpOnly cookie on every request
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // Only auto-redirect on 401s from protected resume endpoints (not auth/me or blog)
    const isResumeApi = err.config?.url?.includes('/api/resume/');
    if (err.response?.status === 401 && isResumeApi && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    const message =
      err.response?.data?.error || err.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

/**
 * Fetches a binary file from the server and triggers a browser download.
 * Works for both PDF and DOCX.
 */
export const downloadFile = async (
  url: string,
  filename: string,
  onProgress?: (pct: number) => void,
  fetchOptions?: RequestInit
): Promise<void> => {
  const response = await fetch(url, { credentials: 'include', ...fetchOptions });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Export failed' }));
    throw new Error(err.error || `Export failed (${response.status})`);
  }

  const total = Number(response.headers.get('content-length') || 0);
  const reader = response.body!.getReader();
  const chunks: Uint8Array[] = [];
  let received = 0;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    if (total && onProgress) onProgress(Math.round((received / total) * 100));
  }

  const blob = new Blob(chunks as BlobPart[]);
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(objectUrl);
};

interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export const authApi = {
  register: async (name: string, email: string, password: string): Promise<AuthUser> => {
    const res = await api.post<AuthUser>('/api/auth/register', { name, email, password });
    return res.data;
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    const res = await api.post<AuthUser>('/api/auth/login', { email, password });
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  me: async (): Promise<AuthUser> => {
    const res = await api.get<AuthUser>('/api/auth/me');
    return res.data;
  },
};

export const blogApi = {
  // Public
  listPosts: async (params?: { tag?: string; page?: number }) => {
    const res = await api.get('/api/blog/posts', { params });
    return res.data as { posts: BlogPost[]; total: number; page: number };
  },
  getPost: async (slug: string) => {
    const res = await api.get(`/api/blog/posts/${slug}`);
    return res.data as BlogPost;
  },
  // Admin
  adminLogin: async (email: string, password: string) => {
    await api.post('/api/blog/admin/login', { email, password });
  },
  adminLogout: async () => {
    await api.post('/api/blog/admin/logout');
  },
  adminListPosts: async () => {
    const res = await api.get('/api/blog/admin/posts');
    return res.data as BlogPost[];
  },
  createPost: async (data: Partial<BlogPost>) => {
    const res = await api.post('/api/blog/admin/posts', data);
    return res.data as BlogPost;
  },
  updatePost: async (id: string, data: Partial<BlogPost>) => {
    const res = await api.put(`/api/blog/admin/posts/${id}`, data);
    return res.data as BlogPost;
  },
  deletePost: async (id: string) => {
    await api.delete(`/api/blog/admin/posts/${id}`);
  },
};

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  tags: string[];
  published: boolean;
  readTime: number;
  createdAt: string;
}

export type { BlogPost };

export const resumeApi = {
  analyze: async (file: File, jobDescription: string): Promise<AnalysisResult> => {
    const formData = new FormData();
    formData.append('resume', file);
    formData.append('jobDescription', jobDescription);
    const res = await api.post<AnalysisResult>('/api/resume/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getById: async (id: string): Promise<AnalysisResult> => {
    const res = await api.get<AnalysisResult>(`/api/resume/${id}`);
    return res.data;
  },

  getHistory: async (page = 1): Promise<{ resumes: ResumeHistoryItem[]; total: number }> => {
    const res = await api.get('/api/resume/history', { params: { page } });
    return res.data;
  },

  acceptChange: async (id: string, bulletIndex: number, accepted: boolean): Promise<void> => {
    await api.patch(`/api/resume/${id}/accept-change`, { bulletIndex, accepted });
  },

  exportPDFUrl:  (id: string) => `${BASE}/api/resume/${id}/export/pdf`,
  exportDOCXUrl: (id: string) => `${BASE}/api/resume/${id}/export/docx`,

  downloadPDF: (id: string, onProgress?: (pct: number) => void) =>
    downloadFile(`${BASE}/api/resume/${id}/export/pdf`, 'optimized-resume.pdf', onProgress),

  downloadDOCX: (id: string, onProgress?: (pct: number) => void) =>
    downloadFile(`${BASE}/api/resume/${id}/export/docx`, 'optimized-resume.docx', onProgress),

  getTemplates: async (): Promise<TemplateMeta[]> => {
    const res = await api.get<TemplateMeta[]>('/api/resume/templates');
    return res.data;
  },

  renderWithTemplate: (
    id: string,
    templateId: string,
    format: 'pdf' | 'docx',
    onProgress?: (pct: number) => void
  ) => {
    const ext = format === 'pdf' ? 'pdf' : 'docx';
    return downloadFile(
      `${BASE}/api/resume/${id}/render`,
      `resume-${templateId}.${ext}`,
      onProgress,
      { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ templateId, format }) }
    );
  },
};

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, FileText, FileDown, CheckCircle2,
  Loader2, ExternalLink, BarChart3, FileCheck, Palette,
} from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { ScoreRing } from '@/components/ScoreRing';
import { resumeApi } from '@/lib/api';
import type { AnalysisResult } from '@/types';

export default function ExportPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const cached = sessionStorage.getItem(`analysis_${id}`);
    if (cached) {
      setData(JSON.parse(cached));
      setLoading(false);
      return;
    }
    resumeApi.getById(id).then(setData).catch(() => {
      toast.error('Analysis not found.');
      router.push('/');
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (type: 'pdf' | 'docx') => {
    setDownloading(type);
    setProgress(0);
    try {
      const onProgress = (pct: number) => setProgress(pct);
      if (type === 'pdf') {
        await resumeApi.downloadPDF(id, onProgress);
      } else {
        await resumeApi.downloadDOCX(id, onProgress);
      }
      toast.success(`${type.toUpperCase()} downloaded successfully!`);
    } catch (err: any) {
      toast.error(err.message || 'Download failed. Please try again.');
    } finally {
      setDownloading(null);
      setProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return null;

  const pageCount = data.originalPageCount || 1;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 max-w-3xl">

        <div className="flex items-center gap-3 mb-8">
          <Link href={`/dashboard/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Export Optimized Resume</h1>
            <p className="text-sm text-muted-foreground">Download your AI-optimized resume</p>
          </div>
        </div>

        {/* Score + page summary */}
        <div className="bg-white rounded-2xl border shadow-sm p-6 flex items-center gap-6 mb-6 flex-wrap">
          <ScoreRing score={data.atsScore} size={90} label="ATS Score" />
          <div className="h-14 w-px bg-border hidden sm:block" />
          <ScoreRing score={data.jdMatchScore} size={90} label="JD Match" />
          <div className="h-14 w-px bg-border hidden sm:block" />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-blue-700">
              <FileCheck className="w-4 h-4" />
              <span className="text-sm font-semibold">{pageCount}-Page Resume</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Output will match your original {pageCount === 1 ? 'single' : pageCount}-page layout
            </p>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-sm font-semibold">Resume Optimized</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Keywords added, weak bullets rewritten, ATS formatting applied.
            </p>
          </div>
        </div>

        {/* Progress bar (shown while downloading) */}
        {downloading && (
          <div className="mb-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Generating {downloading.toUpperCase()}…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-200"
                style={{ width: `${progress || 10}%` }}
              />
            </div>
          </div>
        )}

        {/* Export cards */}
        <div className="flex flex-col gap-4 mb-6">
          {([
            {
              type: 'pdf' as const,
              icon: FileDown,
              title: 'Download as PDF',
              description: `ATS-friendly layout • ${pageCount} page${pageCount > 1 ? 's' : ''} • Matches your original`,
              badge: 'Recommended',
              badgeColor: 'green' as const,
            },
            {
              type: 'docx' as const,
              icon: FileText,
              title: 'Download as DOCX',
              description: `Editable in Word / Google Docs • ${pageCount} page${pageCount > 1 ? 's' : ''} • Calibri 10–11pt`,
              badge: 'Editable',
              badgeColor: 'blue' as const,
            },
          ]).map(({ type, icon: Icon, title, description, badge, badgeColor }) => (
            <div key={type} className="bg-white rounded-2xl border shadow-sm p-5 flex items-center gap-4 hover:border-primary/30 transition-colors">
              <div className="p-3 rounded-xl bg-primary/10 shrink-0">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-semibold">{title}</h3>
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0 ${
                    badgeColor === 'green'
                      ? 'bg-green-100 text-green-700 border-green-200'
                      : 'bg-blue-100 text-blue-700 border-blue-200'
                  }`}>{badge}</span>
                </div>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <button
                onClick={() => handleDownload(type)}
                disabled={downloading !== null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors shrink-0"
              >
                {downloading === type
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><FileDown className="w-4 h-4" /> Download</>
                }
              </button>
            </div>
          ))}
        </div>

        {/* Template chooser CTA */}
        <Link
          href={`/templates/${id}`}
          className="flex items-center gap-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 rounded-2xl p-5 mb-6 hover:border-primary/40 transition-colors group"
        >
          <div className="p-3 rounded-xl bg-primary/10 shrink-0">
            <Palette className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-semibold">Choose a Template</h3>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border bg-purple-100 text-purple-700 border-purple-200 shrink-0">New</span>
            </div>
            <p className="text-xs text-muted-foreground">Apply a professional design — Classic, Modern, Minimal, Executive, or Compact</p>
          </div>
          <span className="text-xs font-medium text-primary group-hover:underline shrink-0">Browse →</span>
        </Link>

        {/* Optimized resume preview */}
        <div className="bg-white rounded-2xl border shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" /> Optimized Resume Preview
            </h2>
            <Link href={`/diff/${id}`} className="flex items-center gap-1 text-xs text-primary hover:underline">
              View Diff <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
          <pre className="p-5 font-mono text-xs text-gray-700 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto bg-gray-50/50 rounded-b-2xl">
            {data.finalOptimizedResume}
          </pre>
        </div>
      </main>
    </div>
  );
}

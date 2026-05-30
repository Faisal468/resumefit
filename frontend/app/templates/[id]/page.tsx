'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, FileDown, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Navbar } from '@/components/Navbar';
import { TemplateCard } from '@/components/TemplateCard';
import { resumeApi } from '@/lib/api';
import type { AnalysisResult, TemplateMeta } from '@/types';

export default function TemplatesPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [data, setData] = useState<AnalysisResult | null>(null);
  const [templates, setTemplates] = useState<TemplateMeta[]>([]);
  const [selected, setSelected] = useState<string>('modern');
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const cached = sessionStorage.getItem(`analysis_${id}`);
    const resumePromise = cached
      ? Promise.resolve(JSON.parse(cached) as AnalysisResult)
      : resumeApi.getById(id);

    Promise.all([resumePromise, resumeApi.getTemplates()])
      .then(([resume, tmpl]) => {
        setData(resume);
        setTemplates(tmpl);
      })
      .catch(() => {
        toast.error('Failed to load. Please go back and try again.');
        router.push('/');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDownload = async (format: 'pdf' | 'docx') => {
    setDownloading(format);
    setProgress(0);
    try {
      await resumeApi.renderWithTemplate(id, selected, format, (pct) => setProgress(pct));
      toast.success(`Resume downloaded as ${format.toUpperCase()}!`);
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
      <main className="flex-1 container py-8 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <Link href={`/export/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold">Choose a Template</h1>
            <p className="text-sm text-muted-foreground">
              Pick a style — your optimized resume content will be applied automatically
            </p>
          </div>
        </div>

        {/* Page count note */}
        <div className="mb-6 ml-11">
          <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            Output will match your {pageCount}-page original
          </span>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {templates.map((t) => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={selected === t.id}
              downloading={downloading !== null && selected === t.id}
              onSelect={() => setSelected(t.id)}
            />
          ))}
        </div>

        {/* Download bar */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-semibold">
                Ready to download with <span className="text-primary capitalize">{selected}</span> template
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                ATS-safe HTML/CSS layout · {pageCount} page{pageCount > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload('pdf')}
                disabled={downloading !== null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border bg-white text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
              >
                {downloading === 'pdf'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><FileDown className="w-4 h-4 text-red-500" /> PDF</>}
              </button>
              <button
                onClick={() => handleDownload('docx')}
                disabled={downloading !== null}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {downloading === 'docx'
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</>
                  : <><FileText className="w-4 h-4" /> DOCX</>}
              </button>
            </div>
          </div>

          {/* Progress bar */}
          {downloading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Generating {downloading.toUpperCase()} with {selected} template…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${progress || 8}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

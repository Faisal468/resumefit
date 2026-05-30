'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { DiffViewer } from '@/components/DiffViewer';
import { Navbar } from '@/components/Navbar';
import { resumeApi } from '@/lib/api';
import type { AnalysisResult } from '@/types';

export default function DiffPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }
  if (!data) return null;

  const added = data.diffViewData.filter((d) => d.type === 'added').length;
  const removed = data.diffViewData.filter((d) => d.type === 'removed').length;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 max-w-6xl">

        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/${id}`} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Resume Diff View</h1>
              <p className="text-sm text-muted-foreground">Compare original vs AI-optimized resume</p>
            </div>
          </div>
          <Link
            href={`/export/${id}`}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" /> Export Optimized
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex gap-3 mb-6 flex-wrap">
          {[
            { label: 'ATS Score', value: `${data.atsScore}/100`, color: 'default' },
            { label: 'JD Match', value: `${data.jdMatchScore}%`, color: 'default' },
            { label: 'Added', value: String(added), color: 'green' },
            { label: 'Removed', value: String(removed), color: 'red' },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium ${
                color === 'green' ? 'bg-green-50 border-green-200 text-green-800' :
                color === 'red' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-white border-gray-200 text-gray-700'
              }`}
            >
              <span className="text-muted-foreground">{label}:</span>
              <span className="font-bold">{value}</span>
            </div>
          ))}
        </div>

        {data.diffViewData.length > 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <DiffViewer
              diffData={data.diffViewData}
              originalText={data.finalOptimizedResume}
              optimizedText={data.finalOptimizedResume}
            />
          </div>
        ) : (
          <div className="bg-white rounded-2xl border p-10 text-center text-muted-foreground">
            No diff data available.
          </div>
        )}
      </main>
    </div>
  );
}

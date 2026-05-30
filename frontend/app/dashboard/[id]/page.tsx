'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft, GitCompare, FileDown, FileText, Target, Zap,
  TrendingUp, AlertTriangle, CheckCircle2, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { ScoreRing } from '@/components/ScoreRing';
import { KeywordBadges } from '@/components/KeywordBadges';
import { WeakBulletsPanel } from '@/components/WeakBulletsPanel';
import { Navbar } from '@/components/Navbar';
import { resumeApi } from '@/lib/api';
import { getScoreLabel } from '@/lib/utils';
import type { AnalysisResult } from '@/types';

export default function DashboardPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<'pdf' | 'docx' | null>(null);

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

  const handleAccept = async (index: number, accepted: boolean) => {
    await resumeApi.acceptChange(id, index, accepted);
    toast.success(accepted ? 'Change accepted.' : 'Change rejected.');
  };

  const handleDownload = async (type: 'pdf' | 'docx') => {
    setDownloading(type);
    try {
      if (type === 'pdf') {
        await resumeApi.downloadPDF(id);
      } else {
        await resumeApi.downloadDOCX(id);
      }
      toast.success(`${type.toUpperCase()} downloaded!`);
    } catch (err: any) {
      toast.error(err.message || 'Download failed. Please try again.');
    } finally {
      setDownloading(null);
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-8 max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-xl font-bold">Analysis Results</h1>
              <p className="text-sm text-muted-foreground">
                Job: <span className="font-medium text-foreground">{data.jdAnalysis?.jobTitle || 'Position'}</span>
                {data.jdAnalysis?.seniorityLevel && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground capitalize">
                    {data.jdAnalysis.seniorityLevel}
                  </span>
                )}
                {data.originalPageCount && (
                  <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                    {data.originalPageCount}-page resume
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href={`/diff/${id}`}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white text-sm font-medium hover:bg-muted transition-colors"
            >
              <GitCompare className="w-4 h-4" /> Diff
            </Link>

            {/* Download PDF */}
            <button
              onClick={() => handleDownload('pdf')}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border bg-white text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
            >
              {downloading === 'pdf'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileDown className="w-4 h-4 text-red-500" />}
              PDF
            </button>

            {/* Download DOCX */}
            <button
              onClick={() => handleDownload('docx')}
              disabled={downloading !== null}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {downloading === 'docx'
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <FileText className="w-4 h-4" />}
              DOCX
            </button>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border p-5 flex flex-col items-center gap-2 shadow-sm">
            <ScoreRing score={data.atsScore} size={100} label="ATS Score" />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              data.atsScore >= 80 ? 'bg-green-100 text-green-700' :
              data.atsScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
            }`}>{getScoreLabel(data.atsScore)}</span>
          </div>
          <div className="bg-white rounded-2xl border p-5 flex flex-col items-center gap-2 shadow-sm">
            <ScoreRing score={data.jdMatchScore} size={100} label="JD Match" />
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              data.jdMatchScore >= 80 ? 'bg-green-100 text-green-700' :
              data.jdMatchScore >= 60 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
            }`}>{getScoreLabel(data.jdMatchScore)}</span>
          </div>
          <div className="bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            <p className="text-2xl font-bold">{data.missingSkills.length}</p>
            <div>
              <p className="text-sm font-medium">Missing Skills</p>
              <p className="text-xs text-muted-foreground">required skills not found</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border p-5 shadow-sm flex flex-col gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-2xl font-bold">{data.presentKeywords.length}</p>
            <div>
              <p className="text-sm font-medium">Keywords Found</p>
              <p className="text-xs text-muted-foreground">of JD keywords matched</p>
            </div>
          </div>
        </div>

        {/* ATS Breakdown */}
        <div className="bg-white rounded-2xl border shadow-sm p-5 mb-6">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> ATS Score Breakdown
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(data.atsBreakdown || {}).map(([key, val]) => {
              const score = val as number;
              const label = key.replace(/([A-Z])/g, ' $1').trim();
              const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500';
              return (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="capitalize text-muted-foreground">{label}</span>
                    <span className="font-semibold">{score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${score}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Keywords */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" /> Keywords Found
            </h2>
            <KeywordBadges keywords={data.presentKeywords} variant="present" />
          </div>
          <div className="bg-white rounded-2xl border shadow-sm p-5">
            <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Missing Keywords
            </h2>
            <KeywordBadges keywords={data.missingKeywords} variant="missing" />
          </div>
        </div>

        {data.missingSkills.length > 0 && (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-5 mb-6">
            <h2 className="text-sm font-bold text-red-800 mb-3 flex items-center gap-2">
              <Target className="w-4 h-4" /> Missing Required Skills
            </h2>
            <KeywordBadges keywords={data.missingSkills} variant="missing" />
            <p className="text-xs text-red-600 mt-3">
              These are hard requirements from the JD. Consider adding them to your resume where applicable.
            </p>
          </div>
        )}

        {/* AI Suggestions */}
        <div className="bg-white rounded-2xl border shadow-sm p-5">
          <h2 className="text-sm font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" /> AI Bullet Improvements ({data.weakBullets.length})
          </h2>
          <WeakBulletsPanel bullets={data.weakBullets} resumeId={id} onAccept={handleAccept} />
        </div>
      </main>
    </div>
  );
}

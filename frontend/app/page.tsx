'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, CheckCircle2, BarChart3, FileSearch } from 'lucide-react';
import { toast } from 'sonner';
import { FileUploader } from '@/components/FileUploader';
import { Navbar } from '@/components/Navbar';
import { resumeApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type { AnalysisStatus } from '@/types';

const STEPS = [
  { icon: FileSearch, label: 'Parsing resume...' },
  { icon: BarChart3, label: 'Analyzing job description...' },
  { icon: Sparkles, label: 'Running AI optimization...' },
  { icon: CheckCircle2, label: 'Finalizing results...' },
];

export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJD] = useState('');
  const [status, setStatus] = useState<AnalysisStatus>('idle');
  const [step, setStep] = useState(0);

  const handleAnalyze = async () => {
    if (!user) {
      toast.error('Please sign in to analyze your resume.');
      router.push('/login');
      return;
    }
    if (!file) { toast.error('Please upload your resume.'); return; }
    if (jd.trim().length < 50) { toast.error('Job description is too short (min 50 chars).'); return; }

    setStatus('analyzing');

    const interval = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 8000);

    try {
      const result = await resumeApi.analyze(file, jd);
      clearInterval(interval);
      sessionStorage.setItem(`analysis_${result.id}`, JSON.stringify(result));
      toast.success('Analysis complete!');
      router.push(`/dashboard/${result.id}`);
    } catch (err: any) {
      clearInterval(interval);
      setStatus('error');
      setStep(0);
      toast.error(err.message || 'Analysis failed. Please try again.');
    }
  };

  const isAnalyzing = status === 'analyzing';

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 max-w-3xl">

        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
            <Sparkles className="w-3 h-3" /> GPT-4o Powered
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-3">
            Land more interviews with{' '}
            <span className="bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
              AI-optimized
            </span>{' '}
            resumes
          </h1>
          <p className="text-lg text-muted-foreground">
            Get your ATS score, JD match percentage, and an AI-rewritten resume in under 60 seconds.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {['ATS Score', 'JD Match %', 'Keyword Gap', 'AI Rewrite', 'PDF/DOCX Export'].map((f) => (
            <span key={f} className="px-3 py-1 rounded-full text-xs font-medium bg-white border border-gray-200 text-gray-600 shadow-sm">
              ✓ {f}
            </span>
          ))}
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold mb-2">1. Upload Your Resume</label>
            <FileUploader onFileSelect={setFile} selectedFile={file} onClear={() => setFile(null)} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">2. Paste Job Description</label>
            <textarea
              value={jd}
              onChange={(e) => setJD(e.target.value)}
              placeholder="Paste the full job description here — the more detailed, the better the analysis..."
              rows={9}
              disabled={isAnalyzing}
              className="w-full rounded-xl border border-input bg-gray-50/50 px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary resize-none disabled:opacity-50 transition-colors"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {jd.length} chars {jd.length < 50 && jd.length > 0 && '(min 50)'}
            </p>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing || !file || jd.trim().length < 50}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-primary text-white font-semibold text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.99]"
          >
            {isAnalyzing ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing your resume...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Analyze & Optimize Resume</>
            )}
          </button>

          {isAnalyzing && (
            <div className="flex flex-col gap-2 pt-2">
              {STEPS.map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2.5 text-sm transition-all ${
                    i < step ? 'text-green-600' : i === step ? 'text-primary font-medium' : 'text-muted-foreground/50'
                  }`}
                >
                  {i < step ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                  ) : i === step ? (
                    <Loader2 className="w-4 h-4 shrink-0 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 shrink-0" />
                  )}
                  {label}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

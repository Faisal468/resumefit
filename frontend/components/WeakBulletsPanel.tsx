'use client';

import { useState } from 'react';
import { Check, X, ChevronDown, ChevronUp, AlertCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { WeakBullet } from '@/types';

interface WeakBulletsPanelProps {
  bullets: WeakBullet[];
  resumeId: string;
  onAccept: (index: number, accepted: boolean) => Promise<void>;
}

export function WeakBulletsPanel({ bullets, resumeId, onAccept }: WeakBulletsPanelProps) {
  const [expanded, setExpanded] = useState<number | null>(0);
  const [loading, setLoading] = useState<number | null>(null);
  const [states, setStates] = useState<Record<number, boolean | null>>(
    Object.fromEntries(bullets.map((b, i) => [i, b.accepted]))
  );

  const handle = async (index: number, accepted: boolean) => {
    setLoading(index);
    try {
      await onAccept(index, accepted);
      setStates((prev) => ({ ...prev, [index]: accepted }));
    } finally {
      setLoading(null);
    }
  };

  if (!bullets.length) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
        <Sparkles className="w-10 h-10 text-primary/40" />
        <p className="text-sm font-medium">No weak bullets detected — your resume is well-written!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {bullets.map((bullet, i) => (
        <div
          key={i}
          className={cn(
            'rounded-xl border bg-white overflow-hidden transition-all',
            states[i] === true && 'border-green-300 bg-green-50/30',
            states[i] === false && 'border-gray-200 opacity-60'
          )}
        >
          <button
            onClick={() => setExpanded(expanded === i ? null : i)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50/50 transition-colors"
          >
            <AlertCircle className="w-4 h-4 text-orange-500 shrink-0" />
            <p className="text-sm text-gray-700 flex-1 line-clamp-1">{bullet.original}</p>
            <div className="flex items-center gap-2">
              {states[i] === true && (
                <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Accepted</span>
              )}
              {states[i] === false && (
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Rejected</span>
              )}
              {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>

          {expanded === i && (
            <div className="px-4 pb-4 flex flex-col gap-3 border-t border-gray-100">
              <div className="mt-3">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-1">Why it's weak</p>
                <p className="text-sm text-gray-600 bg-orange-50 rounded-lg px-3 py-2">{bullet.reason}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Original</p>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2 font-mono">{bullet.original}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">AI Suggestion</p>
                <p className="text-sm text-green-800 bg-green-50 rounded-lg px-3 py-2 font-mono border border-green-200">{bullet.suggested}</p>
              </div>
              {states[i] === null && (
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => handle(i, true)}
                    disabled={loading === i}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" /> Accept
                  </button>
                  <button
                    onClick={() => handle(i, false)}
                    disabled={loading === i}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

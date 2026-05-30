'use client';

import { useState } from 'react';
import { Eye, Code2 } from 'lucide-react';
import type { DiffChunk } from '@/types';
import { cn } from '@/lib/utils';

interface DiffViewerProps {
  diffData: DiffChunk[];
  originalText: string;
  optimizedText: string;
}

export function DiffViewer({ diffData, originalText, optimizedText }: DiffViewerProps) {
  const [mode, setMode] = useState<'diff' | 'split'>('diff');

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('diff')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            mode === 'diff' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <Code2 className="w-3.5 h-3.5" /> Inline Diff
        </button>
        <button
          onClick={() => setMode('split')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
            mode === 'split' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
          )}
        >
          <Eye className="w-3.5 h-3.5" /> Side by Side
        </button>
      </div>

      <div className="flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-500/30 border border-green-500" /> Added
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-500/20 border border-red-400" /> Removed
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200" /> Unchanged
        </span>
      </div>

      {mode === 'diff' ? (
        <div className="rounded-xl border bg-white p-5 font-mono text-sm leading-relaxed max-h-[600px] overflow-y-auto">
          {diffData.map((chunk, i) => (
            <span
              key={i}
              className={cn(
                'whitespace-pre-wrap',
                chunk.type === 'added' && 'bg-green-100 text-green-800 rounded px-0.5',
                chunk.type === 'removed' && 'bg-red-100 text-red-700 line-through rounded px-0.5 opacity-70',
                chunk.type === 'unchanged' && 'text-gray-700'
              )}
            >
              {chunk.value}
            </span>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Original</span>
            </div>
            <div className="rounded-xl border bg-red-50/30 p-4 font-mono text-xs leading-relaxed text-gray-700 max-h-[580px] overflow-y-auto whitespace-pre-wrap">
              {originalText}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Optimized</span>
            </div>
            <div className="rounded-xl border bg-green-50/30 p-4 font-mono text-xs leading-relaxed text-gray-700 max-h-[580px] overflow-y-auto whitespace-pre-wrap">
              {optimizedText}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { Loader2, Check } from 'lucide-react';
import type { TemplateMeta } from '@/types';

interface Props {
  template: TemplateMeta;
  selected: boolean;
  downloading: boolean;
  onSelect: () => void;
}

export function TemplateCard({ template, selected, downloading, onSelect }: Props) {
  const { bg, header, accent } = template.previewColors;

  return (
    <button
      onClick={onSelect}
      disabled={downloading}
      className={`group relative w-full text-left rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm hover:shadow-md disabled:opacity-60 ${
        selected
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-border hover:border-primary/40'
      }`}
    >
      {/* Mini resume preview */}
      <div
        className="h-36 w-full flex flex-col gap-1.5 p-3"
        style={{ backgroundColor: bg }}
      >
        {/* Header bar */}
        <div
          className="w-full rounded px-2 py-1.5"
          style={{ backgroundColor: header }}
        >
          <div className="h-2 w-24 rounded-full bg-white/70 mb-1" />
          <div className="h-1.5 w-16 rounded-full bg-white/40" />
        </div>
        {/* Section lines */}
        {[70, 55, 45].map((w, i) => (
          <div key={i} className="flex flex-col gap-0.5 pl-1">
            <div className="h-1.5 w-12 rounded-full mb-0.5" style={{ backgroundColor: accent }} />
            <div className="h-1 rounded-full bg-gray-300" style={{ width: `${w}%` }} />
            <div className="h-1 rounded-full bg-gray-200" style={{ width: `${w - 15}%` }} />
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-sm font-semibold text-foreground">{template.name}</span>
          {selected && (
            <span className="flex items-center gap-1 text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
              {downloading
                ? <><Loader2 className="w-3 h-3 animate-spin" /> Generating…</>
                : <><Check className="w-3 h-3" /> Selected</>}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-snug">{template.description}</p>
        <p className="text-[10px] text-muted-foreground mt-1 opacity-70">{template.font}</p>
      </div>
    </button>
  );
}

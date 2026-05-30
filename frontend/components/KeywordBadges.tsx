'use client';

interface KeywordBadgesProps {
  keywords: string[];
  variant: 'present' | 'missing';
  limit?: number;
}

export function KeywordBadges({ keywords, variant, limit = 20 }: KeywordBadgesProps) {
  const shown = keywords.slice(0, limit);
  const rest = keywords.length - shown.length;

  const cls =
    variant === 'present'
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-700 border border-red-200';

  if (!keywords.length) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {variant === 'present' ? 'No keywords detected.' : 'None missing — great match!'}
      </p>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {shown.map((kw) => (
        <span key={kw} className={`px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
          {kw}
        </span>
      ))}
      {rest > 0 && (
        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500 border border-gray-200">
          +{rest} more
        </span>
      )}
    </div>
  );
}

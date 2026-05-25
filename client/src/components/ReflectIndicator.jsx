import { ChevronDown } from 'lucide-react';

export default function ReflectIndicator({
  severity,
  gapCount = 0,
  onExpand,
  isExpanded,
  loading = false,
}) {
  if (loading) {
    return (
      <div
        className="mt-2 flex h-8 max-w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs text-reflect-muted"
        style={{
          background: '#f973161a',
          border: '1px solid #f9731640',
        }}
        aria-live="polite"
      >
        <span className="h-2 w-2 rounded-full bg-reflect-accent animate-reflect-pulse" />
        <span>Reflect is analysing...</span>
      </div>
    );
  }

  const isAmber = severity === 'amber';
  const areasLabel = gapCount === 1 ? 'area' : 'areas';

  return (
    <button
      type="button"
      onClick={onExpand}
      className="mt-2 flex h-8 min-h-[44px] max-w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-all duration-200 ease-out hover:brightness-110"
      style={
        isAmber
          ? {
              background: '#f973161a',
              border: '1px solid #f9731640',
              color: '#f97316',
            }
          : {
              background: '#22c55e1a',
              border: '1px solid #22c55e40',
              color: '#22c55e',
            }
      }
    >
      <span>
        {isAmber
          ? `⚠ Reflect — ${gapCount} ${areasLabel} worth a closer look`
          : '✓ Reflect — output looks reasonably complete'}
      </span>
      <ChevronDown
        className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 ease-out"
        style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
      />
    </button>
  );
}

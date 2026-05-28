export default function ReflectIndicator({
  severity,
  gapCount = 0,
  onExpand,
  isExpanded,
  loading = false,
}) {
  if (loading) {
    return (
      <>
        <div
          className="reflect-indicator-divider"
          aria-hidden="true"
        />
        <div
          className="reflect-indicator-banner reflect-indicator-loading w-full"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 shrink-0 rounded-full bg-reflect-accent animate-reflect-pulse" />
            <span className="text-xs text-reflect-muted">Reflect is analysing...</span>
          </div>
        </div>
      </>
    );
  }

  const isAmber = severity === 'amber';
  const areasLabel = gapCount === 1 ? 'area' : 'areas';
  const secondaryText = isExpanded
    ? null
    : isAmber
      ? `${gapCount} ${areasLabel} worth a closer look — tap to see assumptions, gaps & judgment prompts`
      : 'output looks reasonably complete — tap to see assumptions, gaps & judgment prompts';

  const primaryText = isExpanded
    ? 'Reflect Analysis — reviewing output'
    : 'Reflect Analysis ready';

  return (
    <>
      <div className="reflect-indicator-divider" aria-hidden="true" />
      <button
        type="button"
        onClick={onExpand}
        className={`reflect-indicator-banner w-full ${
          isExpanded ? 'reflect-indicator-expanded' : 'reflect-indicator-pulse'
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          <span
            className="shrink-0 text-base"
            style={{ color: '#f97316', fontSize: '16px', marginRight: '2px' }}
            aria-hidden="true"
          >
            ⚠
          </span>
          <div className="min-w-0 flex-1">
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: '#f97316',
              }}
            >
              {primaryText}
            </div>
            {!isExpanded && secondaryText && (
              <div
                style={{
                  fontSize: '12px',
                  color: '#a3a3a3',
                  fontWeight: 400,
                  marginTop: '2px',
                  lineHeight: 1.45,
                }}
              >
                {secondaryText}
              </div>
            )}
          </div>
        </div>
        <span
          className="shrink-0"
          style={{ color: '#f97316', fontSize: '18px' }}
          aria-hidden="true"
        >
          {isExpanded ? '▴' : '▾'}
        </span>
      </button>
    </>
  );
}

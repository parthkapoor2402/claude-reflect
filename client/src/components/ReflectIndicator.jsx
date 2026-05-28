export default function ReflectIndicator({
  tier = 'high',
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

  const areasLabel = gapCount === 1 ? 'area' : 'areas';

  const copyByTier = {
    low: {
      label: isExpanded ? 'Reflect — reviewing output' : 'Reflect available',
      subtext: 'Review assumptions and strengthen your next step',
      icon: null,
    },
    medium: {
      label: isExpanded ? 'Reflect — reviewing output' : 'Worth a second look',
      subtext: 'A few assumptions or judgment calls may need your review',
      icon: 'ℹ',
    },
    high: {
      label: isExpanded ? 'Reflect Analysis — reviewing output' : 'Potential gaps to review',
      subtext: `${gapCount} ${areasLabel} may need closer scrutiny before you act`,
      icon: '⚠',
    },
  };

  const resolvedTier = tier === 'low' || tier === 'medium' || tier === 'high' ? tier : 'high';
  const { label: primaryText, subtext, icon } = copyByTier[resolvedTier];
  const secondaryText = isExpanded ? null : subtext;

  const bannerVariantClass =
    resolvedTier === 'low'
      ? 'reflect-indicator-low'
      : resolvedTier === 'medium'
        ? 'reflect-indicator-medium'
        : 'reflect-indicator-high';

  return (
    <>
      <div
        className={`reflect-indicator-divider ${
          resolvedTier === 'low'
            ? 'reflect-indicator-divider-low'
            : resolvedTier === 'medium'
              ? 'reflect-indicator-divider-medium'
              : ''
        }`}
        aria-hidden="true"
      />
      <button
        type="button"
        onClick={onExpand}
        className={`reflect-indicator-banner w-full ${bannerVariantClass} ${
          isExpanded
            ? 'reflect-indicator-expanded'
            : resolvedTier === 'high'
              ? 'reflect-indicator-pulse'
              : ''
        }`}
      >
        <div className="flex min-w-0 flex-1 items-center gap-2.5 text-left">
          {icon && (
            <span
              className="shrink-0 text-base"
              style={{
                color: resolvedTier === 'high' ? '#f97316' : '#a3a3a3',
                fontSize: '16px',
                marginRight: '2px',
              }}
              aria-hidden="true"
            >
              {icon}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <div
              style={{
                fontSize: '14px',
                fontWeight: 700,
                color: resolvedTier === 'high' ? '#f97316' : 'var(--reflect-text)',
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
          style={{
            color: resolvedTier === 'high' ? '#f97316' : 'var(--reflect-muted)',
            fontSize: '18px',
          }}
          aria-hidden="true"
        >
          {isExpanded ? '▴' : '▾'}
        </span>
      </button>
    </>
  );
}

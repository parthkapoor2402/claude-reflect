import { useEffect, useState } from 'react';
import { categoryLabel, truncateWords } from '../utils/sessionBanner';

export default function SessionContextBanner({
  config,
  onContinue,
  onRunReflect,
  onDismiss,
}) {
  const [dismissing, setDismissing] = useState(false);

  useEffect(() => {
    setDismissing(false);
  }, [config?.sessionId]);

  if (!config) return null;

  const handleDismiss = () => {
    if (dismissing) return;
    setDismissing(true);
    setTimeout(() => {
      onDismiss?.();
    }, 200);
  };

  const handleContinue = () => {
    const summary = truncateWords(config.insight.summary, 8);
    onContinue?.(`Let's continue — ${summary}`);
    handleDismiss();
  };

  const handleRunReflect = () => {
    onRunReflect?.();
    handleDismiss();
  };

  const insightSummary = config.insight
    ? truncateWords(config.insight.summary, 8)
    : '';

  return (
    <div className={`session-banner ${dismissing ? 'dismissing' : ''}`}>
      <div className="session-banner-left">
        <span className="session-banner-star" aria-hidden="true">
          ✦
        </span>
        <div className="session-banner-copy">
          <p className="session-banner-title">&quot;{config.title}&quot;</p>
          {config.mode === 'A' ? (
            <p className="session-banner-subtitle">
              Reflect flagged: &quot;{insightSummary}&quot;
              <span className="session-banner-pill">
                {categoryLabel(config.insight.category)}
              </span>
            </p>
          ) : (
            <p className="session-banner-subtitle">
              Last active · {config.lastActiveLabel}
            </p>
          )}
        </div>
      </div>

      <div className="session-banner-actions">
        {config.mode === 'A' ? (
          <button
            type="button"
            className="session-banner-cta"
            onClick={handleContinue}
          >
            Continue →
          </button>
        ) : (
          <button
            type="button"
            className="session-banner-cta"
            onClick={handleRunReflect}
          >
            Run Reflect on this →
          </button>
        )}
        <button
          type="button"
          className="session-banner-dismiss"
          onClick={handleDismiss}
          aria-label="Dismiss session context"
        >
          ×
        </button>
      </div>
    </div>
  );
}

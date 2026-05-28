import { useEffect, useState } from 'react';

export default function SessionInsightCard({
  reflectOpenCount = 0,
  followUpActionCount = 0,
  onDismiss,
}) {
  const [isDismissing, setIsDismissing] = useState(false);

  const headlineCount = followUpActionCount;
  const headline =
    headlineCount === 1
      ? 'You caught 1 gap Claude missed.'
      : headlineCount === 2
        ? 'You caught 2 gaps Claude missed.'
        : `You caught ${headlineCount} gaps Claude missed.`;

  useEffect(() => {
    if (!isDismissing) return;
    const t = setTimeout(() => onDismiss?.(), 200);
    return () => clearTimeout(t);
  }, [isDismissing, onDismiss]);

  return (
    <div
      className={`session-insight-card ${isDismissing ? 'is-dismissing' : ''}`}
      style={{
        width: '100%',
        background: 'linear-gradient(135deg, #0f1a0f 0%, #0a1a12 100%)',
        border: '1.5px solid #22c55e40',
        borderRadius: '16px',
        padding: '20px 24px',
        marginTop: '24px',
        position: 'relative',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            style={{ color: '#22c55e', fontSize: '14px' }}
          >
            ✦
          </span>
          <span
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: '#22c55e',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}
          >
            Session Summary
          </span>
        </div>
        <button
          type="button"
          onClick={() => setIsDismissing(true)}
          aria-label="Dismiss session summary"
          style={{
            fontSize: '12px',
            color: '#a3a3a3',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1,
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginTop: '12px' }}>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#f5f5f5',
            lineHeight: 1.3,
            marginBottom: '6px',
          }}
        >
          {headline}
        </div>

        <div
          style={{
            fontSize: '13px',
            color: '#a3a3a3',
            lineHeight: 1.6,
            maxWidth: '480px',
          }}
        >
          Reflect helped surface what the AI didn&apos;t tell you — before you
          acted on an incomplete answer.
        </div>
      </div>

      <div
        className="flex flex-wrap"
        style={{ marginTop: '16px', gap: '12px' }}
      >
        <div
          style={{
            background: '#ffffff08',
            border: '1px solid #ffffff12',
            borderRadius: '8px',
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: '120px',
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f97316' }}>
            {reflectOpenCount}
          </div>
          <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>
            Reflect checks
          </div>
        </div>

        <div
          style={{
            background: '#ffffff08',
            border: '1px solid #ffffff12',
            borderRadius: '8px',
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: '120px',
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e' }}>
            {followUpActionCount}
          </div>
          <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>
            Gaps you fixed
          </div>
        </div>

        <div
          style={{
            background: '#ffffff08',
            border: '1px solid #ffffff12',
            borderRadius: '8px',
            padding: '10px 14px',
            textAlign: 'center',
            minWidth: '120px',
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#60a5fa' }}>
            ↑
          </div>
          <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>
            Output quality
          </div>
        </div>
      </div>

      <div
        className="text-center"
        style={{
          marginTop: '16px',
          fontSize: '12px',
          color: 'rgba(163, 163, 163, 0.25)',
          fontStyle: 'italic',
        }}
      >
        Reflect doesn&apos;t tell you what to trust — it shows you what to
        question.
      </div>
    </div>
  );
}


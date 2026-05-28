import { useEffect, useState } from 'react';

export default function SessionInsightCard({ reflectCount, gapsFixed, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(onDismiss, 200);
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '12px',
        right: '12px',
        zIndex: 50,
        background: 'linear-gradient(135deg, #0f1a0f 0%, #0a1a12 100%)',
        border: '1.5px solid rgba(34,197,94,0.25)',
        borderRadius: '16px',
        padding: '20px 24px',
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateY(0)' : 'translateY(16px)',
        transition: 'opacity 350ms ease, transform 350ms ease',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '13px',
            fontWeight: 700,
            color: '#22c55e',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
          }}
        >
          ✦ Session Summary
        </span>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#a3a3a3',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '0 4px',
          }}
          aria-label="Dismiss session insight"
          type="button"
        >
          ✕
        </button>
      </div>

      <div style={{ marginTop: '12px', marginBottom: '6px' }}>
        <div
          style={{
            fontSize: '20px',
            fontWeight: 800,
            color: '#f5f5f5',
            lineHeight: 1.3,
          }}
        >
          You caught {gapsFixed} gap{gapsFixed === 1 ? '' : 's'} Claude missed.
        </div>
      </div>

      <div
        style={{
          fontSize: '13px',
          color: '#a3a3a3',
          lineHeight: 1.6,
          maxWidth: '480px',
        }}
      >
        Reflect helped surface what the AI didn&apos;t tell you — before you acted on an
        incomplete answer.
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <div
          style={{
            background: '#ffffff08',
            border: '1px solid #ffffff12',
            borderRadius: '8px',
            padding: '10px 14px',
            textAlign: 'center',
            flex: '1 1 120px',
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#f97316' }}>
            {reflectCount}
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
            flex: '1 1 120px',
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#22c55e' }}>
            {gapsFixed}
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
            flex: '1 1 120px',
          }}
        >
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#60a5fa' }}>↑</div>
          <div style={{ fontSize: '11px', color: '#a3a3a3', marginTop: '2px' }}>
            Output quality
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: '16px',
          width: '100%',
          textAlign: 'center',
          fontStyle: 'italic',
          fontSize: '12px',
          color: '#a3a3a340',
        }}
      >
        Reflect doesn&apos;t tell you what to trust — it shows you what to question.
      </div>
    </div>
  );
}


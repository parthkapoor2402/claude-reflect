import { useEffect, useState } from 'react';

export default function ReflectMemoryCard({ title, body, onDismiss }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 30);
    return () => clearTimeout(t);
  }, []);

  const handleDismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss?.(), 200);
  };

  return (
    <div
      style={{
        background: 'rgba(24,24,27,0.96)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderLeft: '3px solid #8b5cf6',
        borderRadius: '12px',
        padding: '12px 14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.22)',
        backdropFilter: 'blur(8px)',
        opacity: visible && !leaving ? 1 : 0,
        transform: visible && !leaving ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 280ms ease, transform 280ms ease',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', color: 'rgba(245,245,245,0.75)', letterSpacing: '0.02em' }}>
          Reflect Memory
        </span>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss Reflect Memory"
          style={{
            background: 'none',
            border: 'none',
            color: 'rgba(245,245,245,0.55)',
            cursor: 'pointer',
            fontSize: '14px',
            lineHeight: 1,
            padding: '0 2px',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ marginTop: '2px', fontSize: '13px', fontWeight: 700, color: 'rgba(245,245,245,0.92)' }}>
        {title}
      </div>
      <div style={{ marginTop: '6px', fontSize: '12px', lineHeight: 1.5, color: 'rgba(245,245,245,0.68)' }}>
        {body}
      </div>
    </div>
  );
}


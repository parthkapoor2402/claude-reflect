import { useEffect } from 'react';
import { motion } from 'framer-motion';

const DOES_ITEMS = [
  'Surfaces assumptions made',
  'Flags uncertain topic areas',
  'Shows missing angles',
  'Prompts your own judgment',
];

const DOES_NOT_ITEMS = [
  'Fact-check claims',
  'Give trust scores',
  'Replace your judgment',
  'Guarantee completeness',
];

export default function AboutReflectModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4"
      style={{ background: 'rgba(0, 0, 0, 0.7)' }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-reflect-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="theme-transition w-full max-w-[480px] border border-reflect-border bg-reflect-card p-8"
        style={{
          borderRadius: '16px',
          boxShadow: '0 24px 48px rgba(0, 0, 0, 0.2)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          id="about-reflect-title"
          className="text-[20px] font-bold text-reflect-text"
        >
          <span className="text-reflect-accent">✦</span> About Reflect
        </h2>

        <hr className="my-4 border-reflect-border" />

        <p
          className="text-[14px] leading-[1.7] text-reflect-muted"
        >
          Reflect is a reasoning transparency layer — not a fact-checker and not
          a trust score. It surfaces the assumptions, confidence zones, and
          completeness gaps in AI responses so you can apply your own judgment
          precisely where it matters.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[14px] font-bold" style={{ color: '#22c55e' }}>
              Reflect DOES
            </p>
            <ul className="mt-2 space-y-1.5">
              {DOES_ITEMS.map((item) => (
                <li
                  key={item}
                  className="text-[13px] leading-snug text-reflect-muted"
                >
                  <span style={{ color: '#22c55e' }}>✓</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-[14px] font-bold" style={{ color: '#ef4444' }}>
              Reflect DOES NOT
            </p>
            <ul className="mt-2 space-y-1.5">
              {DOES_NOT_ITEMS.map((item) => (
                <li
                  key={item}
                  className="text-[13px] leading-snug text-reflect-muted"
                >
                  <span style={{ color: '#ef4444' }}>✗</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <hr className="my-4 border-reflect-border" />

        <p className="text-center text-[12px] italic text-reflect-muted">
          Reflect assists human judgment — it does not replace it.
        </p>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              background: '#f97316',
              borderRadius: '8px',
            }}
          >
            Got it
          </button>
        </div>
      </motion.div>
    </div>
  );
}

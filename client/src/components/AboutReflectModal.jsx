import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function AboutReflectModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-reflect-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2 }}
        className="theme-transition max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-reflect border border-reflect-border bg-reflect-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2
            id="about-reflect-title"
            className="text-lg font-semibold text-reflect-accent"
          >
            About Reflect
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] rounded-reflect p-2 text-reflect-muted transition-colors hover:text-reflect-text"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-6 text-sm leading-relaxed text-reflect-muted">
          Reflect is a reasoning transparency layer. It surfaces the assumptions,
          confidence zones, and completeness gaps in AI responses — helping you
          apply your own judgment more precisely. Reflect does not tell you what
          is correct. It helps you ask better questions.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-reflect border border-[#22c55e40] bg-[#22c55e1a] p-4">
            <p className="mb-2 text-xs font-semibold text-[#22c55e]">
              ✓ Reflect DOES
            </p>
            <ul className="space-y-1.5 text-xs text-reflect-muted">
              <li>Surface assumptions</li>
              <li>Flag uncertain areas</li>
              <li>Show missing angles</li>
              <li>Prompt your judgment</li>
            </ul>
          </div>
          <div className="rounded-reflect border border-[#ef444440] bg-[#ef44441a] p-4">
            <p className="mb-2 text-xs font-semibold text-[#ef4444]">
              ✕ Reflect DOES NOT
            </p>
            <ul className="space-y-1.5 text-xs text-reflect-muted">
              <li>Fact-check claims</li>
              <li>Give trust scores</li>
              <li>Replace your judgment</li>
              <li>Guarantee completeness</li>
            </ul>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="theme-transition mt-6 min-h-[44px] w-full rounded-reflect bg-reflect-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-reflect-accent/90"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, HelpCircle, ThumbsDown, ThumbsUp } from 'lucide-react';
import { gapMatchesExpected } from '../data/scenarios';
import AboutReflectModal from './AboutReflectModal';

const DIMENSIONS = [
  {
    key: 'reasoning_foundations',
    icon: '🔍',
    label: 'Reasoning Foundations',
    subtitle: 'Key assumptions this response makes',
    variant: 'list',
  },
  {
    key: 'confidence_topology',
    icon: '📊',
    label: 'Confidence Topology',
    subtitle: 'Areas where confidence may be lower',
    variant: 'list',
  },
  {
    key: 'completeness_gaps',
    icon: '🕳️',
    label: 'Completeness Gaps',
    subtitle: 'Important angles not covered',
    variant: 'gaps',
  },
  {
    key: 'judgment_prompts',
    icon: '🧠',
    label: 'Judgment Prompts',
    subtitle: 'Questions only you can answer',
    variant: 'questions',
  },
];

function DimensionSection({ dimension, items, index, expectedGaps }) {
  const { icon, label, subtitle, variant } = dimension;
  const list = Array.isArray(items) ? items.filter(Boolean) : [];

  if (list.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
      className="border-b border-reflect-border pb-4 last:border-b-0 last:pb-0"
    >
      <div className="mb-2 flex items-center gap-2">
        <span className="text-base">{icon}</span>
        <span className="text-sm font-semibold text-reflect-text">{label}</span>
      </div>
      <p className="mb-2 text-xs text-reflect-muted">{subtitle}</p>
      <ul className="space-y-2">
        {list.map((item, i) => {
          const showGapBadge =
            variant === 'gaps' &&
            expectedGaps?.length &&
            gapMatchesExpected(item, expectedGaps);

          return (
            <li
              key={i}
              className={
                variant === 'gaps'
                  ? 'border-l-2 border-reflect-accent pl-3 text-[13px] leading-relaxed text-reflect-muted'
                  : variant === 'questions'
                    ? 'rounded-reflect bg-[var(--reflect-question-bg)] px-3 py-2 text-[13px] italic leading-relaxed text-reflect-muted'
                    : 'text-[13px] leading-relaxed text-reflect-muted'
              }
            >
              {variant === 'list' ? (
                <span>
                  <span className="mr-1 opacity-60">›</span>
                  {item}
                </span>
              ) : variant === 'gaps' ? (
                <div className="flex flex-wrap items-start gap-2">
                  <span className="flex-1">{item}</span>
                  {showGapBadge && (
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background: '#22c55e1a',
                        border: '1px solid #22c55e40',
                        color: '#22c55e',
                      }}
                    >
                      ✓ Key gap detected
                    </span>
                  )}
                </div>
              ) : (
                item
              )}
            </li>
          );
        })}
      </ul>
    </motion.div>
  );
}

export default function ReflectPanel({
  reflectData,
  messageId,
  expectedGaps,
  onDismiss,
}) {
  const [aboutOpen, setAboutOpen] = useState(false);
  const feedbackKey = `reflect-feedback-${messageId}`;
  const [feedback, setFeedback] = useState(() => {
    try {
      return localStorage.getItem(feedbackKey) || null;
    } catch {
      return null;
    }
  });

  const handleFeedbackUp = () => {
    if (feedback === 'up') return;
    setFeedback('up');
    try {
      localStorage.setItem(feedbackKey, 'up');
    } catch {
      /* ignore */
    }
  };

  const handleFeedbackDown = () => {
    setFeedback('down');
    try {
      localStorage.setItem(feedbackKey, 'down');
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="w-full max-w-full overflow-hidden"
      >
        <div
          className="theme-transition mt-2 w-full rounded-reflect border border-reflect-border p-4"
          style={{ background: 'var(--reflect-panel-bg)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="text-sm font-semibold text-reflect-accent">
              ✦ Reflect Analysis
            </span>
            <button
              type="button"
              onClick={() => setAboutOpen(true)}
              className="min-h-[44px] min-w-[44px] rounded-full p-2 text-reflect-muted transition-colors hover:text-reflect-text"
              aria-label="About Reflect"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4">
            {DIMENSIONS.map((dim, index) => (
              <DimensionSection
                key={dim.key}
                dimension={dim}
                items={reflectData?.[dim.key]}
                index={index}
                expectedGaps={
                  dim.key === 'completeness_gaps' ? expectedGaps : undefined
                }
              />
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-reflect-border pt-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-reflect-muted">Was this useful?</span>
              <button
                type="button"
                onClick={handleFeedbackUp}
                disabled={feedback === 'up'}
                className={`min-h-[44px] min-w-[44px] rounded-reflect p-2 transition-all duration-200 ${
                  feedback === 'up'
                    ? 'cursor-default bg-[#22c55e1a] text-[#22c55e]'
                    : 'text-reflect-muted hover:text-reflect-text'
                }`}
                aria-label="Thumbs up"
              >
                {feedback === 'up' ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <ThumbsUp className="h-4 w-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleFeedbackDown}
                disabled={feedback === 'up'}
                className={`min-h-[44px] min-w-[44px] rounded-reflect p-2 transition-colors ${
                  feedback === 'down'
                    ? 'bg-red-500/20 text-red-400'
                    : 'text-reflect-muted hover:text-reflect-text'
                }`}
                aria-label="Thumbs down"
              >
                <ThumbsDown className="h-4 w-4" />
              </button>
            </div>
            <button
              type="button"
              onClick={onDismiss}
              className="min-h-[44px] px-2 text-xs text-reflect-muted transition-colors hover:text-red-400"
            >
              Dismiss
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] italic text-reflect-muted/80">
            Reflect assists human judgment — it does not replace it.
          </p>
        </div>
      </motion.div>

      <AboutReflectModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
    </>
  );
}

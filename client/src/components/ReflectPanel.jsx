import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ThumbsDown, ThumbsUp } from 'lucide-react';
import { gapMatchesExpected } from '../data/scenarios';
import {
  dismissReflectIntro,
  isReflectIntroDismissed,
} from '../utils/reflectIntro';

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

const PANEL_EXPAND_MS = 300;
const INTRO_DELAY_AFTER_PANEL_MS = 200;

const INTRO_DOES = [
  'Surfaces assumptions made',
  'Flags uncertain topic areas',
  'Shows missing angles',
  'Prompts your own judgment',
];

const INTRO_DOES_NOT = [
  'Fact-check claims',
  'Give trust scores',
  'Replace your judgment',
  'Guarantee completeness',
];

function ReflectIntroBanner({ onDismiss }) {
  const [expanded, setExpanded] = useState(false);

  const handleAction = () => {
    if (!expanded) {
      setExpanded(true);
      return;
    }
    onDismiss();
  };

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{
        height: 0,
        opacity: 0,
        transition: { duration: 0.2, ease: 'easeIn' },
      }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="mb-4 overflow-hidden"
    >
      <div
        style={{
          backgroundImage:
            'linear-gradient(180deg, #f9731610 0%, #f9731605 100%)',
          border: '1px solid #f9731630',
          borderRadius: '10px',
          padding: '12px 16px',
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <p
            className="min-w-0 flex-1 text-[13px] font-bold"
            style={{ color: '#f97316' }}
          >
            ✦ New to Reflect?
          </p>
          <button
            type="button"
            onClick={handleAction}
            className="relative shrink-0 cursor-pointer border-0 bg-transparent p-0 text-[12px] font-semibold hover:opacity-80"
            style={{ color: '#f97316', minWidth: '4.5rem' }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={expanded ? 'close' : 'gotit'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="inline-block"
              >
                {expanded ? 'Close ✕' : 'Got it →'}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>

        <p className="mt-1 text-[12px] leading-[1.5] text-reflect-muted">
          Reflect doesn&apos;t fact-check — it surfaces what was assumed,
          what&apos;s uncertain, and what&apos;s missing. You stay in control.
        </p>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <hr
                className="mt-3 border-0"
                style={{ borderTop: '1px solid #f9731630' }}
              />

              <div className="mt-3 grid grid-cols-2 gap-4">
                <div>
                  <p
                    className="text-[12px] font-bold"
                    style={{ color: '#22c55e' }}
                  >
                    ✓ Reflect DOES
                  </p>
                  <ul className="mt-1.5 space-y-0">
                    {INTRO_DOES.map((item) => (
                      <li
                        key={item}
                        className="text-[12px] leading-[1.8] text-reflect-muted"
                      >
                        <span style={{ color: '#22c55e' }}>✓</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p
                    className="text-[12px] font-bold"
                    style={{ color: '#ef4444' }}
                  >
                    ✗ Reflect DOES NOT
                  </p>
                  <ul className="mt-1.5 space-y-0">
                    {INTRO_DOES_NOT.map((item) => (
                      <li
                        key={item}
                        className="text-[12px] leading-[1.8] text-reflect-muted"
                      >
                        <span style={{ color: '#ef4444' }}>✗</span> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <p className="mt-3 text-center text-[11px] italic text-reflect-muted">
                Reflect assists human judgment — it does not replace it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function DimensionSection({ dimension, items, index, expectedGaps }) {
  const { icon, label, subtitle, variant } = dimension;
  const list = Array.isArray(items) ? items.filter(Boolean) : [];

  if (list.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05, ease: 'easeOut' }}
      className="h-auto overflow-visible border-b border-reflect-border pb-4 last:border-b-0 last:pb-0"
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
                  ? 'h-auto overflow-visible whitespace-normal break-words border-l-2 border-reflect-accent pl-3 text-[13px] leading-relaxed text-reflect-muted'
                  : variant === 'questions'
                    ? 'h-auto overflow-visible whitespace-normal break-words rounded-reflect bg-[var(--reflect-question-bg)] px-3 py-2 text-[13px] italic leading-relaxed text-reflect-muted'
                    : 'h-auto overflow-visible whitespace-normal break-words text-[13px] leading-relaxed text-reflect-muted'
              }
            >
              {variant === 'list' ? (
                <span className="whitespace-normal break-words">
                  <span className="mr-1 inline opacity-60">›</span>
                  {item}
                </span>
              ) : variant === 'gaps' ? (
                <div className="flex flex-wrap items-start gap-2">
                  <span className="min-w-0 flex-1 whitespace-normal break-words">
                    {item}
                  </span>
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
                <span className="whitespace-normal break-words">{item}</span>
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
  const [showIntroBanner, setShowIntroBanner] = useState(false);
  const feedbackKey = `reflect-feedback-${messageId}`;
  const [feedback, setFeedback] = useState(() => {
    try {
      return localStorage.getItem(feedbackKey) || null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (isReflectIntroDismissed()) return;

    const delay = PANEL_EXPAND_MS + INTRO_DELAY_AFTER_PANEL_MS;
    const timer = setTimeout(() => setShowIntroBanner(true), delay);

    return () => clearTimeout(timer);
  }, []);

  const handleIntroDismiss = () => {
    dismissReflectIntro();
    setShowIntroBanner(false);
  };

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
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="w-full max-w-full overflow-visible"
    >
      <div
        className="theme-transition mt-2 max-h-[70vh] w-full overflow-x-hidden overflow-y-auto rounded-reflect border border-reflect-border p-4"
        style={{ background: 'var(--reflect-panel-bg)' }}
      >
        <div className="mb-4">
          <span className="text-sm font-semibold text-reflect-accent">
            ✦ Reflect Analysis
          </span>
        </div>

        <AnimatePresence>
          {showIntroBanner && !isReflectIntroDismissed() && (
            <ReflectIntroBanner
              key="reflect-intro-banner"
              onDismiss={handleIntroDismiss}
            />
          )}
        </AnimatePresence>

        <div className="h-auto space-y-4 overflow-visible">
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

        <hr className="mt-4 border-[#2a2a2a]" />

        <p
          className="mt-3 text-center text-[11px] italic"
          style={{ color: 'rgba(163, 163, 163, 0.2)' }}
        >
          Reflect assists judgment — not a verdict, not a trust score
        </p>
      </div>
    </motion.div>
  );
}

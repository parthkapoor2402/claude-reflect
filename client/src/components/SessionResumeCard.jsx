import { useCallback, useEffect, useRef, useState } from 'react';
import { getOpenInsights } from '../lib/sessions';

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`;
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function animateCount(element, target, duration = 600) {
  if (!element) return;
  let start = null;
  const step = (timestamp) => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = 1 - (1 - progress) ** 3;
    element.textContent = String(Math.round(eased * target));
    if (progress < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

function categoryLabel(category) {
  switch (category) {
    case 'correctness':
      return 'correctness';
    case 'completeness':
      return 'completeness';
    case 'reasoning':
      return 'reasoning';
    case 'uncertainty':
      return 'uncertainty';
    default:
      return category;
  }
}

function StatCard({ value, label, valueClassName, visible, countRef }) {
  useEffect(() => {
    if (!visible || !countRef.current) return;
    animateCount(countRef.current, value);
  }, [visible, value, countRef]);

  return (
    <div className={`resume-stat-card stat-card ${visible ? 'visible' : ''}`}>
      <div className={`resume-stat-value ${valueClassName || ''}`} ref={countRef}>
        0
      </div>
      <div className="resume-stat-label">{label}</div>
    </div>
  );
}

export default function SessionResumeCard({ session, onContinue, onOpenChat }) {
  const summary = session.reflectSummary;
  const [dismissing, setDismissing] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [openSectionVisible, setOpenSectionVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const flaggedRef = useRef(null);
  const addressedRef = useRef(null);
  const openRef = useRef(null);
  const dismissTimerRef = useRef(null);
  const handleOpenChatRef = useRef(() => {});

  const openInsights = getOpenInsights(session);
  const totalInsights = summary?.totalInsights ?? 0;
  const addressedInsights = summary?.addressedInsights ?? 0;
  const stillOpen = Math.max(totalInsights - addressedInsights, 0);
  const allResolved = openInsights.length === 0 && totalInsights > 0;
  const firstOpen = openInsights[0];
  const reflectRuns = summary?.reflectRunCount ?? 0;
  const pct =
    addressedInsights > 0 && totalInsights > 0
      ? Math.round((addressedInsights / totalInsights) * 100)
      : null;

  const dismiss = useCallback(
    (callback) => {
      if (dismissing) return;
      setDismissing(true);
      setTimeout(() => {
        callback?.();
      }, 200);
    },
    [dismissing]
  );

  const handleContinue = () => {
    const prefill = firstOpen ? `Let's revisit: ${firstOpen.summary}` : '';
    dismiss(() => onContinue?.(prefill));
  };

  const handleOpenChat = () => {
    dismiss(() => onOpenChat?.());
  };

  handleOpenChatRef.current = handleOpenChat;

  useEffect(() => {
    const statsTimer = setTimeout(() => setStatsVisible(true), 350);
    const openTimer = setTimeout(() => setOpenSectionVisible(true), 350 + 120 * 3 + 200);
    return () => {
      clearTimeout(statsTimer);
      clearTimeout(openTimer);
    };
  }, []);

  useEffect(() => {
    if (paused) {
      clearTimeout(dismissTimerRef.current);
      return undefined;
    }

    dismissTimerRef.current = setTimeout(() => {
      handleOpenChatRef.current();
    }, 8000);

    return () => clearTimeout(dismissTimerRef.current);
  }, [paused]);

  if (!summary) return null;

  const taskLabel =
    summary.taskLabel ||
    session.title ||
    'Session summary...';

  return (
    <div
      className={`resume-overlay ${dismissing ? 'resume-overlay-dismissing' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Reflect session summary"
    >
      <div
        className={`resume-card ${dismissing ? 'dismissing' : ''}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div className="resume-card-header">
          <div>
            <div className="resume-card-title">
              <span className="resume-card-star">✦</span> Reflect Summary
            </div>
            <p className="resume-task-label">&quot;{taskLabel}&quot;</p>
          </div>
          <button
            type="button"
            className="resume-close-btn"
            onClick={handleOpenChat}
            aria-label="Close summary"
          >
            ×
          </button>
        </div>

        <div className="resume-stats-grid">
          <StatCard
            value={totalInsights}
            label="gaps found by Reflect"
            visible={statsVisible}
            countRef={flaggedRef}
          />
          {addressedInsights > 0 && (
            <StatCard
              value={addressedInsights}
              label="you acted on"
              valueClassName="resume-stat-green"
              visible={statsVisible}
              countRef={addressedRef}
            />
          )}
          <StatCard
            value={stillOpen}
            label="still open"
            valueClassName="resume-stat-orange"
            visible={statsVisible}
            countRef={openRef}
          />
        </div>

        {pct !== null && (
          <p className="resume-pct-line">
            You acted on {pct}% of Reflect&apos;s findings
          </p>
        )}

        <div
          className={`resume-open-section ${openSectionVisible ? 'visible' : ''}`}
        >
          {allResolved ? (
            <p className="resume-all-resolved">
              ✓ You addressed every insight Reflect flagged in this session.
            </p>
          ) : firstOpen ? (
            <>
              <p className="resume-section-label">STILL OPEN</p>
              <p className="resume-insight-text">&quot;{firstOpen.summary}&quot;</p>
              <div className="resume-insight-meta">
                <span className="resume-category-pill">
                  {categoryLabel(firstOpen.category)}
                </span>
                <span className="resume-insight-status">not yet verified</span>
              </div>
            </>
          ) : null}
        </div>

        <div className="resume-divider" />

        <button type="button" className="resume-primary-btn" onClick={handleContinue}>
          {allResolved ? 'Pick up where you left off →' : 'Continue working on this →'}
        </button>
        <button type="button" className="resume-secondary-btn" onClick={handleOpenChat}>
          Just open chat
        </button>

        <p className="resume-footer-line">
          Reflect ran {reflectRuns} time{reflectRuns === 1 ? '' : 's'} in this session
          {' · '}
          {timeAgo(summary.lastRunAt)}
        </p>

        <div
          className={`resume-countdown ${paused ? 'paused' : ''}`}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

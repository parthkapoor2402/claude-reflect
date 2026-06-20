import { motion } from 'framer-motion';
import { AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { getScenarioById } from '../data/scenarios';
import { getReflectTier } from '../utils/reflectTier';
import ReflectIndicator from './ReflectIndicator';
import ReflectPanel from './ReflectPanel';
import TypingIndicator from './TypingIndicator';
import MessageSkeleton from './MessageSkeleton';

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export default function MessageBubble({
  message,
  isActivelyStreaming = false,
  onReflectExpand,
  onReflectDismiss,
  onRetry,
}) {
  const {
    role,
    content,
    timestamp,
    isError,
    isRetryable,
    isStreaming,
    id,
    scenarioId,
    expectedGaps,
    reflect,
  } = message;

  const scenarioExpectedGaps =
    expectedGaps ??
    (scenarioId ? getScenarioById(scenarioId)?.expectedGaps : undefined);

  const isUser = role === 'user';
  const showSkeleton =
    !isUser && isStreaming && !content?.trim() && !isError && !isActivelyStreaming;
  const showTyping =
    !isUser && isActivelyStreaming && !content?.trim() && !isError;

  const showReflect =
    !isUser && !isError && reflect && !reflect.dismissed;

  const showIndicator =
    showReflect && (reflect.loading || reflect.data);

  const reflectTier = showReflect
    ? getReflectTier({ responseText: content || '', scenarioId })
    : null;

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex animate-slide-up flex-col items-end gap-1"
      >
        <div
          className="bg-reflect-accent text-sm leading-relaxed text-white"
          style={{
            width: 'fit-content',
            maxWidth: '85%',
            minWidth: '80px',
            height: 'auto',
            overflow: 'visible',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            padding: '12px 16px',
            borderRadius: '18px',
          }}
        >
          {content}
        </div>
        <span className="text-xs text-reflect-muted">{formatTime(timestamp)}</span>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex animate-slide-up flex-col gap-1"
    >
      <div className="flex gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-reflect-accent text-xs font-semibold text-white">
          CR
        </div>
        <div className="min-w-0 flex-1">
          <div
            className={`theme-transition rounded-reflect border-l-2 border-reflect-border bg-reflect-card px-4 py-3 text-sm leading-relaxed text-reflect-text ${
              isError ? 'text-red-400' : ''
            }`}
          >
            {showSkeleton && <MessageSkeleton />}
            {showTyping && <TypingIndicator />}
            {!showSkeleton && !showTyping && (
              isError ? (
                <span>{content}</span>
              ) : (
                <div
                  className={`ai-response-content ${
                    isStreaming && content ? 'animate-fade-in' : ''
                  }`}
                >
                  <ReactMarkdown>{content || ''}</ReactMarkdown>
                </div>
              )
            )}
            {isRetryable && isError && (
              <button
                type="button"
                onClick={() => onRetry?.(id)}
                className="theme-transition mt-3 min-h-[44px] rounded-reflect border border-reflect-border px-4 py-2 text-xs font-medium text-reflect-text transition-colors hover:border-reflect-accent hover:text-reflect-accent"
              >
                Retry
              </button>
            )}
          </div>

          {reflect?.data && !reflect?.loading && !reflect?.dismissed && (
            <span className="mt-1 block text-xs text-orange-400/70">
              ✦ Reflect reviewed
            </span>
          )}

          {showIndicator && (
            <div className="reflect-layer mt-2 w-full max-w-full">
              <ReflectIndicator
                tier={reflectTier}
                severity={reflect.loading ? undefined : reflect.data?.severity}
                gapCount={
                  reflect.data?.gap_count ??
                  reflect.data?.completeness_gaps?.length ??
                  0
                }
                onExpand={() => onReflectExpand(id)}
                isExpanded={reflect.expanded}
                loading={reflect.loading}
              />
              <AnimatePresence>
                {reflect.expanded && reflect.data && !reflect.loading && (
                  <ReflectPanel
                    key="reflect-panel"
                    reflectData={reflect.data}
                    tier={reflectTier}
                    messageId={id}
                    expectedGaps={scenarioExpectedGaps}
                    onDismiss={() => onReflectDismiss(id)}
                  />
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
      <span className="pl-11 text-xs text-reflect-muted">{formatTime(timestamp)}</span>
    </motion.div>
  );
}

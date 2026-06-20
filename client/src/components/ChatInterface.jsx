import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUp, Menu } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useChat } from '../hooks/useChat';
import { SCENARIOS } from '../data/scenarios';
import MessageBubble from './MessageBubble';
import ScenarioSelector from './ScenarioSelector';
import ActiveScenarioBar from './ActiveScenarioBar';
import ScenarioToast from './ScenarioToast';
import OfflineBanner from './OfflineBanner';
import SessionInsightFloatingCard from './SessionInsightFloatingCard';
import ReflectMemoryCard from './ReflectMemoryCard';
import { getReflectMemoryInsight } from '../utils/reflectMemory';
import { initVoiceInput, isSpeechSupported } from '../utils/voiceInput';

export default function ChatInterface({ onMenuClick }) {
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const [input, setInput] = useState('');
  const [lockedScenario, setLockedScenario] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [inputShake, setInputShake] = useState(false);
  const [sendPressed, setSendPressed] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const reflectOpenCount = useRef(0);
  const followUpAfterReflect = useRef(false);
  const sessionCardShown = useRef(false);
  const [showSessionCard, setShowSessionCard] = useState(false);
  const lastReflectWasOpen = useRef(false);
  const sessionCardTimerRef = useRef(null);

  const reflectMemory = useRef({
    totalPrompts: 0,
    totalReflectOpens: 0,
    totalFollowUpsAfterReflect: 0,
    scenarioUsage: {
      risk: { prompts: 0, reflectOpens: 0, followUps: 0 },
      career: { prompts: 0, reflectOpens: 0, followUps: 0 },
      revenue: { prompts: 0, reflectOpens: 0, followUps: 0 },
      custom: { prompts: 0, reflectOpens: 0, followUps: 0 },
    },
    lastScenarioType: 'custom',
    memoryInsightShownCount: 0,
  });
  const [memoryInsight, setMemoryInsight] = useState(null);
  const memoryInsightCooldown = useRef(false);
  const lastActionWasReflectOpen = useRef(false);
  const memoryInsightTimerRef = useRef(null);
  const memoryCooldownTimerRef = useRef(null);

  const {
    activeSessionId,
    activeSession,
    startNewSession,
    saveMessage,
    reloadSessions,
    markReflectUsed,
  } = useSession();
  const sessionPersistRef = useRef({});
  sessionPersistRef.current = {
    activeSessionId,
    startNewSession,
    saveMessage,
    reloadSessions,
    markReflectUsed,
  };

  const {
    messages,
    isLoading,
    sendMessage,
    toggleReflectExpanded,
    dismissReflect,
    retryMessage,
    restoreMessages,
  } = useChat(scrollRef, sessionPersistRef);

  const lastLoadedSessionIdRef = useRef(null);

  useEffect(() => {
    if (activeSessionId === lastLoadedSessionIdRef.current) return;

    const prevId = lastLoadedSessionIdRef.current;
    lastLoadedSessionIdRef.current = activeSessionId;

    const sessionMessages = activeSession?.messages ?? [];
    if (
      prevId == null &&
      activeSessionId &&
      messages.length > sessionMessages.length
    ) {
      return;
    }

    restoreMessages(sessionMessages);
  }, [activeSessionId, activeSession?.messages, messages.length, restoreMessages]);

  const handleReflectToggle = useCallback(
    (messageId) => {
      const target = messages.find((m) => m.id === messageId);
      const wasExpanded = Boolean(target?.reflect?.expanded);
      toggleReflectExpanded(messageId);
      if (!wasExpanded) {
        reflectOpenCount.current += 1;
        lastReflectWasOpen.current = true;

        reflectMemory.current.totalReflectOpens += 1;
        const scenarioType = reflectMemory.current.lastScenarioType || 'custom';
        reflectMemory.current.scenarioUsage[scenarioType].reflectOpens += 1;
        lastActionWasReflectOpen.current = true;
      }
    },
    [messages, toggleReflectExpanded]
  );

  useEffect(() => {
    if (isLoading) return;
    if (sessionCardShown.current) return;
    if (messages.length < 4) return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;

    if (
      reflectOpenCount.current >= 1 &&
      followUpAfterReflect.current === true &&
      sessionCardShown.current === false
    ) {
      sessionCardShown.current = true;
      if (sessionCardTimerRef.current) {
        clearTimeout(sessionCardTimerRef.current);
      }
      sessionCardTimerRef.current = setTimeout(() => setShowSessionCard(true), 1200);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      if (sessionCardTimerRef.current) clearTimeout(sessionCardTimerRef.current);
      if (memoryInsightTimerRef.current) clearTimeout(memoryInsightTimerRef.current);
      if (memoryCooldownTimerRef.current) clearTimeout(memoryCooldownTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;
    if (messages.length === 0) return; // no onboarding / landing screen
    const last = messages[messages.length - 1];
    if (!last || last.role !== 'assistant') return;

    if (memoryInsightCooldown.current) return;

    const insight = getReflectMemoryInsight(reflectMemory.current);
    if (!insight) return;
    if (reflectMemory.current.memoryInsightShownCount >= 2) return;

    memoryInsightTimerRef.current = setTimeout(() => {
      setMemoryInsight(insight);
      reflectMemory.current.memoryInsightShownCount += 1;
      memoryInsightCooldown.current = true;
      memoryCooldownTimerRef.current = setTimeout(() => {
        memoryInsightCooldown.current = false;
      }, 90000);
    }, 1200);
  }, [messages, isLoading]);

  useEffect(() => {
    if (!isSpeechSupported) return undefined;
    return initVoiceInput();
  }, []);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  const adjustTextareaHeight = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const lineHeight = 24;
    const maxHeight = lineHeight * 3;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    adjustTextareaHeight();
  }, [input, adjustTextareaHeight]);

  const showToast = useCallback((message) => {
    setToast({ visible: true, message });
  }, []);

  useEffect(() => {
    if (!toast.visible) return;
    const t = setTimeout(
      () => setToast({ visible: false, message: '' }),
      3200
    );
    return () => clearTimeout(t);
  }, [toast.visible, toast.message]);

  const loadScenario = useCallback(
    (scenario) => {
      setLockedScenario(scenario);
      setInput(scenario.prompt);
      adjustTextareaHeight();
      setTimeout(() => textareaRef.current?.focus(), 200);
      showToast(`${scenario.title} selected — press Send`);
    },
    [adjustTextareaHeight, showToast]
  );

  const triggerInputShake = () => {
    setInputShake(true);
    setTimeout(() => setInputShake(false), 400);
  };

  const handleSend = async () => {
    if (!input.trim()) {
      triggerInputShake();
      return;
    }
    if (isLoading) return;

    if (lastReflectWasOpen.current === true) {
      followUpAfterReflect.current = true;
      lastReflectWasOpen.current = false;
    }

    if (lastActionWasReflectOpen.current === true) {
      reflectMemory.current.totalFollowUpsAfterReflect += 1;
      const scenarioType = reflectMemory.current.lastScenarioType || 'custom';
      reflectMemory.current.scenarioUsage[scenarioType].followUps += 1;
      lastActionWasReflectOpen.current = false;
    }

    const prompt = input;
    const scenario =
      lockedScenario ||
      SCENARIOS.find((s) => s.prompt.trim() === prompt.trim()) ||
      null;

    reflectMemory.current.totalPrompts += 1;
    const scenarioType = scenario?.id?.includes('risk')
      ? 'risk'
      : scenario?.id?.includes('career')
        ? 'career'
        : scenario?.id?.includes('revenue')
          ? 'revenue'
          : 'custom';
    reflectMemory.current.scenarioUsage[scenarioType].prompts += 1;
    reflectMemory.current.lastScenarioType = scenarioType;

    if (scenario) {
      setLockedScenario(scenario);
    }

    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const sent = await sendMessage(prompt, scenario);
    if (sent) {
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          top: scrollRef.current.scrollHeight,
          behavior: 'smooth',
        });
      }, 150);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isEmpty = messages.length === 0;
  const hasInput = input.trim().length > 0;
  const canSend = hasInput && !isLoading;
  const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
  const streamingAssistantId =
    isLoading && lastAssistant ? lastAssistant.id : null;

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-reflect-surface">
      <OfflineBanner visible={isOffline} />
      <ScenarioToast message={toast.message} visible={toast.visible} />

      <header className="relative z-20 shrink-0 border-b border-reflect-border px-4 py-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-reflect text-reflect-muted hover:bg-reflect-card md:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h1 className="text-base font-semibold text-reflect-text">Claude Reflect</h1>
          <p className="text-xs text-reflect-accent/90">AI Output Transparency Layer</p>
        </div>
        <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${isOffline ? 'bg-red-500' : 'bg-green-500'}`}
          />
          <span className="rounded-reflect border border-reflect-border bg-reflect-card px-2 py-0.5 text-[10px] text-reflect-muted">
            {isOffline ? 'Offline' : 'Live'}
          </span>
        </div>
      </header>

      {/* Scrollable content — never steals space from input dock */}
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4"
      >
        {isEmpty ? (
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 text-center">
              <span className="text-4xl text-reflect-accent">✦</span>
              <h2 className="mt-2 text-lg font-semibold text-reflect-text">
                Claude Reflect
              </h2>
              <p className="mt-1 text-xs text-reflect-muted">
                AI transparency layer — see the reasoning behind every response
              </p>
            </div>
            <p className="mb-3 text-center text-[11px] text-reflect-muted">
              These scenarios showcase where Reflect&apos;s completeness analysis is
              most powerful
            </p>
            {!lockedScenario ? (
              <>
                <p className="mb-2 text-center text-sm font-medium text-reflect-text">
                  Try a demo scenario:
                </p>
                <ScenarioSelector
                  onLoadScenario={loadScenario}
                  className="flex-nowrap justify-start overflow-x-auto pb-2 md:justify-center"
                />
                <p className="mt-4 text-center text-xs text-reflect-muted">
                  Then press Send ↓
                </p>
              </>
            ) : (
              <>
                <p className="mb-2 text-center text-sm font-medium text-reflect-text">
                  Active scenario:
                </p>
                <ScenarioSelector
                  scenarios={[lockedScenario]}
                  onLoadScenario={loadScenario}
                  className="justify-center pb-2"
                />
                <p className="mt-4 text-center text-xs text-reflect-muted">
                  Press Send to start · New Chat picks another scenario
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 pb-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isActivelyStreaming={message.id === streamingAssistantId}
                onReflectExpand={handleReflectToggle}
                onReflectDismiss={dismissReflect}
                onRetry={retryMessage}
              />
            ))}
          </div>
        )}
      </div>

      {memoryInsight && !isEmpty && (
        <div
          style={{
            margin: '8px 12px 10px 12px',
            alignSelf: 'flex-start',
            width: 'min(360px, calc(100% - 24px))',
            zIndex: 1,
          }}
        >
          <ReflectMemoryCard
            title={memoryInsight.title}
            body={memoryInsight.body}
            onDismiss={() => setMemoryInsight(null)}
          />
        </div>
      )}

      {showSessionCard && !isEmpty && (
        <SessionInsightFloatingCard
          reflectCount={reflectOpenCount.current}
          gapsFixed={followUpAfterReflect.current ? 1 : 0}
          onDismiss={() => setShowSessionCard(false)}
        />
      )}

      {/* Fixed input dock — always visible */}
      <div className="shrink-0 border-t border-reflect-border bg-reflect-surface px-3 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
        <div className="mx-auto max-w-3xl">
          {lockedScenario && <ActiveScenarioBar scenario={lockedScenario} />}

          <div
            className={`flex items-end gap-2 rounded-reflect border-2 border-reflect-border bg-reflect-card p-2 ${
              inputShake ? 'animate-shake-input' : ''
            } ${hasInput ? 'border-reflect-accent/60' : ''}`}
          >
            {isSpeechSupported && (
              <button
                id="voice-input-btn"
                className="voice-btn"
                type="button"
                aria-label="Voice input"
                title="Speak your prompt (English / Hindi)"
                disabled={isLoading}
              >
                <svg
                  id="voice-icon-mic"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
                <svg
                  id="voice-icon-stop"
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ display: 'none' }}
                  aria-hidden="true"
                >
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              </button>
            )}
            <textarea
              id="prompt-input"
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              rows={2}
              disabled={isLoading}
              className="min-h-[44px] max-h-[72px] min-w-0 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-snug text-reflect-text placeholder:text-reflect-muted focus:outline-none"
            />
            <button
              type="button"
              onClick={handleSend}
              onPointerDown={() => setSendPressed(true)}
              onPointerUp={() => setSendPressed(false)}
              onPointerLeave={() => setSendPressed(false)}
              disabled={!canSend}
              style={{ transform: sendPressed ? 'scale(0.95)' : 'scale(1)' }}
              className="flex h-12 min-h-[48px] shrink-0 items-center justify-center gap-1.5 rounded-reflect bg-reflect-accent px-4 text-white shadow-md transition-transform hover:bg-orange-500 disabled:cursor-not-allowed disabled:bg-reflect-border disabled:text-reflect-muted disabled:shadow-none"
              aria-label="Send message"
            >
              <span className="text-sm font-semibold">Send</span>
              <ArrowUp className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-2 text-center text-[10px] text-reflect-muted">
            {isLoading
              ? 'AI is responding… Reflect runs after'
              : lockedScenario
                ? 'Follow-ups refine the response using Reflect gaps'
                : hasInput
                  ? 'Press Send — Reflect analysis runs automatically after'
                  : 'Pick one scenario, then Send'}
          </p>
        </div>
      </div>
    </div>
  );
}

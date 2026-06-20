import { useCallback, useEffect, useRef, useState } from 'react';
import { getSession, getSessions, updateSession } from '../lib/sessions';
import {
  getSessionInsightCounts,
  incrementFollowUpActionCount,
  incrementReflectOpenCount,
  markSessionCardShown,
  resetSessionInsight,
} from '../utils/sessionInsight';

const API_BASE = import.meta.env.VITE_API_URL || '';
const CHAT_API = `${API_BASE}/api/chat`;
const REFLECT_API = `${API_BASE}/api/reflect`;
const REFLECT_TIMEOUT_MS = 8000;

const GREEN_FALLBACK = {
  severity: 'green',
  reasoning_foundations: [
    'Reflect surfaced a quick completeness check for this response.',
  ],
  confidence_topology: [],
  completeness_gaps: [],
  judgment_prompts: ['What context from your situation should shape how you read this?'],
  gap_count: 0,
};

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function getDismissedKey(messageId) {
  return `reflect-dismissed-${messageId}`;
}

function isReflectDismissed(messageId) {
  try {
    return localStorage.getItem(getDismissedKey(messageId)) === 'true';
  } catch {
    return false;
  }
}

function deriveReflectNote(reflectData) {
  const gaps = Array.isArray(reflectData?.completeness_gaps)
    ? reflectData.completeness_gaps.filter(Boolean)
    : [];
  const topology = Array.isArray(reflectData?.confidence_topology)
    ? reflectData.confidence_topology.filter(Boolean)
    : [];

  const firstIssue = gaps[0] || topology[0];
  if (!firstIssue) {
    return 'Output verified — no gaps found';
  }

  const trimmed = firstIssue.trim();
  return trimmed.length <= 60 ? trimmed : trimmed.slice(0, 60).trim();
}

function buildChatPrompt(trimmed, priorMessages, sessionScenario) {
  if (!sessionScenario) return trimmed;

  const hasPriorAssistant = priorMessages.some(
    (m) => m.role === 'assistant' && m.content?.trim() && !m.isError
  );
  if (!hasPriorAssistant) return trimmed;

  const lastAssistant = [...priorMessages]
    .reverse()
    .find((m) => m.role === 'assistant' && m.content?.trim() && !m.isError);

  const gaps = lastAssistant?.reflect?.data?.completeness_gaps?.filter(Boolean);
  if (!gaps?.length) return trimmed;

  return `[Continuing scenario: ${sessionScenario.title}]

Original scenario:
${sessionScenario.prompt}

Reflect flagged these completeness gaps in your last response:
${gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}

The user is now filling those gaps with this follow-up:
${trimmed}

Give a refined, more complete response that directly addresses the gaps above. Stay on this scenario only.`;
}

export function useChat(scrollRef, sessionPersistRef) {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionInsightVisible, setSessionInsightVisible] = useState(false);
  const abortRef = useRef(null);
  const reflectGenerationRef = useRef(0);
  const lastRequestRef = useRef(null);
  const sessionScenarioRef = useRef(null);
  const followUpQueuedRef = useRef(false);

  const persistUserMessage = useCallback((content) => {
    const persist = sessionPersistRef?.current;
    if (!persist?.saveMessage) return;

    if (!persist.activeSessionId && persist.startNewSession) {
      persist.startNewSession();
    }

    const sessionId =
      persist.activeSessionId ||
      getSessions()[0]?.id;

    if (sessionId) {
      const session = getSession(sessionId);
      if (session?.title === 'New Session') {
        const trimmed = content.trim();
        const title =
          trimmed.length <= 50 ? trimmed : trimmed.slice(0, 50).trim();
        updateSession({ ...session, title });
        persist.reloadSessions?.();
      }
    }

    persist.saveMessage('user', content);
  }, [sessionPersistRef]);

  const persistAssistantMessage = useCallback(
    (content) => {
      sessionPersistRef?.current?.saveMessage?.('assistant', content);
    },
    [sessionPersistRef]
  );

  const restoreMessages = useCallback((sessionMessages = []) => {
    reflectGenerationRef.current += 1;
    if (abortRef.current) abortRef.current.abort();
    setIsLoading(false);
    setMessages(
      sessionMessages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        timestamp: new Date(message.timestamp),
        reflect: null,
      }))
    );
    sessionScenarioRef.current = null;
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      if (scrollRef?.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
  }, [scrollRef]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const patchMessageReflect = useCallback((messageId, patch) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.role === 'assistant'
          ? { ...m, reflect: { ...(m.reflect || {}), ...patch } }
          : m
      )
    );
    scrollToBottom();
  }, [scrollToBottom]);

  const runReflectAnalysis = useCallback(
    async (assistantId, prompt, primaryResponse, autoExpand) => {
      if (isReflectDismissed(assistantId)) return;

      const generation = ++reflectGenerationRef.current;

      patchMessageReflect(assistantId, {
        loading: true,
        data: null,
        expanded: false,
        dismissed: false,
      });

      let settled = false;
      const finish = (patch) => {
        if (settled || generation !== reflectGenerationRef.current) return;
        settled = true;
        clearTimeout(timeoutId);
        patchMessageReflect(assistantId, patch);

        if (patch.data && !patch.loading) {
          sessionPersistRef?.current?.markReflectUsed?.(
            deriveReflectNote(patch.data)
          );
        }
      };

      const timeoutId = setTimeout(() => {
        finish({
          loading: false,
          data: GREEN_FALLBACK,
          expanded: autoExpand,
          dismissed: false,
        });
      }, REFLECT_TIMEOUT_MS);

      try {
        const response = await fetch(REFLECT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            primary_response: primaryResponse,
          }),
        });

        if (!response.ok) throw new Error('Reflect failed');

        const data = await response.json();
        finish({
          loading: false,
          data,
          expanded: autoExpand,
          dismissed: false,
        });
      } catch {
        finish({
          loading: false,
          data: GREEN_FALLBACK,
          expanded: autoExpand,
          dismissed: false,
        });
      }
    },
    [patchMessageReflect, sessionPersistRef]
  );

  const sendMessage = useCallback(
    async (prompt, scenario = null) => {
      const trimmed = prompt?.trim();
      if (!trimmed || isLoading) return false;

      const priorAssistantCount = messages.filter(
        (m) => m.role === 'assistant' && m.content?.trim() && !m.isError
      ).length;
      const { reflectOpenCount } = getSessionInsightCounts();
      const isFollowUpAfterReflect =
        priorAssistantCount >= 1 && reflectOpenCount >= 1;

      if (isFollowUpAfterReflect) {
        incrementFollowUpActionCount();
        followUpQueuedRef.current = true;
      }

      const activeScenario = scenario || sessionScenarioRef.current;
      if (activeScenario) {
        sessionScenarioRef.current = activeScenario;
      }

      const chatPrompt = buildChatPrompt(trimmed, messages, sessionScenarioRef.current);

      lastRequestRef.current = {
        prompt: trimmed,
        scenario: sessionScenarioRef.current,
      };

      const scenarioMeta = sessionScenarioRef.current
        ? {
            scenarioId: sessionScenarioRef.current.id,
            expectedGaps: sessionScenarioRef.current.expectedGaps ?? [],
          }
        : {};

      const userMessage = {
        id: createId(),
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
        ...scenarioMeta,
      };

      const assistantId = createId();
      const assistantMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        userPrompt: trimmed,
        timestamp: new Date(),
        isStreaming: true,
        reflect: null,
        ...scenarioMeta,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      persistUserMessage(trimmed);
      setIsLoading(true);
      scrollToBottom();

      const history = [...messages, { ...userMessage, content: chatPrompt }]
        .slice(-6)
        .map(({ role, content }) => ({ role, content }));

      const controller = new AbortController();
      abortRef.current = controller;

      let streamedContent = '';
      let hadError = false;

      try {
        const response = await fetch(CHAT_API, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt: chatPrompt, history }),
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error('chat_failed');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let firstChunk = true;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          streamedContent += chunk;

          setMessages((prev) =>
            prev.map((m) => {
              if (m.id !== assistantId) return m;
              const updates = { content: m.content + chunk };
              if (firstChunk) {
                updates.isStreaming = false;
                firstChunk = false;
              }
              return { ...m, ...updates };
            })
          );
        }

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId ? { ...m, isStreaming: false } : m
          )
        );
      } catch (err) {
        if (err.name === 'AbortError') return true;

        hadError = true;
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: 'Something went wrong. Please try again.',
                  isError: true,
                  isRetryable: true,
                  isStreaming: false,
                  reflect: null,
                }
              : m
          )
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;

        if (!hadError && streamedContent.trim()) {
          persistAssistantMessage(streamedContent.trim());

          const autoExpand = Boolean(sessionScenarioRef.current?.id);
          const reflectPrompt =
            sessionScenarioRef.current?.prompt || trimmed;

          runReflectAnalysis(
            assistantId,
            reflectPrompt,
            streamedContent.trim(),
            autoExpand
          );

          if (followUpQueuedRef.current) {
            followUpQueuedRef.current = false;
            const assistantCount = [...messages, assistantMessage].filter(
              (m) => m.role === 'assistant' && m.content?.trim() && !m.isError
            ).length;
            const {
              reflectOpenCount,
              followUpActionCount,
              sessionCardShown,
            } = getSessionInsightCounts();

            if (
              reflectOpenCount >= 1 &&
              followUpActionCount >= 1 &&
              assistantCount >= 2 &&
              sessionCardShown === false
            ) {
              markSessionCardShown();
              setTimeout(() => setSessionInsightVisible(true), 800);
            }
          }
        }
      }

      return true;
    },
    [isLoading, messages, persistAssistantMessage, persistUserMessage, runReflectAnalysis, scrollToBottom]
  );

  const retryMessage = useCallback(
    async (assistantMessageId) => {
      const req = lastRequestRef.current;
      if (!req) return;

      setMessages((prev) => prev.filter((m) => m.id !== assistantMessageId));
      await sendMessage(req.prompt, req.scenario);
    },
    [sendMessage]
  );

  const toggleReflectExpanded = useCallback((messageId) => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id !== messageId || !m.reflect) return m;
        if (!m.reflect.expanded) {
          incrementReflectOpenCount();
        }
        return {
          ...m,
          reflect: { ...m.reflect, expanded: !m.reflect.expanded },
        };
      })
    );
  }, []);

  const dismissReflect = useCallback(
    (messageId) => {
      try {
        localStorage.setItem(getDismissedKey(messageId), 'true');
      } catch {
        /* ignore */
      }
      patchMessageReflect(messageId, { expanded: false, dismissed: true });
    },
    [patchMessageReflect]
  );

  const clearMessages = useCallback(() => {
    reflectGenerationRef.current += 1;
    if (abortRef.current) abortRef.current.abort();
    setMessages([]);
    setIsLoading(false);
    setSessionInsightVisible(false);
    resetSessionInsight();
    lastRequestRef.current = null;
    sessionScenarioRef.current = null;
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    restoreMessages,
    toggleReflectExpanded,
    dismissReflect,
    retryMessage,
    sessionInsightVisible,
    dismissSessionInsight: () => setSessionInsightVisible(false),
  };
}

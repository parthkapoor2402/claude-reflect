'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import {
  addMessage,
  createSession,
  deleteSession as deleteSessionStorage,
  getSessions,
  renameSession as renameSessionStorage,
  updateReflectData,
  type Message,
  type Session,
} from '../lib/sessions';

type SessionContextValue = {
  sessions: Session[];
  activeSessionId: string | null;
  activeSession: Session | null;
  startNewSession: () => void;
  loadSession: (id: string) => void;
  saveMessage: (role: Message['role'], content: string) => Message;
  markReflectUsed: (note: string) => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  reloadSessions: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const activeSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    setSessions(getSessions());
    setHydrated(true);
  }, []);

  const refreshSessions = useCallback(() => {
    setSessions(getSessions());
  }, []);

  useEffect(() => {
    activeSessionIdRef.current = activeSessionId;
  }, [activeSessionId]);

  const activeSession = useMemo(() => {
    if (!activeSessionId) return null;
    return sessions.find((session) => session.id === activeSessionId) ?? null;
  }, [sessions, activeSessionId]);

  const startNewSession = useCallback(() => {
    const session = createSession();
    activeSessionIdRef.current = session.id;
    refreshSessions();
    setActiveSessionId(session.id);
  }, [refreshSessions]);

  const loadSession = useCallback((id: string) => {
    activeSessionIdRef.current = id;
    setActiveSessionId(id);
  }, []);

  const saveMessage = useCallback(
    (role: Message['role'], content: string): Message => {
      let sessionId = activeSessionIdRef.current || activeSessionId;

      if (!sessionId) {
        const session = createSession();
        sessionId = session.id;
        activeSessionIdRef.current = sessionId;
        setActiveSessionId(sessionId);
      }

      const message: Message = {
        id: crypto.randomUUID(),
        role,
        content,
        timestamp: Date.now(),
      };

      addMessage(sessionId, message);
      refreshSessions();

      return message;
    },
    [activeSessionId, refreshSessions]
  );

  const markReflectUsed = useCallback(
    (note: string) => {
      const sessionId = activeSessionIdRef.current || activeSessionId;
      if (!sessionId) return;
      updateReflectData(sessionId, note);
      refreshSessions();
    },
    [activeSessionId, refreshSessions]
  );

  const deleteSession = useCallback(
    (id: string) => {
      deleteSessionStorage(id);
      refreshSessions();
      setActiveSessionId((current) => {
        const next = current === id ? null : current;
        activeSessionIdRef.current = next;
        return next;
      });
    },
    [refreshSessions]
  );

  const renameSession = useCallback(
    (id: string, newTitle: string) => {
      renameSessionStorage(id, newTitle);
      refreshSessions();
    },
    [refreshSessions]
  );

  const value = useMemo<SessionContextValue>(
    () => ({
      sessions: hydrated ? sessions : [],
      activeSessionId: hydrated ? activeSessionId : null,
      activeSession: hydrated ? activeSession : null,
      startNewSession,
      loadSession,
      saveMessage,
      markReflectUsed,
      deleteSession,
      renameSession,
      reloadSessions: refreshSessions,
    }),
    [
      hydrated,
      sessions,
      activeSessionId,
      activeSession,
      startNewSession,
      loadSession,
      saveMessage,
      markReflectUsed,
      deleteSession,
      renameSession,
      refreshSessions,
    ]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}

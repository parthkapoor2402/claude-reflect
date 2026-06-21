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
  setActiveSessionIdStorage,
  getActiveSessionId,
  recordReflectRunFromData,
  renameSession as renameSessionStorage,
  addressNextOpenInsight,
  updateSession,
  type Message,
  type ReflectApiData,
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
  recordReflectRun: (reflectData: ReflectApiData) => void;
  addressReflectInsight: () => void;
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
    const storedSessions = getSessions();
    setSessions(storedSessions);

    const storedActiveId = getActiveSessionId();
    const validActiveId =
      storedActiveId &&
      storedSessions.some((session) => session.id === storedActiveId)
        ? storedActiveId
        : storedSessions[0]?.id ?? null;

    activeSessionIdRef.current = validActiveId;
    setActiveSessionId(validActiveId);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (
        event.key !== 'cr_sessions' &&
        event.key !== 'cr_sessions_backup' &&
        event.key !== 'cr_active_session_id'
      ) {
        return;
      }

      const storedSessions = getSessions();
      setSessions(storedSessions);

      const storedActiveId = getActiveSessionId();
      if (
        storedActiveId &&
        storedSessions.some((session) => session.id === storedActiveId)
      ) {
        activeSessionIdRef.current = storedActiveId;
        setActiveSessionId(storedActiveId);
      }
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
    setActiveSessionIdStorage(session.id);
    refreshSessions();
    setActiveSessionId(session.id);
  }, [refreshSessions]);

  const loadSession = useCallback((id: string) => {
    activeSessionIdRef.current = id;
    setActiveSessionIdStorage(id);
    setActiveSessionId(id);
  }, []);

  const saveMessage = useCallback(
    (role: Message['role'], content: string): Message => {
      let sessionId = activeSessionIdRef.current || activeSessionId;

      if (!sessionId) {
        const session = createSession();
        sessionId = session.id;
        activeSessionIdRef.current = sessionId;
        setActiveSessionIdStorage(sessionId);
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
      const session = getSessions().find((s) => s.id === sessionId);
      if (!session) return;
      updateSession({
        ...session,
        reflectImprovementCount: session.reflectImprovementCount + 1,
        lastReflectNote: note,
      });
      refreshSessions();
    },
    [activeSessionId, refreshSessions]
  );

  const recordReflectRun = useCallback(
    (reflectData: ReflectApiData) => {
      const sessionId = activeSessionIdRef.current || activeSessionId;
      if (!sessionId) return;
      recordReflectRunFromData(sessionId, reflectData);
      refreshSessions();
    },
    [activeSessionId, refreshSessions]
  );

  const addressReflectInsight = useCallback(() => {
    const sessionId = activeSessionIdRef.current || activeSessionId;
    if (!sessionId) return;
    addressNextOpenInsight(sessionId);
    refreshSessions();
  }, [activeSessionId, refreshSessions]);

  const deleteSession = useCallback(
    (id: string) => {
      deleteSessionStorage(id);
      refreshSessions();
      setActiveSessionId((current) => {
        const next = current === id ? null : current;
        activeSessionIdRef.current = next;
        setActiveSessionIdStorage(next);
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
      recordReflectRun,
      addressReflectInsight,
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
      recordReflectRun,
      addressReflectInsight,
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

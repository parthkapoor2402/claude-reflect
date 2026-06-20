const STORAGE_KEY = 'cr_sessions';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  reflectSummary?: string;
};

export type Session = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  reflectImprovementCount: number;
  lastReflectNote?: string;
};

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function readRaw(): Session[] {
  if (!canUseStorage()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Session[]) : [];
  } catch {
    return [];
  }
}

function writeRaw(sessions: Session[]): void {
  if (!canUseStorage()) return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* ignore quota / privacy errors */
  }
}

function deriveTitle(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === 'user');
  if (!firstUser?.content) return 'New Session';

  const trimmed = firstUser.content.trim();
  if (!trimmed) return 'New Session';

  return trimmed.length <= 50 ? trimmed : trimmed.slice(0, 50).trim();
}

export function getSessions(): Session[] {
  return readRaw();
}

export function getSession(id: string): Session | null {
  return readRaw().find((session) => session.id === id) ?? null;
}

export function createSession(): Session {
  const now = Date.now();
  const session: Session = {
    id: crypto.randomUUID(),
    title: 'New Session',
    createdAt: now,
    updatedAt: now,
    messages: [],
    reflectImprovementCount: 0,
  };

  const sessions = readRaw();
  sessions.unshift(session);
  writeRaw(sessions);

  return session;
}

export function updateSession(session: Session): void {
  const sessions = readRaw();
  const index = sessions.findIndex((s) => s.id === session.id);
  const updated: Session = {
    ...session,
    updatedAt: Date.now(),
  };

  if (index >= 0) {
    sessions[index] = updated;
  } else {
    sessions.unshift(updated);
  }

  writeRaw(sessions);
}

export function deleteSession(id: string): void {
  writeRaw(readRaw().filter((session) => session.id !== id));
}

export function renameSession(id: string, newTitle: string): void {
  const session = getSession(id);
  if (!session) return;

  const trimmed = newTitle.trim();
  if (!trimmed) return;

  const title = trimmed.length <= 60 ? trimmed : trimmed.slice(0, 60).trim();
  updateSession({ ...session, title });
}

export function addMessage(sessionId: string, message: Message): void {
  const session = getSession(sessionId);
  if (!session) return;

  const updated: Session = {
    ...session,
    messages: [...session.messages, message],
    title: deriveTitle([...session.messages, message]),
    updatedAt: Date.now(),
  };

  updateSession(updated);
}

export function updateReflectData(sessionId: string, note: string): void {
  const session = getSession(sessionId);
  if (!session) return;

  updateSession({
    ...session,
    reflectImprovementCount: session.reflectImprovementCount + 1,
    lastReflectNote: note,
  });
}

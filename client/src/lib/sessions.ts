const STORAGE_KEY = 'cr_sessions';

export type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  reflectSummary?: string;
};

export type ReflectInsight = {
  id: string;
  category: 'correctness' | 'completeness' | 'reasoning' | 'uncertainty';
  summary: string;
  resolved: boolean;
};

export type ReflectSummary = {
  sessionId: string;
  taskLabel: string;
  reflectRunCount: number;
  totalInsights: number;
  addressedInsights: number;
  openInsights: ReflectInsight[];
  lastRunAt: string;
  categories: {
    correctnessFlags: number;
    completenessGaps: number;
    reasoningIssues: number;
    uncertaintyMarkers: number;
  };
};

export type Session = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
  reflectImprovementCount: number;
  lastReflectNote?: string;
  reflectSummary?: ReflectSummary;
};

export type ReflectApiData = {
  completeness_gaps?: string[];
  confidence_topology?: string[];
  reasoning_foundations?: string[];
  judgment_prompts?: string[];
  severity?: string;
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

function toInsightSummary(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).slice(0, 12);
  return words.join(' ');
}

function deriveTaskLabel(message: string): string {
  const words = message.trim().split(/\s+/).filter(Boolean).slice(0, 6);
  if (words.length === 0) return 'New session...';
  return `${words.join(' ')}...`;
}

function deriveReflectNote(reflectData: ReflectApiData): string {
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

function ensureReflectSummary(session: Session): ReflectSummary {
  if (session.reflectSummary) {
    return {
      ...session.reflectSummary,
      openInsights: [...session.reflectSummary.openInsights],
      categories: { ...session.reflectSummary.categories },
    };
  }

  return {
    sessionId: session.id,
    taskLabel:
      session.title && session.title !== 'New Session'
        ? session.title
        : 'New session...',
    reflectRunCount: 0,
    totalInsights: 0,
    addressedInsights: 0,
    openInsights: [],
    lastRunAt: new Date().toISOString(),
    categories: {
      correctnessFlags: 0,
      completenessGaps: 0,
      reasoningIssues: 0,
      uncertaintyMarkers: 0,
    },
  };
}

export function getSessions(): Session[] {
  return readRaw();
}

export function getSession(id: string): Session | null {
  return readRaw().find((session) => session.id === id) ?? null;
}

export function createSession(): Session {
  const now = Date.now();
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    title: 'New Session',
    createdAt: now,
    updatedAt: now,
    messages: [],
    reflectImprovementCount: 0,
    reflectSummary: {
      sessionId: id,
      taskLabel: 'New session...',
      reflectRunCount: 0,
      totalInsights: 0,
      addressedInsights: 0,
      openInsights: [],
      lastRunAt: new Date().toISOString(),
      categories: {
        correctnessFlags: 0,
        completenessGaps: 0,
        reasoningIssues: 0,
        uncertaintyMarkers: 0,
      },
    },
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

export function initSessionTaskLabel(sessionId: string, firstUserMessage: string): void {
  const session = getSession(sessionId);
  if (!session) return;

  const summary = ensureReflectSummary(session);
  summary.taskLabel = deriveTaskLabel(firstUserMessage);
  summary.lastRunAt = new Date().toISOString();

  updateSession({ ...session, reflectSummary: summary });
}

export function addMessage(sessionId: string, message: Message): void {
  const session = getSession(sessionId);
  if (!session) return;

  const isFirstUser =
    message.role === 'user' && !session.messages.some((m) => m.role === 'user');

  const updated: Session = {
    ...session,
    messages: [...session.messages, message],
    title: deriveTitle([...session.messages, message]),
    updatedAt: Date.now(),
  };

  if (isFirstUser) {
    const summary = ensureReflectSummary(updated);
    summary.taskLabel = deriveTaskLabel(message.content);
    summary.lastRunAt = new Date().toISOString();
    updated.reflectSummary = summary;
  }

  updateSession(updated);
}

export function recordReflectRunFromData(
  sessionId: string,
  reflectData: ReflectApiData
): void {
  const session = getSession(sessionId);
  if (!session) return;

  const summary = ensureReflectSummary(session);
  summary.reflectRunCount += 1;
  summary.lastRunAt = new Date().toISOString();

  const addItems = (
    items: string[] | undefined,
    category: ReflectInsight['category'],
    categoryKey: keyof ReflectSummary['categories']
  ) => {
    if (!Array.isArray(items)) return;

    for (const item of items) {
      if (!item?.trim()) continue;

      const insightSummary = toInsightSummary(item);
      const alreadyTracked = summary.openInsights.some(
        (insight) =>
          insight.summary === insightSummary && insight.category === category
      );
      if (alreadyTracked) continue;

      summary.openInsights.push({
        id: crypto.randomUUID(),
        category,
        summary: insightSummary,
        resolved: false,
      });
      summary.categories[categoryKey] += 1;
      summary.totalInsights += 1;
    }
  };

  addItems(reflectData.completeness_gaps, 'completeness', 'completenessGaps');
  addItems(reflectData.confidence_topology, 'uncertainty', 'uncertaintyMarkers');
  addItems(reflectData.reasoning_foundations, 'reasoning', 'reasoningIssues');

  const note = deriveReflectNote(reflectData);

  updateSession({
    ...session,
    reflectSummary: summary,
    reflectImprovementCount: session.reflectImprovementCount + 1,
    lastReflectNote: note,
  });
}

export function addressNextOpenInsight(sessionId: string): void {
  const session = getSession(sessionId);
  if (!session?.reflectSummary) return;

  const summary = ensureReflectSummary(session);
  const nextOpen = summary.openInsights.find((insight) => !insight.resolved);
  if (!nextOpen) return;

  summary.openInsights = summary.openInsights.map((insight) =>
    insight.id === nextOpen.id ? { ...insight, resolved: true } : insight
  );
  summary.addressedInsights += 1;

  updateSession({ ...session, reflectSummary: summary });
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
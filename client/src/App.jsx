import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Moon, Plus, Sun, X, Zap } from 'lucide-react';
import { useSession } from './context/SessionContext';
import { getReflectBadge } from './utils/sessionBanner';
import { toggleTheme } from './theme/themeStore';
import { useTheme } from './hooks/useTheme';
import ChatInterface from './components/ChatInterface';

function formatRelativeTime(ts) {
  const diff = Date.now() - ts;
  const seconds = Math.floor(diff / 1000);

  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const date = new Date(ts);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function SessionCard({
  session,
  isActive,
  activeSessionId,
  onSelect,
  onRename,
  onDelete,
  onStartNewSession,
  onNewChat,
}) {
  const [mode, setMode] = useState('default');
  const [renameValue, setRenameValue] = useState(session.title);
  const cardRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    setRenameValue(session.title);
  }, [session.title]);

  useEffect(() => {
    setMode('default');
  }, [activeSessionId]);

  useEffect(() => {
    if (mode !== 'renaming') return;
    inputRef.current?.focus();
    inputRef.current?.select();
  }, [mode]);

  useEffect(() => {
    if (mode === 'default') return;

    const handleOutsideClick = (event) => {
      if (cardRef.current && !cardRef.current.contains(event.target)) {
        if (mode === 'renaming') {
          const trimmed = renameValue.trim();
          onRename(session.id, trimmed || session.title);
        }
        setMode('default');
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [mode, onRename, renameValue, session.id, session.title]);

  const saveRename = () => {
    const trimmed = renameValue.trim();
    onRename(session.id, trimmed || session.title);
    setMode('default');
  };

  const handleCardClick = () => {
    if (mode !== 'default') return;
    onSelect(session.id);
  };

  const handleDeleteYes = (event) => {
    event.stopPropagation();
    const wasActive = session.id === activeSessionId;
    onDelete(session.id);
    if (wasActive) {
      onStartNewSession();
      onNewChat?.();
    }
    setMode('default');
  };

  const cardClassName = `group w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800 ${
    isActive ? 'border-l-2 border-orange-500 bg-zinc-800' : 'border-l-2 border-transparent'
  }`;

  if (mode === 'confirmDelete') {
    return (
      <div ref={cardRef} className={cardClassName}>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-300">Delete?</span>
          <button
            type="button"
            onClick={handleDeleteYes}
            className="rounded px-2 py-0.5 text-xs font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setMode('default');
            }}
            className="rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
          >
            No
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className={cardClassName}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(event) => {
          if (mode !== 'default') return;
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onSelect(session.id);
          }
        }}
        className="w-full cursor-pointer text-left"
      >
        {mode === 'renaming' ? (
          <input
            ref={inputRef}
            type="text"
            value={renameValue}
            maxLength={60}
            onChange={(event) => setRenameValue(event.target.value)}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              event.stopPropagation();
              if (event.key === 'Enter') {
                event.preventDefault();
                saveRename();
              } else if (event.key === 'Escape') {
                event.preventDefault();
                setRenameValue(session.title);
                setMode('default');
              }
            }}
            onBlur={saveRename}
            className="w-full rounded border border-orange-500/50 bg-zinc-700 px-2 py-0.5 text-sm text-zinc-100 outline-none focus:border-orange-500"
          />
        ) : (
          <>
            <div className="flex items-start gap-1">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-zinc-100">{session.title}</div>
                <div className="text-xs text-zinc-500">{formatRelativeTime(session.updatedAt)}</div>
                {(() => {
                  const badge = getReflectBadge(session);
                  if (!badge) return null;

                  const badgeClass =
                    badge.tone === 'clear'
                      ? 'bg-green-500/10 text-green-400'
                      : 'bg-orange-500/10 text-orange-400';

                  return (
                    <span
                      className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${badgeClass}`}
                    >
                      <span aria-hidden="true">✦</span>
                      {badge.text}
                    </span>
                  );
                })()}
                {session.lastReflectNote && (
                  <p className="mt-1 truncate text-xs italic text-zinc-400">
                    {session.lastReflectNote}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  aria-label="Rename session"
                  onClick={(event) => {
                    event.stopPropagation();
                    setRenameValue(session.title);
                    setMode('renaming');
                  }}
                  className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="Delete session"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMode('confirmDelete');
                  }}
                  className="rounded p-1 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-100"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                    <path d="M10 11v6" />
                    <path d="M14 11v6" />
                    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Sidebar({ onClose, onNewChat, onSessionSelect }) {
  const theme = useTheme();
  const { sessions, activeSessionId, startNewSession, renameSession, deleteSession } =
    useSession();

  const sortedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.updatedAt - a.updatedAt),
    [sessions]
  );

  const handleNewChat = () => {
    startNewSession();
    onNewChat();
  };

  return (
    <aside className="theme-transition flex h-full w-[260px] shrink-0 flex-col border-r border-reflect-border bg-reflect-bg">
      <div className="flex items-center justify-between gap-2 p-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-reflect-accent text-sm font-bold text-white">
            R
          </div>
          <span className="truncate font-semibold text-reflect-text">
            Claude Reflect
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-reflect p-2 text-reflect-muted transition-all duration-300 hover:bg-reflect-card hover:text-reflect-text"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-reflect p-2 text-reflect-muted transition-all duration-reflect hover:text-reflect-text md:hidden"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="px-4">
        <button
          type="button"
          onClick={handleNewChat}
          className="theme-transition flex min-h-[44px] w-full items-center justify-center gap-2 rounded-reflect border border-reflect-accent bg-transparent px-4 py-2.5 text-sm font-medium text-reflect-accent transition-all duration-reflect ease-reflect hover:bg-reflect-accent/10 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="px-4 pb-2 pt-3">
        <p className="text-xs uppercase tracking-widest text-zinc-500">Recent Sessions</p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        {sortedSessions.length === 0 ? (
          <p className="px-3 py-4 text-center text-xs text-zinc-500">
            Start a conversation to see your history here
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {sortedSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                isActive={session.id === activeSessionId}
                activeSessionId={activeSessionId}
                onSelect={onSessionSelect}
                onRename={renameSession}
                onDelete={deleteSession}
                onStartNewSession={startNewSession}
                onNewChat={onNewChat}
              />
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3 border-t border-reflect-border p-4">
        <div className="flex items-center justify-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-reflect-muted" />
          <span className="text-xs text-reflect-muted">Powered by Groq</span>
        </div>
      </div>
    </aside>
  );
}

export default function App() {
  useTheme();
  const { loadSession, activeSessionId } = useSession();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);
  const [sessionSwitchToken, setSessionSwitchToken] = useState(0);

  const handleNewChat = () => {
    setChatKey((k) => k + 1);
    setSidebarOpen(false);
  };

  const handleSessionSelect = useCallback(
    (sessionId) => {
      if (sessionId === activeSessionId) return;
      loadSession(sessionId);
      setSessionSwitchToken((token) => token + 1);
      setSidebarOpen(false);
    },
    [activeSessionId, loadSession]
  );

  return (
    <div className="theme-transition flex h-full bg-reflect-bg">
      <div className="hidden md:block">
        <Sidebar onNewChat={handleNewChat} onSessionSelect={handleSessionSelect} />
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full shadow-xl transition-transform duration-300">
            <Sidebar
              onClose={() => setSidebarOpen(false)}
              onNewChat={handleNewChat}
              onSessionSelect={handleSessionSelect}
            />
          </div>
        </div>
      )}

      <main className="relative min-w-0 flex-1">
        <ChatInterface
          key={chatKey}
          sessionSwitchToken={sessionSwitchToken}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
}

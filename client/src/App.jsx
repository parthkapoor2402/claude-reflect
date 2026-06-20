import { useMemo, useState } from 'react';
import { Moon, Plus, Sun, X, Zap } from 'lucide-react';
import { useSession } from './context/SessionContext';
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

function SessionCard({ session, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(session.id)}
      className={`w-full rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-zinc-800 ${
        isActive ? 'border-l-2 border-orange-500 bg-zinc-800' : 'border-l-2 border-transparent'
      }`}
    >
      <div className="truncate text-sm font-medium text-zinc-100">{session.title}</div>
      <div className="text-xs text-zinc-500">{formatRelativeTime(session.updatedAt)}</div>
      {session.reflectImprovementCount > 0 && (
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-orange-500/10 px-2 py-0.5 text-xs text-orange-400">
          <span aria-hidden="true">✦</span>
          {session.reflectImprovementCount} Reflect insights
        </span>
      )}
      {session.lastReflectNote && (
        <p className="mt-1 truncate text-xs italic text-zinc-400">{session.lastReflectNote}</p>
      )}
    </button>
  );
}

function Sidebar({ onClose, onNewChat }) {
  const theme = useTheme();
  const { sessions, activeSessionId, startNewSession, loadSession } = useSession();

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
                onSelect={loadSession}
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatKey, setChatKey] = useState(0);

  const handleNewChat = () => {
    setChatKey((k) => k + 1);
    setSidebarOpen(false);
  };

  return (
    <div className="theme-transition flex h-full bg-reflect-bg">
      <div className="hidden md:block">
        <Sidebar onNewChat={handleNewChat} />
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
            />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <ChatInterface
          key={chatKey}
          onMenuClick={() => setSidebarOpen(true)}
        />
      </main>
    </div>
  );
}

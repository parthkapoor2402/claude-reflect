import { useState } from 'react';
import { Moon, Plus, Sun, X, Zap } from 'lucide-react';
import { toggleTheme } from './theme/themeStore';
import { useTheme } from './hooks/useTheme';
import ChatInterface from './components/ChatInterface';

function Sidebar({ onClose, onNewChat }) {
  const theme = useTheme();

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
          onClick={onNewChat}
          className="theme-transition flex min-h-[44px] w-full items-center justify-center gap-2 rounded-reflect border border-reflect-accent bg-transparent px-4 py-2.5 text-sm font-medium text-reflect-accent transition-all duration-reflect ease-reflect hover:bg-reflect-accent/10 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4">
        <p className="text-center text-sm text-reflect-muted">
          No conversations yet
        </p>
      </div>

      <div className="space-y-3 border-t border-reflect-border p-4">
        <div className="flex items-center justify-center gap-1.5">
          <Zap className="h-3.5 w-3.5 text-reflect-muted" />
          <span className="text-xs text-reflect-muted">Powered by Groq</span>
        </div>
        <p className="text-center text-[10px] leading-relaxed text-reflect-muted/80">
          Claude Reflect — PM Case Study
          <br />
          Built for NextLeap Fellowship 2025
          <br />
          Survey: N=25 | Hypothesis: Calibration Gap
        </p>
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

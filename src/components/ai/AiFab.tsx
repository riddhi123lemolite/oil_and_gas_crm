import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Maximize2 } from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useAiStore } from '@/stores/aiStore';
import { ChatPanel } from './ChatPanel';
import { cn } from '@/lib/utils';

/**
 * Floating AI launcher, bottom-right. Clears the mobile bottom nav so it never
 * overlaps navigation.
 */
export function AiFab() {
  const [open, setOpen] = useState(false);
  const init = useAiStore((s) => s.init);
  const notifications = useDataStore((s) => s.notifications);

  useEffect(() => {
    init();
  }, [init]);

  const badge = notifications.filter((n) => !n.read).length;

  return (
    <>
      {open && (
        <div
          role="dialog"
          aria-label="CRM Assistant"
          className="no-print fixed bottom-24 left-4 right-4 z-40 flex h-[540px] max-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-2xl border border-line bg-base shadow-pop animate-slide-up sm:left-auto sm:w-[370px] lg:right-6"
        >
          <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 text-white">
                <Sparkles className="size-4" />
              </span>
              <span className="font-display text-sm font-semibold">CRM Assistant</span>
            </div>
            <div className="flex items-center gap-0.5">
              <Link to="/assistant" onClick={() => setOpen(false)} className="rounded p-1.5 text-content-muted hover:bg-muted hover:text-content" aria-label="Open full page">
                <Maximize2 className="size-4" />
              </Link>
              <button onClick={() => setOpen(false)} className="rounded p-1.5 text-content-muted hover:bg-muted hover:text-content" aria-label="Close assistant">
                <X className="size-4" />
              </button>
            </div>
          </header>
          <ChatPanel variant="compact" onNavigateAway={() => setOpen(false)} />
        </div>
      )}

      <div className="group no-print fixed bottom-20 right-4 z-50 lg:bottom-6 lg:right-6">
        {!open && (
          <span className="pointer-events-none absolute bottom-1/2 right-full mr-3 hidden translate-y-1/2 whitespace-nowrap rounded-md bg-brand-primary px-2.5 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100 md:block">
            Ask CRM AI
          </span>
        )}
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close CRM Assistant' : 'Open CRM Assistant'}
          aria-expanded={open}
          className={cn(
            'relative flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-cyan-400 text-white shadow-lg transition-transform duration-200 hover:scale-105 active:scale-95 focus-ring',
            !open && 'ai-fab',
          )}
        >
          {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
          {!open && badge > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-[18px] items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white ring-2 ring-base">
              {badge > 99 ? '99+' : badge}
            </span>
          )}
        </button>
      </div>
    </>
  );
}

import { useEffect, useState } from 'react';
import { Plus, MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { useAiStore } from '@/stores/aiStore';
import { ChatPanel } from '@/components/ai/ChatPanel';
import { cn } from '@/lib/utils';

export default function Assistant() {
  const { conversations, activeId, init, newConversation, setActive, rename, remove } = useAiStore();

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 sm:-m-5 lg:-m-6">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="p-3">
          <button
            onClick={() => newConversation()}
            className="flex w-full items-center gap-2 rounded-md bg-brand-secondary px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-secondary/90"
          >
            <Plus className="size-4" /> New conversation
          </button>
        </div>
        <div className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
          {conversations.length === 0 && <p className="px-2 py-4 text-xs text-content-muted">No conversations yet.</p>}
          {conversations.map((c) => (
            <ConversationRow key={c.id} title={c.title} active={c.id === activeId} onClick={() => setActive(c.id)} onRename={(t) => rename(c.id, t)} onDelete={() => remove(c.id)} />
          ))}
        </div>
      </aside>

      <ChatPanel />
    </div>
  );
}

function ConversationRow({ title, active, onClick, onRename, onDelete }: { title: string; active: boolean; onClick: () => void; onRename: (t: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(title);
  if (editing) {
    return (
      <input
        autoFocus
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onBlur={() => { onRename(val); setEditing(false); }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onRename(val); setEditing(false); } }}
        className="input-base h-8 w-full text-sm"
      />
    );
  }
  return (
    <div className={cn('group flex items-center gap-2 rounded-md px-2.5 py-2 text-sm transition-colors', active ? 'bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary' : 'text-content-secondary hover:bg-muted')}>
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-2 text-left">
        <MessageSquare className="size-4 shrink-0" />
        <span className="truncate">{title}</span>
      </button>
      <button onClick={() => { setVal(title); setEditing(true); }} className="opacity-0 transition-opacity hover:text-content group-hover:opacity-100" aria-label="Rename"><Pencil className="size-3.5" /></button>
      <button onClick={onDelete} className="opacity-0 transition-opacity hover:text-danger group-hover:opacity-100" aria-label="Delete"><Trash2 className="size-3.5" /></button>
    </div>
  );
}

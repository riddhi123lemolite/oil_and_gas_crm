import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Plus, Send, Square, Copy, RefreshCw, Trash2, Pencil, MessageSquare, ArrowRight, Check,
} from 'lucide-react';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { useAuth } from '@/hooks/useAuth';
import { useLiveMarket } from '@/hooks/useLiveMarket';
import { useAiStore, type AiMessage } from '@/stores/aiStore';
import { ruleEngine, suggestedPrompts, type AiBlock, type AiContext, type AiReply } from '@/lib/ai/assistant';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

export default function Assistant() {
  const { role, can } = useAuth();
  const currentUser = useAuthStore((s) => s.currentUser);
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const dispatches = useDataStore((s) => s.dispatches);
  const orders = useDataStore((s) => s.orders);
  const payments = useDataStore((s) => s.payments);
  const notifications = useDataStore((s) => s.notifications);
  const items = useDataStore((s) => s.items);
  const { oil, fuel } = useLiveMarket();

  const { conversations, activeId, init, newConversation, setActive, addMessage, rename, remove } = useAiStore();
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    init();
  }, [init]);

  const active = conversations.find((c) => c.id === activeId);

  const ctx: AiContext = useMemo(() => {
    const isC = role === 'CUSTOMER';
    const me = customers[0];
    const scope = <T extends { customerId: string }>(arr: T[]) => (isC && me ? arr.filter((x) => x.customerId === me.id) : arr);
    return {
      role,
      userName: currentUser?.name ?? '',
      me: isC ? me : undefined,
      customers: isC && me ? [me] : customers,
      invoices: scope(invoices),
      dispatches: scope(dispatches),
      orders: scope(orders),
      payments: scope(payments),
      notifications,
      items,
      oil,
      fuel,
      canErp: can('erp', 'view'),
    };
  }, [role, currentUser, customers, invoices, dispatches, orders, payments, notifications, items, oil, fuel, can]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [active?.messages.length, streamingId]);

  async function send(prompt: string) {
    const q = prompt.trim();
    if (!q) return;
    let convId = activeId;
    if (!convId) convId = newConversation();
    addMessage(convId, { id: generateId('m'), role: 'user', text: q, createdAt: new Date().toISOString() });
    setInput('');
    const reply = await ruleEngine.ask(q, ctx);
    const msg: AiMessage = { id: generateId('m'), role: 'assistant', reply, createdAt: new Date().toISOString() };
    addMessage(convId, msg);
    setStreamingId(msg.id);
  }

  function regenerate() {
    if (!active) return;
    const lastUser = [...active.messages].reverse().find((m) => m.role === 'user');
    if (lastUser?.text) void send(lastUser.text);
  }

  const prompts = suggestedPrompts(role);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 sm:-m-5 lg:-m-6">
      {/* Conversation list */}
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

      {/* Chat */}
      <div className="flex min-w-0 flex-1 flex-col bg-base">
        <div ref={scrollRef} className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6">
            {!active || active.messages.length === 0 ? (
              <div className="flex flex-col items-center py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-xl bg-brand-secondary/12 text-brand-secondary">
                  <Sparkles className="size-6" />
                </div>
                <h1 className="mt-4 font-display text-2xl font-bold">CRM Assistant</h1>
                <p className="mt-1 max-w-md text-sm text-content-muted">
                  Ask about your orders, invoices, payments, live prices and more. Answers come from your live CRM data and respect your permissions.
                </p>
                <div className="mt-6 grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
                  {prompts.map((p) => (
                    <button key={p} onClick={() => send(p)} className="rounded-lg border border-line bg-surface px-3 py-2.5 text-left text-sm text-content-secondary transition-colors hover:border-brand-secondary/40 hover:bg-muted">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {active.messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} userName={currentUser?.name ?? 'You'} streaming={m.id === streamingId} onStreamDone={() => setStreamingId(null)} />
                ))}
                {active.messages[active.messages.length - 1]?.role === 'assistant' && !streamingId && (
                  <div className="flex justify-center">
                    <button onClick={regenerate} className="inline-flex items-center gap-1.5 rounded-md border border-line px-3 py-1.5 text-xs font-medium text-content-secondary hover:bg-muted">
                      <RefreshCw className="size-3.5" /> Regenerate
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <div className="border-t border-line bg-surface p-3">
          <form
            onSubmit={(e: FormEvent) => {
              e.preventDefault();
              if (streamingId) return;
              void send(input);
            }}
            className="mx-auto flex max-w-3xl items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (!streamingId) void send(input);
                }
              }}
              rows={1}
              placeholder="Ask the CRM assistant…"
              className="input-base max-h-40 min-h-[2.5rem] flex-1 resize-none py-2"
            />
            {streamingId ? (
              <button type="button" onClick={() => setStreamingId(null)} className="flex size-10 shrink-0 items-center justify-center rounded-md border border-line text-content-secondary hover:bg-muted" aria-label="Stop">
                <Square className="size-4 fill-current" />
              </button>
            ) : (
              <button type="submit" disabled={!input.trim()} className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-secondary text-white transition-colors hover:bg-brand-secondary/90 disabled:opacity-40" aria-label="Send">
                <Send className="size-4" />
              </button>
            )}
          </form>
          <p className="mx-auto mt-1.5 max-w-3xl text-center text-[11px] text-content-muted">
            Grounded in your CRM data · responses respect your role &amp; permissions.
          </p>
        </div>
      </div>
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

function MessageBubble({ msg, userName, streaming, onStreamDone }: { msg: AiMessage; userName: string; streaming: boolean; onStreamDone: () => void }) {
  if (msg.role === 'user') {
    return (
      <div className="flex items-start justify-end gap-3">
        <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-brand-primary px-4 py-2.5 text-sm text-white">{msg.text}</div>
        <EntityAvatar name={userName} size="sm" />
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-secondary/12 text-brand-secondary">
        <Sparkles className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        {msg.reply && <AssistantReply reply={msg.reply} live={streaming} onDone={onStreamDone} />}
      </div>
    </div>
  );
}

function AssistantReply({ reply, live, onDone }: { reply: AiReply; live: boolean; onDone: () => void }) {
  const navigate = useNavigate();
  const lead = reply.blocks.filter((b): b is Extract<AiBlock, { kind: 'text' }> => b.kind === 'text').map((b) => b.text).join('\n\n');
  const [shown, setShown] = useState(live ? 0 : lead.length);
  const [done, setDone] = useState(!live);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!live) { setShown(lead.length); setDone(true); return; }
    setShown(0); setDone(false);
    const step = Math.max(2, Math.round(lead.length / 60));
    let i = 0;
    const id = setInterval(() => {
      i += step;
      if (i >= lead.length) { clearInterval(id); setShown(lead.length); setDone(true); onDone(); }
      else setShown(i);
    }, 22);
    return () => clearInterval(id);
  }, [live, lead, onDone]);

  const copy = () => {
    navigator.clipboard.writeText(replyToText(reply)).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  };

  if (!done) {
    return (
      <div className="text-sm leading-relaxed text-content">
        {renderInline(lead.slice(0, shown))}
        <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-brand-secondary align-middle" />
      </div>
    );
  }

  return (
    <div className="group space-y-2.5 text-sm text-content">
      {reply.blocks.map((b, i) => <Block key={i} block={b} />)}
      {reply.action && (
        <button onClick={() => navigate(reply.action!.to)} className="inline-flex items-center gap-1.5 rounded-md border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-1.5 text-xs font-semibold text-brand-secondary transition-colors hover:bg-brand-secondary/15">
          {reply.action.label} <ArrowRight className="size-3.5" />
        </button>
      )}
      <div className="flex items-center gap-1 pt-0.5 opacity-0 transition-opacity group-hover:opacity-100">
        <button onClick={copy} className="inline-flex items-center gap-1 rounded p-1 text-xs text-content-muted hover:bg-muted hover:text-content">
          {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />} {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

function Block({ block }: { block: AiBlock }) {
  if (block.kind === 'text') return <p className="leading-relaxed">{renderInline(block.text)}</p>;
  if (block.kind === 'list') {
    return (
      <ul className="ml-1 space-y-1">
        {block.items.map((it, i) => (
          <li key={i} className="flex gap-2"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-brand-secondary" /><span>{renderInline(it)}</span></li>
        ))}
      </ul>
    );
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line bg-muted text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
            {block.columns.map((c) => <th key={c} className="px-3 py-2">{c}</th>)}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {block.rows.map((r, i) => (
            <tr key={i}>{r.map((cell, j) => <td key={j} className="px-3 py-2 num text-content-secondary">{cell}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Minimal inline markdown: **bold**. */
function renderInline(t: string): ReactNode {
  return t.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i} className="font-semibold text-content">{part.slice(2, -2)}</strong> : <span key={i}>{part}</span>,
  );
}

function replyToText(reply: AiReply): string {
  return reply.blocks
    .map((b) => {
      if (b.kind === 'text') return b.text.replace(/\*\*/g, '');
      if (b.kind === 'list') return b.items.map((i) => `• ${i.replace(/\*\*/g, '')}`).join('\n');
      return [b.columns.join('\t'), ...b.rows.map((r) => r.join('\t'))].join('\n');
    })
    .join('\n\n');
}

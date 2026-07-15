import { useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Hash, Check, CheckCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { useLookups } from '@/hooks/useLookups';
import { formatTime } from '@/lib/format';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

const REPLIES = [
  'Got it, thanks!',
  'Sure, I will check and update you.',
  'Noted. Will coordinate with the dispatch team.',
  'Can you share the proposal number?',
  'Done. Please confirm at your end.',
  'On it — give me a few minutes.',
];

export default function Chat() {
  const channels = useDataStore((s) => s.channels);
  const messages = useDataStore((s) => s.messages);
  const addMessage = useDataStore((s) => s.add);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { userName } = useLookups();

  const [activeId, setActiveId] = useState(channels[0]?.id ?? '');
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeChannel = channels.find((c) => c.id === activeId);
  const channelMessages = messages.filter((m) => m.channelId === activeId);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [channelMessages.length, typing]);

  const send = () => {
    if (!draft.trim() || !currentUser || !activeChannel) return;
    const msg: Message = {
      id: generateId('msg'),
      channelId: activeId,
      senderId: currentUser.id,
      body: draft.trim(),
      createdAt: new Date().toISOString(),
      delivered: true,
    };
    addMessage('messages', msg);
    setDraft('');

    // Simulate the other side typing, then replying.
    const otherMember = activeChannel.memberIds.find(
      (m) => m !== currentUser.id,
    );
    if (otherMember) {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        addMessage('messages', {
          id: generateId('msg'),
          channelId: activeId,
          senderId: otherMember,
          body: REPLIES[Math.floor(Math.random() * REPLIES.length)] ?? 'OK',
          createdAt: new Date().toISOString(),
          delivered: true,
        });
      }, 1800);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Team Chat"
        description="Internal messaging across your sales & dispatch teams"
        icon={<MessageSquare />}
      />

      <Card className="flex h-[calc(100vh-220px)] min-h-[440px] overflow-hidden">
        {/* Channels */}
        <div className="w-60 shrink-0 border-r border-line">
          <div className="border-b border-line px-3 py-2.5 text-xs font-semibold uppercase tracking-wide text-content-muted">
            Channels & DMs
          </div>
          <div className="overflow-y-auto">
            {channels.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveId(ch.id)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition-colors',
                  ch.id === activeId
                    ? 'bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary'
                    : 'text-content-secondary hover:bg-muted',
                )}
              >
                {ch.type === 'GROUP' ? (
                  <Hash className="size-4 shrink-0" />
                ) : (
                  <EntityAvatar name={ch.name} size="xs" />
                )}
                <span className="truncate">{ch.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
            {activeChannel?.type === 'GROUP' ? (
              <Hash className="size-4 text-content-muted" />
            ) : (
              <EntityAvatar name={activeChannel?.name ?? '?'} size="xs" />
            )}
            <span className="font-display text-sm font-semibold text-content">
              {activeChannel?.name}
            </span>
            <span className="text-xs text-content-muted">
              {activeChannel?.memberIds.length} members
            </span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
            {channelMessages.map((m) => {
              const mine = m.senderId === currentUser?.id;
              return (
                <div
                  key={m.id}
                  className={cn('flex gap-2', mine && 'flex-row-reverse')}
                >
                  {!mine && (
                    <EntityAvatar name={userName(m.senderId)} size="xs" />
                  )}
                  <div className={cn('max-w-[70%]', mine && 'items-end')}>
                    {!mine && (
                      <div className="mb-0.5 text-[11px] font-medium text-content-muted">
                        {userName(m.senderId)}
                      </div>
                    )}
                    <div
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-sm',
                        mine
                          ? 'bg-brand-primary text-white'
                          : 'bg-muted text-content',
                      )}
                    >
                      {m.body}
                    </div>
                    <div
                      className={cn(
                        'mt-0.5 flex items-center gap-1 text-[10px] text-content-muted',
                        mine && 'justify-end',
                      )}
                    >
                      {formatTime(m.createdAt)}
                      {mine &&
                        (m.delivered ? (
                          <CheckCheck className="size-3 text-info" />
                        ) : (
                          <Check className="size-3" />
                        ))}
                    </div>
                  </div>
                </div>
              );
            })}
            {typing && (
              <div className="flex gap-2">
                <div className="rounded-lg bg-muted px-3 py-2 text-sm text-content-muted">
                  <span className="inline-flex gap-1">
                    <span className="size-1.5 animate-bounce rounded-full bg-content-muted" />
                    <span className="size-1.5 animate-bounce rounded-full bg-content-muted [animation-delay:120ms]" />
                    <span className="size-1.5 animate-bounce rounded-full bg-content-muted [animation-delay:240ms]" />
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 border-t border-line p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
              placeholder={`Message ${activeChannel?.name ?? ''}…`}
              className="input-base flex-1"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="flex size-9 items-center justify-center rounded-md bg-brand-primary text-white transition-colors hover:bg-brand-hover disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}

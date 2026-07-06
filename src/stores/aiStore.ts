import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import type { AiReply } from '@/lib/ai/assistant';

export interface AiMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  reply?: AiReply;
  createdAt: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: AiMessage[];
  createdAt: string;
}

const KEY = 'oilgas-crm:ai-conversations';

interface AiState {
  conversations: Conversation[];
  activeId: string | null;
  init: () => void;
  newConversation: () => string;
  setActive: (id: string) => void;
  addMessage: (convId: string, msg: AiMessage) => void;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
}

function persist(conversations: Conversation[]) {
  writeStorage(KEY, conversations);
}

export const useAiStore = create<AiState>((set, get) => ({
  conversations: [],
  activeId: null,

  init: () => {
    const conversations = readStorage<Conversation[]>(KEY, []);
    set({ conversations, activeId: conversations[0]?.id ?? null });
  },

  newConversation: () => {
    const conv: Conversation = { id: generateId('conv'), title: 'New conversation', messages: [], createdAt: new Date().toISOString() };
    const conversations = [conv, ...get().conversations];
    persist(conversations);
    set({ conversations, activeId: conv.id });
    return conv.id;
  },

  setActive: (id) => set({ activeId: id }),

  addMessage: (convId, msg) => {
    const conversations = get().conversations.map((c) => {
      if (c.id !== convId) return c;
      // Title the conversation from the first user message.
      const title = c.messages.length === 0 && msg.role === 'user' && msg.text ? msg.text.slice(0, 40) : c.title;
      return { ...c, title, messages: [...c.messages, msg] };
    });
    persist(conversations);
    set({ conversations });
  },

  rename: (id, title) => {
    const conversations = get().conversations.map((c) => (c.id === id ? { ...c, title: title.trim() || c.title } : c));
    persist(conversations);
    set({ conversations });
  },

  remove: (id) => {
    const conversations = get().conversations.filter((c) => c.id !== id);
    persist(conversations);
    set({ conversations, activeId: get().activeId === id ? (conversations[0]?.id ?? null) : get().activeId });
  },
}));

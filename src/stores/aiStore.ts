import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { AiReply, ConvContext } from '@/lib/ai/assistant';

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
  /** Structured slot memory for this thread (topic/product/period/…). */
  context?: ConvContext;
}

const BASE_KEY = 'oilgas-crm:ai-conversations';
// Conversations (and, alongside, memory) are namespaced per signed-in user so
// history stays correct across logins.
const keyFor = (userId?: string | null) => (userId ? `${BASE_KEY}:${userId}` : BASE_KEY);

interface AiState {
  conversations: Conversation[];
  activeId: string | null;
  userKey: string;
  init: () => void;
  newConversation: () => string;
  setActive: (id: string) => void;
  addMessage: (convId: string, msg: AiMessage) => void;
  setContext: (convId: string, context: ConvContext) => void;
  rename: (id: string, title: string) => void;
  remove: (id: string) => void;
}

export const useAiStore = create<AiState>((set, get) => ({
  conversations: [],
  activeId: null,
  userKey: BASE_KEY,

  init: () => {
    const userKey = keyFor(useAuthStore.getState().currentUser?.id);
    const conversations = readStorage<Conversation[]>(userKey, []);
    set({ userKey, conversations, activeId: conversations[0]?.id ?? null });
  },

  newConversation: () => {
    const conv: Conversation = { id: generateId('conv'), title: 'New conversation', messages: [], createdAt: new Date().toISOString() };
    const conversations = [conv, ...get().conversations];
    writeStorage(get().userKey, conversations);
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
    writeStorage(get().userKey, conversations);
    set({ conversations });
  },

  setContext: (convId, context) => {
    const conversations = get().conversations.map((c) => (c.id === convId ? { ...c, context } : c));
    writeStorage(get().userKey, conversations);
    set({ conversations });
  },

  rename: (id, title) => {
    const conversations = get().conversations.map((c) => (c.id === id ? { ...c, title: title.trim() || c.title } : c));
    writeStorage(get().userKey, conversations);
    set({ conversations });
  },

  remove: (id) => {
    const conversations = get().conversations.filter((c) => c.id !== id);
    writeStorage(get().userKey, conversations);
    set({ conversations, activeId: get().activeId === id ? (conversations[0]?.id ?? null) : get().activeId });
  },
}));

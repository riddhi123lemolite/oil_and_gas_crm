import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { DEMO_MODE } from '@/lib/config';
import { readStorage, writeStorage, removeStorage } from '@/lib/storage';
import {
  findUserByEmail,
  countUsers,
  upsertRow,
  type Identifiable,
} from '@/lib/db';
import { ensureSeeded } from '@/lib/seedLoader';
import { generateId } from '@/lib/utils';
import type { Role, User } from '@/types';

interface AuthState {
  currentUser: User | null;
  initialized: boolean;
  init: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ ok: boolean; error?: string; needsConfirmation?: boolean }>;
  logout: () => Promise<void>;
}

// Remembers who is "signed in" during a demo session.
const DEMO_SESSION_KEY = 'oilgas-crm:demo:session';

/**
 * Find the profile row for a signed-in email, creating one if it doesn't exist.
 * The very first profile in an empty workspace becomes the ADMIN.
 */
async function ensureProfile(
  email: string,
  name: string,
  preferAdmin = false,
): Promise<User> {
  const existing = await findUserByEmail<User>(email);
  if (existing) return existing;

  const count = await countUsers();
  const role: Role = preferAdmin || count === 0 ? 'ADMIN' : 'SALES_EXECUTIVE';
  const profile: User = {
    id: generateId('user'),
    userCode: `U${String(count + 1).padStart(3, '0')}`,
    name: name || email.split('@')[0] || 'Team member',
    email,
    phone: '',
    password: '',
    role,
    city: '',
    state: '',
    active: true,
    createdAt: new Date().toISOString(),
  };
  await upsertRow('users', profile as unknown as Identifiable);
  return profile;
}

let listenerBound = false;

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  initialized: false,

  init: async () => {
    // ---- Demo mode: restore a previous demo session if there is one ----
    if (DEMO_MODE) {
      const savedEmail = readStorage<string | null>(DEMO_SESSION_KEY, null);
      if (savedEmail) {
        await ensureSeeded();
        const profile = await ensureProfile(savedEmail, savedEmail.split('@')[0] ?? 'Demo User', true);
        set({ currentUser: profile, initialized: true });
      } else {
        set({ currentUser: null, initialized: true });
      }
      return;
    }

    // ---- Normal mode: use the Supabase session ----
    if (!listenerBound) {
      listenerBound = true;
      supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') set({ currentUser: null });
      });
    }

    const { data } = await supabase.auth.getSession();
    const sessionUser = data.session?.user;
    if (sessionUser?.email) {
      const firstEver = (await countUsers()) === 0;
      await ensureSeeded();
      const name = (sessionUser.user_metadata?.full_name as string | undefined) ?? '';
      const profile = await ensureProfile(sessionUser.email, name, firstEver);
      set({ currentUser: profile, initialized: true });
    } else {
      set({ currentUser: null, initialized: true });
    }
  },

  login: async (email, password) => {
    // Demo mode: accept anything and go straight in (as an admin).
    if (DEMO_MODE) {
      const em = (email || 'demo@oilgas.in').trim();
      await ensureSeeded();
      const profile = await ensureProfile(em, em.split('@')[0] ?? 'Demo User', true);
      writeStorage(DEMO_SESSION_KEY, em);
      set({ currentUser: profile });
      return { ok: true };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) return { ok: false, error: error.message };

    const firstEver = (await countUsers()) === 0;
    await ensureSeeded();
    const name = (data.user.user_metadata?.full_name as string | undefined) ?? '';
    const profile = await ensureProfile(data.user.email ?? email, name, firstEver);
    const withLogin: User = { ...profile, lastLoginAt: new Date().toISOString() };
    await upsertRow('users', withLogin as unknown as Identifiable);
    set({ currentUser: withLogin });
    return { ok: true };
  },

  signup: async (name, email, password) => {
    // Demo mode: creating an account just logs you in with sample data.
    if (DEMO_MODE) {
      const em = (email || 'demo@oilgas.in').trim();
      await ensureSeeded();
      const profile = await ensureProfile(em, name || em.split('@')[0] || 'Demo User', true);
      writeStorage(DEMO_SESSION_KEY, em);
      set({ currentUser: profile });
      return { ok: true, needsConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name } },
    });
    if (error) return { ok: false, error: error.message };

    // Email confirmation on → no session yet; user must verify first.
    if (!data.session) return { ok: true, needsConfirmation: true };

    const firstEver = (await countUsers()) === 0;
    await ensureSeeded();
    const profile = await ensureProfile(data.user?.email ?? email, name, firstEver);
    set({ currentUser: profile });
    return { ok: true, needsConfirmation: false };
  },

  logout: async () => {
    if (DEMO_MODE) {
      removeStorage(DEMO_SESSION_KEY);
      set({ currentUser: null });
      return;
    }
    await supabase.auth.signOut();
    set({ currentUser: null });
  },
}));

import { create } from 'zustand';
import { STORAGE_KEYS, readStorage, writeStorage, removeStorage } from '@/lib/storage';
import { DEMO_USER_ID_BY_ROLE } from '@/lib/mockAuth';
import type { Role, User } from '@/types';
import { useDataStore } from './dataStore';

interface AuthState {
  currentUser: User | null;
  initialized: boolean;
  init: () => void;
  login: (email: string, password: string) => { ok: boolean; error?: string };
  logout: () => void;
  switchRole: (role: Role) => void;
}

function findUser(predicate: (u: User) => boolean): User | undefined {
  return useDataStore.getState().users.find(predicate);
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  initialized: false,

  init: () => {
    const savedId = readStorage<string | null>(STORAGE_KEYS.auth, null);
    const user = savedId ? findUser((u) => u.id === savedId) : undefined;
    set({ currentUser: user ?? null, initialized: true });
  },

  login: (email, password) => {
    const user = findUser(
      (u) =>
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.password === password,
    );
    if (!user) {
      return { ok: false, error: 'Invalid email or password.' };
    }
    if (!user.active) {
      return { ok: false, error: 'This account has been deactivated.' };
    }
    writeStorage(STORAGE_KEYS.auth, user.id);
    useDataStore
      .getState()
      .update('users', user.id, { lastLoginAt: new Date().toISOString() });
    set({ currentUser: { ...user, lastLoginAt: new Date().toISOString() } });
    return { ok: true };
  },

  logout: () => {
    removeStorage(STORAGE_KEYS.auth);
    set({ currentUser: null });
  },

  switchRole: (role) => {
    const user = findUser((u) => u.id === DEMO_USER_ID_BY_ROLE[role]);
    if (!user) return;
    writeStorage(STORAGE_KEYS.auth, user.id);
    set({ currentUser: user });
  },
}));

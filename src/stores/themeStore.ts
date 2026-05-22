import { create } from 'zustand';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  init: () => void;
  setTheme: (theme: Theme) => void;
  toggle: () => void;
}

function apply(theme: Theme): void {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
}

function resolveInitial(): Theme {
  const saved = readStorage<Theme | null>(STORAGE_KEYS.theme, null);
  if (saved === 'light' || saved === 'dark') return saved;
  const prefersDark = window.matchMedia(
    '(prefers-color-scheme: dark)',
  ).matches;
  return prefersDark ? 'dark' : 'light';
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'light',
  init: () => {
    const theme = resolveInitial();
    apply(theme);
    set({ theme });
  },
  setTheme: (theme) => {
    apply(theme);
    writeStorage(STORAGE_KEYS.theme, theme);
    set({ theme });
  },
  toggle: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },
}));

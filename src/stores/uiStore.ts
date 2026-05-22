import { create } from 'zustand';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage';

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  commandOpen: boolean;
  shortcutsOpen: boolean;
  splashSeen: boolean;
  init: () => void;
  toggleSidebar: () => void;
  setMobileSidebar: (open: boolean) => void;
  setCommandOpen: (open: boolean) => void;
  setShortcutsOpen: (open: boolean) => void;
  dismissSplash: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarCollapsed: false,
  mobileSidebarOpen: false,
  commandOpen: false,
  shortcutsOpen: false,
  splashSeen: true,

  init: () => {
    set({
      sidebarCollapsed: readStorage(STORAGE_KEYS.sidebarCollapsed, false),
      splashSeen: readStorage(STORAGE_KEYS.splashSeen, false),
    });
  },

  toggleSidebar: () => {
    const next = !get().sidebarCollapsed;
    writeStorage(STORAGE_KEYS.sidebarCollapsed, next);
    set({ sidebarCollapsed: next });
  },

  setMobileSidebar: (open) => set({ mobileSidebarOpen: open }),
  setCommandOpen: (open) => set({ commandOpen: open }),
  setShortcutsOpen: (open) => set({ shortcutsOpen: open }),

  dismissSplash: () => {
    writeStorage(STORAGE_KEYS.splashSeen, true);
    set({ splashSeen: true });
  },
}));

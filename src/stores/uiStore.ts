import { create } from 'zustand';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage';

interface UiState {
  sidebarCollapsed: boolean;
  mobileSidebarOpen: boolean;
  commandOpen: boolean;
  shortcutsOpen: boolean;
  splashSeen: boolean;
  /**
   * True while the dashboard's Customise launcher occupies the bottom slot of
   * the right-edge dock. The AI button reads this to sit one slot up when they
   * share the dock, and drop back down to the bottom on every other screen —
   * otherwise it floats with an empty gap beneath it.
   */
  dockBottomTaken: boolean;
  setDockBottomTaken: (taken: boolean) => void;
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
  dockBottomTaken: false,

  setDockBottomTaken: (taken) => set({ dockBottomTaken: taken }),

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

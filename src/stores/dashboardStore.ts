import { create } from 'zustand';
import { readStorage, writeStorage, removeStorage } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import {
  DEFAULT_ORDER,
  applyGroupOrder,
  reconcileOrder,
  type WidgetGroup,
  type WidgetId,
} from '@/lib/dashboard/widgets';

const BASE_KEY = 'oilgas-crm:dashboard-layout';

// Layouts are namespaced per user, so each admin customises their own dashboard
// and switching accounts (or roles, via the demo switcher) restores that user's
// arrangement rather than leaking one person's layout to the next.
const keyFor = (u?: { id?: string | null } | null) =>
  `${BASE_KEY}:${u?.id || 'demo'}`;

interface StoredLayout {
  order: WidgetId[];
  /**
   * Only widgets the admin explicitly toggled. Anything absent falls back to
   * isWidgetVisibleByDefault(), which keeps defaults role-aware and lets new
   * widgets appear without a migration.
   */
  visibility: Partial<Record<WidgetId, boolean>>;
}

interface DashboardState extends StoredLayout {
  userKey: string;
  init: () => void;
  toggle: (id: WidgetId, visible: boolean) => void;
  reorderGroup: (group: WidgetGroup, groupOrder: WidgetId[]) => void;
  reset: () => void;
  /** True when the layout differs from the built-in default. */
  isCustomised: () => boolean;
}

const EMPTY: StoredLayout = { order: DEFAULT_ORDER, visibility: {} };

function persist(key: string, layout: StoredLayout) {
  writeStorage(key, layout);
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  ...EMPTY,
  userKey: BASE_KEY,

  init: () => {
    const userKey = keyFor(useAuthStore.getState().currentUser);
    const saved = readStorage<StoredLayout | null>(userKey, null);
    set({
      userKey,
      order: reconcileOrder(saved?.order ?? []),
      visibility: saved?.visibility ?? {},
    });
  },

  toggle: (id, visible) => {
    const { userKey, order, visibility } = get();
    const next = { ...visibility, [id]: visible };
    persist(userKey, { order, visibility: next });
    set({ visibility: next });
  },

  reorderGroup: (group, groupOrder) => {
    const { userKey, order, visibility } = get();
    const next = applyGroupOrder(order, group, groupOrder);
    persist(userKey, { order: next, visibility });
    set({ order: next });
  },

  reset: () => {
    const { userKey } = get();
    removeStorage(userKey);
    set({ order: DEFAULT_ORDER, visibility: {} });
  },

  isCustomised: () => {
    const { order, visibility } = get();
    if (Object.keys(visibility).length > 0) return true;
    return order.some((id, i) => DEFAULT_ORDER[i] !== id);
  },
}));

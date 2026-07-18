import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
  fetchAllCollections,
  upsertRow,
  deleteRow,
  replaceCollection,
  getSetting,
  setSetting,
  subscribeToChanges,
  type EntityTable,
  type Identifiable,
} from '@/lib/db';
import { DEFAULT_PERMISSIONS } from '@/lib/permissions';
import type { PermAction, PermModule } from '@/lib/permissions';
import { generateId } from '@/lib/utils';
import type {
  Activity,
  AppNotification,
  AttendanceRecord,
  AuditLogEntry,
  CallLog,
  ChatChannel,
  CompanySettings,
  CrmDocument,
  Customer,
  Definitions,
  Dispatch,
  Driver,
  EmailRecord,
  InventoryRecord,
  Invoice,
  Item,
  Lead,
  Message,
  Payment,
  Proposal,
  RelatedEntityType,
  Role,
  SalesOrder,
  Task,
  TransportRoute,
  User,
  Vehicle,
} from '@/types';

interface Collections {
  users: User[];
  leads: Lead[];
  customers: Customer[];
  items: Item[];
  proposals: Proposal[];
  orders: SalesOrder[];
  invoices: Invoice[];
  payments: Payment[];
  routes: TransportRoute[];
  dispatches: Dispatch[];
  vehicles: Vehicle[];
  drivers: Driver[];
  inventory: InventoryRecord[];
  tasks: Task[];
  activities: Activity[];
  messages: Message[];
  channels: ChatChannel[];
  emails: EmailRecord[];
  callLogs: CallLog[];
  notifications: AppNotification[];
  documents: CrmDocument[];
  auditLog: AuditLogEntry[];
  attendance: AttendanceRecord[];
}

type CollKey = keyof Collections;
type PermMatrix = Record<Role, Record<PermModule, PermAction[]>>;

interface DataState extends Collections {
  definitions: Definitions;
  company: CompanySettings;
  permissions: PermMatrix;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  add: <K extends CollKey>(key: K, item: Collections[K][number]) => void;
  update: <K extends CollKey>(
    key: K,
    id: string,
    patch: Partial<Collections[K][number]>,
  ) => void;
  remove: <K extends CollKey>(key: K, id: string) => void;
  replace: <K extends CollKey>(key: K, items: Collections[K]) => void;

  setDefinitions: (d: Definitions) => void;
  setCompany: (c: CompanySettings) => void;
  setPermissions: (p: PermMatrix) => void;

  logActivity: (
    entityType: RelatedEntityType,
    entityId: string,
    type: Activity['type'],
    title: string,
    userId: string,
    description?: string,
  ) => void;
  pushNotification: (
    n: Omit<AppNotification, 'id' | 'createdAt' | 'read'>,
  ) => void;
}

const COLL_KEYS: CollKey[] = [
  'users', 'leads', 'customers', 'items', 'proposals', 'orders', 'invoices',
  'payments', 'routes', 'dispatches', 'vehicles', 'drivers', 'inventory',
  'tasks', 'activities', 'messages', 'channels', 'emails', 'callLogs',
  'notifications', 'documents', 'auditLog', 'attendance',
];

export const SETTINGS_KEYS = {
  definitions: 'definitions',
  company: 'company',
  permissions: 'permissions',
  seedVersion: 'seed_version',
} as const;

const emptyCollections = (): Collections => ({
  users: [], leads: [], customers: [], items: [], proposals: [], orders: [],
  invoices: [], payments: [], routes: [], dispatches: [], vehicles: [],
  drivers: [], inventory: [], tasks: [], activities: [], messages: [],
  channels: [], emails: [], callLogs: [], notifications: [], documents: [],
  auditLog: [], attendance: [],
});

const EMPTY_DEFS: Definitions = {
  leadStatuses: [],
  lostReasons: [],
  industries: [],
  leadSources: [],
};

const EMPTY_COMPANY: CompanySettings = {
  name: 'OilGas CRM',
  legalName: '',
  gstin: '',
  pan: '',
  email: '',
  phone: '',
  website: '',
  address: { line1: '', city: '', state: '', pincode: '' },
  bankName: '',
  bankAccount: '',
  bankIfsc: '',
  invoicePrefix: 'INV/2026/',
  proposalPrefix: 'PROP/2026/',
  terms: '',
};

// Report a failed background write to the user without breaking the UI.
function persistError(err: unknown): void {
  console.error('[dataStore] save failed', err);
  toast.error('Could not save to the server. Please check your connection.');
}

let unsubscribeRealtime: (() => void) | null = null;

export const useDataStore = create<DataState>((set, get) => {
  // Apply a change that arrived over realtime (another user, or another tab).
  function applyRealtimeUpsert(table: EntityTable, row: Identifiable): void {
    const key = table as CollKey;
    set((state) => {
      const list = state[key] as unknown as Identifiable[];
      const exists = list.some((r) => r.id === row.id);
      const nextList = exists
        ? list.map((r) => (r.id === row.id ? row : r))
        : [row, ...list];
      return { [key]: nextList } as unknown as Partial<DataState>;
    });
  }

  function applyRealtimeDelete(table: EntityTable, id: string): void {
    const key = table as CollKey;
    set((state) => {
      const list = state[key] as unknown as Identifiable[];
      return { [key]: list.filter((r) => r.id !== id) } as unknown as Partial<DataState>;
    });
  }

  return {
    ...emptyCollections(),
    definitions: EMPTY_DEFS,
    company: EMPTY_COMPANY,
    permissions: DEFAULT_PERMISSIONS,
    hydrated: false,

    hydrate: async () => {
      const [collections, definitions, company, permissions] = await Promise.all([
        fetchAllCollections(),
        getSetting<Definitions>(SETTINGS_KEYS.definitions, EMPTY_DEFS),
        getSetting<CompanySettings>(SETTINGS_KEYS.company, EMPTY_COMPANY),
        getSetting<PermMatrix>(SETTINGS_KEYS.permissions, DEFAULT_PERMISSIONS),
      ]);

      const next: Partial<DataState> = { hydrated: true, definitions, company, permissions };
      for (const key of COLL_KEYS) {
        (next as Record<string, unknown>)[key] = collections[key];
      }
      set(next);

      // Start (or restart) the live sync once we have data.
      if (unsubscribeRealtime) unsubscribeRealtime();
      unsubscribeRealtime = subscribeToChanges(applyRealtimeUpsert, applyRealtimeDelete);
    },

    add: (key, item) => {
      const next = [item, ...get()[key]] as Collections[typeof key];
      set({ [key]: next } as unknown as Partial<DataState>);
      upsertRow(key as EntityTable, item as unknown as Identifiable).catch(persistError);
    },

    update: (key, id, patch) => {
      let updated: Identifiable | undefined;
      const next = get()[key].map((row) => {
        if (row.id === id) {
          const merged = { ...row, ...patch };
          updated = merged as unknown as Identifiable;
          return merged;
        }
        return row;
      }) as Collections[typeof key];
      set({ [key]: next } as unknown as Partial<DataState>);
      if (updated) upsertRow(key as EntityTable, updated).catch(persistError);
    },

    remove: (key, id) => {
      const next = get()[key].filter((row) => row.id !== id) as Collections[typeof key];
      set({ [key]: next } as unknown as Partial<DataState>);
      deleteRow(key as EntityTable, id).catch(persistError);
    },

    replace: (key, items) => {
      set({ [key]: items } as unknown as Partial<DataState>);
      replaceCollection(key as EntityTable, items as unknown as Identifiable[]).catch(persistError);
    },

    setDefinitions: (d) => {
      set({ definitions: d });
      setSetting(SETTINGS_KEYS.definitions, d).catch(persistError);
    },

    setCompany: (c) => {
      set({ company: c });
      setSetting(SETTINGS_KEYS.company, c).catch(persistError);
    },

    setPermissions: (p) => {
      set({ permissions: p });
      setSetting(SETTINGS_KEYS.permissions, p).catch(persistError);
    },

    logActivity: (entityType, entityId, type, title, userId, description) => {
      const activity: Activity = {
        id: generateId('act'),
        type,
        title,
        description,
        entityType,
        entityId,
        userId,
        createdAt: new Date().toISOString(),
      };
      get().add('activities', activity);
    },

    pushNotification: (n) => {
      const notif: AppNotification = {
        ...n,
        id: generateId('notif'),
        read: false,
        createdAt: new Date().toISOString(),
      };
      get().add('notifications', notif);
    },
  };
});

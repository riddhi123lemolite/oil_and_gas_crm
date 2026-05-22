import { create } from 'zustand';
import { STORAGE_KEYS, readStorage, writeStorage } from '@/lib/storage';
import { DEFAULT_PERMISSIONS } from '@/lib/permissions';
import type { PermAction, PermModule } from '@/lib/permissions';
import { generateId } from '@/lib/utils';
import type {
  Activity,
  AppNotification,
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
}

type CollKey = keyof Collections;
type PermMatrix = Record<Role, Record<PermModule, PermAction[]>>;

interface DataState extends Collections {
  definitions: Definitions;
  company: CompanySettings;
  permissions: PermMatrix;
  hydrated: boolean;

  hydrate: () => void;
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
  'notifications', 'documents', 'auditLog',
];

const emptyCollections = (): Collections => ({
  users: [], leads: [], customers: [], items: [], proposals: [], orders: [],
  invoices: [], payments: [], routes: [], dispatches: [], vehicles: [],
  drivers: [], inventory: [], tasks: [], activities: [], messages: [],
  channels: [], emails: [], callLogs: [], notifications: [], documents: [],
  auditLog: [],
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

export const useDataStore = create<DataState>((set, get) => ({
  ...emptyCollections(),
  definitions: EMPTY_DEFS,
  company: EMPTY_COMPANY,
  permissions: DEFAULT_PERMISSIONS,
  hydrated: false,

  hydrate: () => {
    const next: Partial<DataState> = { hydrated: true };
    for (const key of COLL_KEYS) {
      (next as Record<string, unknown>)[key] = readStorage(
        STORAGE_KEYS[key],
        [],
      );
    }
    next.definitions = readStorage(STORAGE_KEYS.definitions, EMPTY_DEFS);
    next.company = readStorage(STORAGE_KEYS.company, EMPTY_COMPANY);
    next.permissions = readStorage(
      STORAGE_KEYS.permissions,
      DEFAULT_PERMISSIONS,
    );
    set(next);
  },

  add: (key, item) => {
    const next = [item, ...get()[key]] as Collections[typeof key];
    writeStorage(STORAGE_KEYS[key], next);
    set({ [key]: next } as unknown as Partial<DataState>);
  },

  update: (key, id, patch) => {
    const next = get()[key].map((row) =>
      row.id === id ? { ...row, ...patch } : row,
    ) as Collections[typeof key];
    writeStorage(STORAGE_KEYS[key], next);
    set({ [key]: next } as unknown as Partial<DataState>);
  },

  remove: (key, id) => {
    const next = get()[key].filter(
      (row) => row.id !== id,
    ) as Collections[typeof key];
    writeStorage(STORAGE_KEYS[key], next);
    set({ [key]: next } as unknown as Partial<DataState>);
  },

  replace: (key, items) => {
    writeStorage(STORAGE_KEYS[key], items);
    set({ [key]: items } as unknown as Partial<DataState>);
  },

  setDefinitions: (d) => {
    writeStorage(STORAGE_KEYS.definitions, d);
    set({ definitions: d });
  },

  setCompany: (c) => {
    writeStorage(STORAGE_KEYS.company, c);
    set({ company: c });
  },

  setPermissions: (p) => {
    writeStorage(STORAGE_KEYS.permissions, p);
    set({ permissions: p });
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
}));

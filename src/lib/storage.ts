// ---------------------------------------------------------------------------
// localStorage helpers. All "database" reads/writes go through here.
// ---------------------------------------------------------------------------

const NAMESPACE = 'oilgas-crm';

export const STORAGE_KEYS = {
  seedVersion: `${NAMESPACE}:seed-version`,
  auth: `${NAMESPACE}:auth`,
  theme: `${NAMESPACE}:theme`,
  sidebarCollapsed: `${NAMESPACE}:sidebar-collapsed`,
  splashSeen: `${NAMESPACE}:splash-seen`,
  users: `${NAMESPACE}:users`,
  leads: `${NAMESPACE}:leads`,
  customers: `${NAMESPACE}:customers`,
  items: `${NAMESPACE}:items`,
  proposals: `${NAMESPACE}:proposals`,
  orders: `${NAMESPACE}:orders`,
  invoices: `${NAMESPACE}:invoices`,
  payments: `${NAMESPACE}:payments`,
  routes: `${NAMESPACE}:routes`,
  dispatches: `${NAMESPACE}:dispatches`,
  vehicles: `${NAMESPACE}:vehicles`,
  drivers: `${NAMESPACE}:drivers`,
  inventory: `${NAMESPACE}:inventory`,
  tasks: `${NAMESPACE}:tasks`,
  activities: `${NAMESPACE}:activities`,
  messages: `${NAMESPACE}:messages`,
  channels: `${NAMESPACE}:channels`,
  emails: `${NAMESPACE}:emails`,
  callLogs: `${NAMESPACE}:call-logs`,
  notifications: `${NAMESPACE}:notifications`,
  documents: `${NAMESPACE}:documents`,
  auditLog: `${NAMESPACE}:audit-log`,
  definitions: `${NAMESPACE}:definitions`,
  company: `${NAMESPACE}:company`,
  permissions: `${NAMESPACE}:permissions`,
  savedViews: `${NAMESPACE}:saved-views`,
  reportConfigs: `${NAMESPACE}:report-configs`,
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    // Quota exceeded or serialisation issue — non-fatal for a demo.
    console.warn('Storage write failed for', key, err);
  }
}

export function removeStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Clear every key in our namespace (used by "Reset Demo Data"). */
export function clearAllStorage(): void {
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(NAMESPACE)) toRemove.push(key);
  }
  toRemove.forEach((key) => localStorage.removeItem(key));
}

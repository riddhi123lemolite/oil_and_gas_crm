import { STORAGE_KEYS, writeStorage, readStorage } from './storage';
import { DEFAULT_PERMISSIONS } from './permissions';
import type { SeedData } from './seed/generate';

// Bump this to force every browser to re-seed on next load.
const SEED_VERSION = '2026.05.21-1';

function persistSeed(data: SeedData): void {
  writeStorage(STORAGE_KEYS.users, data.users);
  writeStorage(STORAGE_KEYS.leads, data.leads);
  writeStorage(STORAGE_KEYS.customers, data.customers);
  writeStorage(STORAGE_KEYS.items, data.items);
  writeStorage(STORAGE_KEYS.proposals, data.proposals);
  writeStorage(STORAGE_KEYS.orders, data.orders);
  writeStorage(STORAGE_KEYS.invoices, data.invoices);
  writeStorage(STORAGE_KEYS.payments, data.payments);
  writeStorage(STORAGE_KEYS.routes, data.routes);
  writeStorage(STORAGE_KEYS.dispatches, data.dispatches);
  writeStorage(STORAGE_KEYS.vehicles, data.vehicles);
  writeStorage(STORAGE_KEYS.drivers, data.drivers);
  writeStorage(STORAGE_KEYS.inventory, data.inventory);
  writeStorage(STORAGE_KEYS.tasks, data.tasks);
  writeStorage(STORAGE_KEYS.activities, data.activities);
  writeStorage(STORAGE_KEYS.messages, data.messages);
  writeStorage(STORAGE_KEYS.channels, data.channels);
  writeStorage(STORAGE_KEYS.emails, data.emails);
  writeStorage(STORAGE_KEYS.callLogs, data.callLogs);
  writeStorage(STORAGE_KEYS.notifications, data.notifications);
  writeStorage(STORAGE_KEYS.documents, data.documents);
  writeStorage(STORAGE_KEYS.auditLog, data.auditLog);
  writeStorage(STORAGE_KEYS.definitions, data.definitions);
  writeStorage(STORAGE_KEYS.company, data.company);
  writeStorage(STORAGE_KEYS.permissions, DEFAULT_PERMISSIONS);
}

/**
 * Ensure the browser's localStorage holds a full set of demo data.
 * The generator (which bundles faker) is dynamically imported so it stays
 * out of the initial bundle — it only loads on first run or after a reset.
 */
export async function ensureSeeded(force = false): Promise<void> {
  const current = readStorage<string | null>(STORAGE_KEYS.seedVersion, null);
  if (!force && current === SEED_VERSION) return;

  const { generateSeed } = await import('./seed/generate');
  const data = generateSeed();
  persistSeed(data);
  writeStorage(STORAGE_KEYS.seedVersion, SEED_VERSION);
}

/** Used by "Reset Demo Data" — wipes user changes and regenerates. */
export async function reseed(): Promise<void> {
  await ensureSeeded(true);
}

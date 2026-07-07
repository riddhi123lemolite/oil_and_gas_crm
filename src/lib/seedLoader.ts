import {
  getSetting,
  setSetting,
  bulkInsert,
  clearAllTables,
  type EntityTable,
  type Identifiable,
} from './db';
import { DEFAULT_PERMISSIONS } from './permissions';
import type { SeedData } from './seed/generate';

// Bump to force a one-time re-seed of the shared database on next sign-in.
const SEED_VERSION = '2026.06.30-1';

async function persistSeed(data: SeedData): Promise<void> {
  const collections: Array<[EntityTable, Identifiable[]]> = [
    ['users', data.users as unknown as Identifiable[]],
    ['leads', data.leads as unknown as Identifiable[]],
    ['customers', data.customers as unknown as Identifiable[]],
    ['items', data.items as unknown as Identifiable[]],
    ['proposals', data.proposals as unknown as Identifiable[]],
    ['orders', data.orders as unknown as Identifiable[]],
    ['invoices', data.invoices as unknown as Identifiable[]],
    ['payments', data.payments as unknown as Identifiable[]],
    ['routes', data.routes as unknown as Identifiable[]],
    ['dispatches', data.dispatches as unknown as Identifiable[]],
    ['vehicles', data.vehicles as unknown as Identifiable[]],
    ['drivers', data.drivers as unknown as Identifiable[]],
    ['inventory', data.inventory as unknown as Identifiable[]],
    ['tasks', data.tasks as unknown as Identifiable[]],
    ['activities', data.activities as unknown as Identifiable[]],
    ['messages', data.messages as unknown as Identifiable[]],
    ['channels', data.channels as unknown as Identifiable[]],
    ['emails', data.emails as unknown as Identifiable[]],
    ['callLogs', data.callLogs as unknown as Identifiable[]],
    ['notifications', data.notifications as unknown as Identifiable[]],
    ['documents', data.documents as unknown as Identifiable[]],
    ['auditLog', data.auditLog as unknown as Identifiable[]],
  ];

  // Insert every collection, then the singleton settings.
  await Promise.all(collections.map(([table, rows]) => bulkInsert(table, rows)));
  await setSetting('definitions', data.definitions);
  await setSetting('company', data.company);
  await setSetting('permissions', DEFAULT_PERMISSIONS);
}

/**
 * Ensure the shared Supabase database holds a full set of demo data.
 * Runs once (guarded by a seed_version flag); the generator that bundles
 * faker is imported dynamically so it stays out of the main app bundle.
 */
export async function ensureSeeded(force = false): Promise<void> {
  const current = await getSetting<string | null>('seed_version', null);
  if (!force && current === SEED_VERSION) return;

  // A new seed version (or an explicit reset) — wipe first so the fresh dataset
  // replaces the old one instead of appending duplicates.
  await clearAllTables();

  const { generateSeed } = await import('./seed/generate');
  const data = generateSeed();
  await persistSeed(data);
  await setSetting('seed_version', SEED_VERSION);
}

/** Used by "Reset Demo Data" — wipes changes and regenerates sample data. */
export async function reseed(): Promise<void> {
  await ensureSeeded(true);
}

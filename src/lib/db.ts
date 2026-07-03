// ---------------------------------------------------------------------------
// Supabase data access. Every "database" read/write goes through here — this
// is the Supabase replacement for the old localStorage layer. Each record type
// is one table storing the record as JSON in a `data` column, keyed by `id`.
// Table names match the data store's collection keys exactly.
// ---------------------------------------------------------------------------
import { supabase } from './supabase';

export const ENTITY_TABLES = [
  'users', 'leads', 'customers', 'items', 'proposals', 'orders', 'invoices',
  'payments', 'routes', 'dispatches', 'vehicles', 'drivers', 'inventory',
  'tasks', 'activities', 'messages', 'channels', 'emails', 'callLogs',
  'notifications', 'documents', 'auditLog',
] as const;

export type EntityTable = (typeof ENTITY_TABLES)[number];

export interface Identifiable {
  id: string;
  [key: string]: unknown;
}

function toRow(table: EntityTable, item: Identifiable): Record<string, unknown> {
  const row: Record<string, unknown> = { id: item.id, data: item };
  // The users table has a queryable `email` column (login ↔ profile matching).
  if (table === 'users') row.email = (item as { email?: string }).email ?? null;
  return row;
}

/** Load every collection from Supabase in parallel. */
export async function fetchAllCollections(): Promise<Record<EntityTable, Identifiable[]>> {
  const entries = await Promise.all(
    ENTITY_TABLES.map(async (table) => {
      const { data, error } = await supabase
        .from(table)
        .select('data')
        .order('created_at', { ascending: false });
      if (error) throw error;
      const rows = (data ?? []).map((r) => (r as { data: Identifiable }).data);
      return [table, rows] as const;
    }),
  );
  return Object.fromEntries(entries) as Record<EntityTable, Identifiable[]>;
}

/** Insert or update a single record. */
export async function upsertRow(table: EntityTable, item: Identifiable): Promise<void> {
  const { error } = await supabase.from(table).upsert(toRow(table, item));
  if (error) throw error;
}

/** Delete a single record by id. */
export async function deleteRow(table: EntityTable, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) throw error;
}

/** Insert many records (chunked to stay within request limits). */
export async function bulkInsert(table: EntityTable, items: Identifiable[]): Promise<void> {
  if (items.length === 0) return;
  const CHUNK = 400;
  for (let i = 0; i < items.length; i += CHUNK) {
    const slice = items.slice(i, i + CHUNK).map((it) => toRow(table, it));
    const { error } = await supabase.from(table).insert(slice);
    if (error) throw error;
  }
}

/** Replace an entire collection (delete all, then insert the given set). */
export async function replaceCollection(table: EntityTable, items: Identifiable[]): Promise<void> {
  const { error } = await supabase.from(table).delete().not('id', 'is', null);
  if (error) throw error;
  await bulkInsert(table, items);
}

/** Remove every row from every entity table (used by "Reset Demo Data"). */
export async function clearAllTables(): Promise<void> {
  await Promise.all(
    ENTITY_TABLES.map(async (table) => {
      const { error } = await supabase.from(table).delete().not('id', 'is', null);
      if (error) throw error;
    }),
  );
}

// ---- settings singletons (definitions, company, permissions, seed_version) --
export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const { data, error } = await supabase.from('settings').select('data').eq('key', key).maybeSingle();
  if (error) throw error;
  return data ? (data as { data: T }).data : fallback;
}

export async function setSetting<T>(key: string, value: T): Promise<void> {
  const { error } = await supabase
    .from('settings')
    .upsert({ key, data: value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

// ---- users helpers (login ↔ profile matched by email) ----------------------
export async function findUserByEmail<T>(email: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('users')
    .select('data')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data ? (data as { data: T }).data : null;
}

export async function countUsers(): Promise<number> {
  const { count, error } = await supabase.from('users').select('id', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

// ---- realtime: keep every browser in sync as data changes ------------------
export function subscribeToChanges(
  onUpsert: (table: EntityTable, row: Identifiable) => void,
  onDelete: (table: EntityTable, id: string) => void,
): () => void {
  const channel = supabase.channel('oilgas-crm-changes');
  for (const table of ENTITY_TABLES) {
    channel.on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        if (payload.eventType === 'DELETE') {
          const id = (payload.old as { id?: string }).id;
          if (id) onDelete(table, id);
        } else {
          const row = (payload.new as { data?: Identifiable }).data;
          if (row) onUpsert(table, row);
        }
      },
    );
  }
  channel.subscribe();
  return () => {
    void supabase.removeChannel(channel);
  };
}

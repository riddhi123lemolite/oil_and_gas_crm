import { useMemo } from 'react';
import { useDataStore } from '@/stores/dataStore';

/** Memoised id → record lookup maps and convenient name resolvers. */
export function useLookups() {
  const { users, customers, items, leads, routes } = useDataStore();

  return useMemo(() => {
    const userMap = new Map(users.map((u) => [u.id, u]));
    const customerMap = new Map(customers.map((c) => [c.id, c]));
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const leadMap = new Map(leads.map((l) => [l.id, l]));
    const routeMap = new Map(routes.map((r) => [r.id, r]));

    return {
      userMap,
      customerMap,
      itemMap,
      leadMap,
      routeMap,
      userName: (id?: string) =>
        (id && userMap.get(id)?.name) || 'Unassigned',
      customerName: (id?: string) =>
        (id && customerMap.get(id)?.companyName) || '—',
      itemName: (id?: string) => (id && itemMap.get(id)?.name) || '—',
      routeLabel: (id?: string) => {
        const r = id ? routeMap.get(id) : undefined;
        return r ? `${r.fromLocation} → ${r.toLocation}` : '—';
      },
    };
  }, [users, customers, items, leads, routes]);
}

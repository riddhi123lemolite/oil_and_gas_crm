import { useMemo } from 'react';
import { create } from 'zustand';
import { useDataStore } from '@/stores/dataStore';
import { readStorage, writeStorage } from '@/lib/storage';
import type { Customer } from '@/types';

const KEY = 'oilgas-crm:portal-customer';

interface PortalState {
  index: number;
  setIndex: (i: number) => void;
}

export const usePortalStore = create<PortalState>((set) => ({
  index: readStorage<number>(KEY, 0),
  setIndex: (index) => {
    writeStorage(KEY, index);
    set({ index });
  },
}));

/** The switchable portal accounts: the 3 customers with the most invoices
 *  (so each account has real data to show). */
export function usePortalCustomers(): Customer[] {
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  return useMemo(() => {
    const count = new Map<string, number>();
    invoices.forEach((i) => count.set(i.customerId, (count.get(i.customerId) ?? 0) + 1));
    return [...customers]
      .sort((a, b) => (count.get(b.id) ?? 0) - (count.get(a.id) ?? 0))
      .slice(0, 3);
  }, [customers, invoices]);
}

/** The currently selected portal customer. */
export function usePortalCustomer(): Customer | undefined {
  const list = usePortalCustomers();
  const index = usePortalStore((s) => s.index);
  return list[index] ?? list[0];
}

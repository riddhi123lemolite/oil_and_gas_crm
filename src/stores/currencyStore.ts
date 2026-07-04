import { create } from 'zustand';
import { readStorage, writeStorage } from '@/lib/storage';

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  locale: string;
  /** Value of 1 INR in this currency (indicative demo rates). */
  rate: number;
}

// All amounts in the app are stored in INR; these convert for display only.
export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', rate: 0.012 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE', rate: 0.011 },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'en-AE', rate: 0.044 },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', rate: 0.0095 },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG', rate: 0.016 },
];

const STORAGE_KEY = 'oilgas-crm:currency';

interface CurrencyState {
  code: string;
  setCurrency: (code: string) => void;
  init: () => void;
}

export const useCurrencyStore = create<CurrencyState>((set) => ({
  code: 'INR',
  setCurrency: (code) => {
    writeStorage(STORAGE_KEY, code);
    set({ code });
  },
  init: () => {
    const saved = readStorage<string | null>(STORAGE_KEY, null);
    if (saved && CURRENCIES.some((c) => c.code === saved)) set({ code: saved });
  },
}));

/** The currently selected currency (non-reactive; for use inside formatters). */
export function activeCurrency(): Currency {
  const { code } = useCurrencyStore.getState();
  return CURRENCIES.find((c) => c.code === code) ?? CURRENCIES[0]!;
}

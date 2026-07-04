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
// `rate` = value of 1 INR in that currency (indicative demo rates).
export const CURRENCIES: Currency[] = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN', rate: 1 },
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US', rate: 0.012 },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar', locale: 'en-CA', rate: 0.016 },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'en-IE', rate: 0.011 },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB', rate: 0.0095 },
  // GCC currencies
  { code: 'AED', symbol: 'AED', name: 'UAE Dirham', locale: 'en-AE', rate: 0.044 },
  { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal', locale: 'en-SA', rate: 0.045 },
  { code: 'QAR', symbol: 'QAR', name: 'Qatari Riyal', locale: 'en-QA', rate: 0.0437 },
  { code: 'KWD', symbol: 'KWD', name: 'Kuwaiti Dinar', locale: 'en-KW', rate: 0.00369 },
  { code: 'BHD', symbol: 'BHD', name: 'Bahraini Dinar', locale: 'en-BH', rate: 0.00452 },
  { code: 'OMR', symbol: 'OMR', name: 'Omani Rial', locale: 'en-OM', rate: 0.00463 },
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

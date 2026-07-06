import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { activeCurrency } from '@/stores/currencyStore';
import { activeLocale } from '@/lib/i18n';
import type { Unit } from '@/types';

// ---------------------------------------------------------------------------
// Currency — amounts are stored in INR and converted to the selected
// display currency (see the switcher in the top bar).
// ---------------------------------------------------------------------------

const inrWhole = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/** Format a money amount (stored in INR) in the selected currency. */
export function formatINR(amount: number | undefined | null): string {
  const cur = activeCurrency();
  const value =
    amount === undefined || amount === null || Number.isNaN(amount)
      ? 0
      : amount * cur.rate;
  // No forced fraction digits — each currency uses its own (INR 2, KWD/BHD/OMR 3).
  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.code,
  }).format(value);
}

/** Compact money — INR keeps lakh/crore; others use K/M/B compact notation. */
export function formatINRCompact(amount: number | undefined | null): string {
  const cur = activeCurrency();
  const raw =
    amount === undefined || amount === null || Number.isNaN(amount) ? 0 : amount;

  if (cur.code === 'INR') {
    const abs = Math.abs(raw);
    if (abs >= 1_00_00_000) return `₹${(raw / 1_00_00_000).toFixed(2)} Cr`;
    if (abs >= 1_00_000) return `₹${(raw / 1_00_000).toFixed(2)} L`;
    return `₹${inrWhole.format(raw)}`;
  }

  return new Intl.NumberFormat(cur.locale, {
    style: 'currency',
    currency: cur.code,
    notation: 'compact',
    maximumFractionDigits: 2,
  }).format(raw * cur.rate);
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat(activeLocale(), {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

/** Quantity with unit — "1,234.500 KL".
 *  Bulk litre volumes are shown in kilolitres (1 KL = 1,000 L), the industry
 *  norm, so KL appears everywhere a large liquid volume is displayed. Small
 *  litre quantities (< 1 KL) stay in litres. */
export function formatQty(value: number, unit: Unit): string {
  if (unit === 'L' && Math.abs(value) >= 1000) {
    return `${formatNumber(value / 1000, 3)} KL`;
  }
  const decimals = unit === 'KL' ? 3 : 0;
  return `${formatNumber(value, decimals)} ${unit}`;
}

/** Litres expressed in kilolitres — "1,234.500 KL". */
export function formatKL(litres: number): string {
  return `${formatNumber(litres / 1000, 3)} KL`;
}

// ---------------------------------------------------------------------------
// Dates — Indian DD-MM-YYYY conventions, IST
// ---------------------------------------------------------------------------

function toDate(value: string | Date | undefined | null): Date | null {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

/** "21-05-2026". */
export function formatDate(value?: string | Date | null): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(activeLocale(), { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
    : '—';
}

/** "21 May 2026". */
export function formatDateLong(value?: string | Date | null): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(activeLocale(), { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
    : '—';
}

/** "21 May 2026, 4:30 PM". */
export function formatDateTime(value?: string | Date | null): string {
  const date = toDate(value);
  return date
    ? new Intl.DateTimeFormat(activeLocale(), { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date)
    : '—';
}

/** "3 days ago". */
export function formatRelative(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : '—';
}

export function formatTime(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? format(date, 'h:mm a') : '—';
}

/** ISO date for <input type="date">. */
export function toInputDate(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? format(date, 'yyyy-MM-dd') : '';
}

/** Indian fiscal year label for a date — FY 2026-27. */
export function fiscalYear(value?: string | Date | null): string {
  const date = toDate(value) ?? new Date();
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-indexed; April = 3
  const startYear = month >= 3 ? year : year - 1;
  return `FY ${startYear}-${String(startYear + 1).slice(2)}`;
}

export function daysBetween(a: string | Date, b: string | Date): number {
  const da = toDate(a);
  const db = toDate(b);
  if (!da || !db) return 0;
  return Math.round((db.getTime() - da.getTime()) / 86_400_000);
}

// ---------------------------------------------------------------------------
// Phone
// ---------------------------------------------------------------------------

/** "+91 98250 12345". */
export function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return raw;
  return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
}

export function formatPercent(value: number): string {
  return `${value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)}%`;
}

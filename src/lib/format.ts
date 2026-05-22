import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns';
import type { Unit } from '@/types';

// ---------------------------------------------------------------------------
// Currency — Indian numbering (lakh / crore)
// ---------------------------------------------------------------------------

const inrFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const inrWhole = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 0,
});

/** Format a rupee amount as "₹ 1,23,456.00". */
export function formatINR(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '₹ 0.00';
  }
  return `₹ ${inrFormatter.format(amount)}`;
}

/** Compact rupee amount — "₹1.23 Cr", "₹4.50 L", "₹12,500". */
export function formatINRCompact(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '₹0';
  }
  const abs = Math.abs(amount);
  if (abs >= 1_00_00_000) {
    return `₹${(amount / 1_00_00_000).toFixed(2)} Cr`;
  }
  if (abs >= 1_00_000) {
    return `₹${(amount / 1_00_000).toFixed(2)} L`;
  }
  if (abs >= 1_000) {
    return `₹${inrWhole.format(amount)}`;
  }
  return `₹${inrWhole.format(amount)}`;
}

export function formatNumber(value: number, fractionDigits = 0): string {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value);
}

/** Quantity with unit — "1,234.500 KL". */
export function formatQty(value: number, unit: Unit): string {
  const decimals = unit === 'KL' || unit === 'MT' ? 3 : 0;
  return `${formatNumber(value, decimals)} ${unit}`;
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
  return date ? format(date, 'dd-MM-yyyy') : '—';
}

/** "21 May 2026". */
export function formatDateLong(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy') : '—';
}

/** "21 May 2026, 4:30 PM". */
export function formatDateTime(value?: string | Date | null): string {
  const date = toDate(value);
  return date ? format(date, 'dd MMM yyyy, h:mm a') : '—';
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

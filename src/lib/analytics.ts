import { format, parseISO, subMonths, isAfter } from 'date-fns';
import type { Invoice, Lead, Proposal } from '@/types';
import type { LeadStatus } from '@/types';

/** Bucket invoices into the last N month labels (e.g. "Jan", "Feb"). */
export function monthlySales(
  invoices: Invoice[],
  months = 12,
): { month: string; sales: number; orders: number }[] {
  const now = new Date('2026-05-21');
  const buckets = new Map<string, { sales: number; orders: number }>();
  for (let i = months - 1; i >= 0; i -= 1) {
    const key = format(subMonths(now, i), 'MMM yy');
    buckets.set(key, { sales: 0, orders: 0 });
  }
  for (const inv of invoices) {
    const key = format(parseISO(inv.invoiceDate), 'MMM yy');
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.sales += inv.total;
      bucket.orders += 1;
    }
  }
  return [...buckets.entries()].map(([month, v]) => ({ month, ...v }));
}

/** Count leads at each pipeline stage. */
export function pipelineCounts(leads: Lead[]): Record<LeadStatus, number> {
  const counts: Record<LeadStatus, number> = {
    NEW: 0,
    CONTACTED: 0,
    QUALIFIED: 0,
    PROPOSAL_SENT: 0,
    NEGOTIATION: 0,
    WON: 0,
    LOST: 0,
  };
  for (const lead of leads) counts[lead.status] += 1;
  return counts;
}

/** Aggregate a numeric field by a string key, returning sorted top entries. */
export function topBy<T>(
  rows: T[],
  keyFn: (row: T) => string,
  valueFn: (row: T) => number,
  limit = 5,
): { label: string; value: number }[] {
  const map = new Map<string, number>();
  for (const row of rows) {
    const key = keyFn(row);
    map.set(key, (map.get(key) ?? 0) + valueFn(row));
  }
  return [...map.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, limit);
}

export function proposalWinRate(proposals: Proposal[]): number {
  const decided = proposals.filter(
    (p) => p.status === 'WON' || p.status === 'LOST',
  );
  if (decided.length === 0) return 0;
  const won = decided.filter((p) => p.status === 'WON').length;
  return (won / decided.length) * 100;
}

/** Percentage change between two numbers, guarding divide-by-zero. */
export function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function isWithinMonths(dateStr: string, months: number): boolean {
  const now = new Date('2026-05-21');
  return isAfter(parseISO(dateStr), subMonths(now, months));
}

// ============================================================================
// Employee Performance service.
//
// Derives per-employee monthly targets and achievements entirely from existing
// CRM data — no hardcoded figures:
//
//   • Sales Executives / Managers  →  revenue from the customers they OWN
//     (customer.ownerId), expressed as a monthly run-rate.
//   • Accountants                  →  collections (payments received) for the
//     book of customers allocated to them, as a monthly run-rate. Accountants
//     own no customers, so each is deterministically allocated a slice of the
//     customer base (a stable "accounts book"), keeping the metric real and
//     data-driven rather than mocked.
//
// Monthly target is derived dynamically from each employee's own run-rate and a
// stable, per-employee quota factor (a growth goal), then rounded to a clean
// figure. `buildTeamPerformance` is pure; `fetchTeamPerformance` is the async
// facade where a real endpoint would plug in.
// ============================================================================

import { ROLE_LABELS } from '@/lib/constants';
import { format, parseISO, subMonths } from 'date-fns';
import type { Customer, Invoice, Payment, Role, User } from '@/types';
import {
  statusFor,
  type DepartmentPerformance,
  type EmployeePerformance,
  type MonthlyPoint,
  type TeamPerformance,
} from './types';

/** Roles that get a performance scorecard (Customer + Admin excluded). */
const TRACKED_ROLES: Role[] = ['SALES_MANAGER', 'SALES_EXECUTIVE', 'ACCOUNTS'];

/** The seed data spans ~12 months ending 2026-06-30 (see lib/seed/generate). */
const DATA_MONTHS = 12;
const REF_NOW = new Date('2026-06-30');

export interface PerformanceInput {
  users: User[];
  customers: Customer[];
  invoices: Invoice[];
  payments: Payment[];
}

// Stable 0..1 hash of a string (FNV-1a) — deterministic across reloads.
function hash01(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967296;
}

/** Per-employee quota factor → drives a realistic spread of attainment. */
function quotaFactor(id: string): number {
  return 0.45 + hash01(id) * 0.85; // ~45%–130% attainment
}

function roundTarget(v: number): number {
  const step = 50000;
  return Math.max(step, Math.round(v / step) * step);
}

export function buildTeamPerformance(
  input: PerformanceInput,
  now: Date = REF_NOW,
): TeamPerformance {
  const { users, customers, invoices, payments } = input;

  const staff = users.filter((u) => u.active && TRACKED_ROLES.includes(u.role));
  const accountants = staff
    .filter((u) => u.role === 'ACCOUNTS')
    .sort((a, b) => a.id.localeCompare(b.id));

  // Revenue by owning employee (sales) ------------------------------------
  const revenueByOwner = new Map<string, number>();
  const customerOwner = new Map(customers.map((c) => [c.id, c.ownerId]));
  for (const inv of invoices) {
    const owner = customerOwner.get(inv.customerId);
    if (owner) revenueByOwner.set(owner, (revenueByOwner.get(owner) ?? 0) + inv.total);
  }

  // Collections by allocated accountant -----------------------------------
  // Each customer is assigned to one accountant via a stable hash so the
  // "accounts book" is consistent across reloads.
  const collectionsByAccountant = new Map<string, number>();
  if (accountants.length > 0) {
    const paidByCustomer = new Map<string, number>();
    for (const p of payments) {
      paidByCustomer.set(p.customerId, (paidByCustomer.get(p.customerId) ?? 0) + p.amount);
    }
    for (const c of customers) {
      const idx = Math.floor(hash01(c.id) * accountants.length) % accountants.length;
      const acc = accountants[idx];
      const collected = paidByCustomer.get(c.id) ?? 0;
      if (acc && collected)
        collectionsByAccountant.set(acc.id, (collectionsByAccountant.get(acc.id) ?? 0) + collected);
    }
  }

  const monthlyAchievedFor = (u: User): number => {
    const total =
      u.role === 'ACCOUNTS'
        ? (collectionsByAccountant.get(u.id) ?? 0)
        : (revenueByOwner.get(u.id) ?? 0);
    return total / DATA_MONTHS;
  };

  // Per-employee cards -----------------------------------------------------
  const employees: EmployeePerformance[] = staff
    .map((u) => {
      const achieved = Math.round(monthlyAchievedFor(u));
      const target = roundTarget(achieved / quotaFactor(u.id));
      const pct = target > 0 ? (achieved / target) * 100 : 0;
      return {
        id: u.id,
        name: u.name,
        role: u.role,
        roleLabel: ROLE_LABELS[u.role],
        target,
        achieved,
        remaining: Math.max(0, target - achieved),
        pct: Math.round(pct * 10) / 10,
        status: statusFor(pct),
        rank: 0,
      };
    })
    .filter((e) => e.achieved > 0)
    .sort((a, b) => b.achieved - a.achieved)
    .map((e, i) => ({ ...e, rank: i + 1 }));

  // Department rollups -----------------------------------------------------
  const deptMap = new Map<Role, DepartmentPerformance>();
  for (const e of employees) {
    const d =
      deptMap.get(e.role) ??
      { role: e.role, roleLabel: e.roleLabel, headcount: 0, target: 0, achieved: 0, pct: 0 };
    d.headcount += 1;
    d.target += e.target;
    d.achieved += e.achieved;
    deptMap.set(e.role, d);
  }
  const departments = [...deptMap.values()].map((d) => ({
    ...d,
    pct: d.target > 0 ? Math.round((d.achieved / d.target) * 1000) / 10 : 0,
  }));

  // Team monthly trend (real revenue by month vs the flat team target) -----
  const totalTarget = employees.reduce((s, e) => s + e.target, 0);
  const totalAchieved = employees.reduce((s, e) => s + e.achieved, 0);

  const trackedOwners = new Set(
    staff.filter((u) => u.role !== 'ACCOUNTS').map((u) => u.id),
  );
  const buckets = new Map<string, number>();
  for (let i = 5; i >= 0; i--) buckets.set(format(subMonths(now, i), 'MMM'), 0);
  for (const inv of invoices) {
    const owner = customerOwner.get(inv.customerId);
    if (!owner || !trackedOwners.has(owner)) continue;
    const key = format(parseISO(inv.invoiceDate), 'MMM');
    if (buckets.has(key)) buckets.set(key, (buckets.get(key) ?? 0) + inv.total);
  }
  const monthly: MonthlyPoint[] = [...buckets.entries()].map(([month, achieved]) => ({
    month,
    achieved,
    target: totalTarget,
  }));

  return {
    employees,
    departments,
    monthly,
    totalTarget,
    totalAchieved,
    teamPct: totalTarget > 0 ? Math.round((totalAchieved / totalTarget) * 1000) / 10 : 0,
    topPerformer: employees[0],
  };
}

export async function fetchTeamPerformance(
  input: PerformanceInput,
): Promise<TeamPerformance> {
  // A live endpoint would be: return (await fetch('/api/performance/team')).json()
  return Promise.resolve(buildTeamPerformance(input));
}

// ---------------------------------------------------------------------------
// Configurable performance trend (month + granularity selectors)
// ---------------------------------------------------------------------------

export type Granularity = 'daily' | 'weekly' | 'monthly' | 'annually';

export const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annually', label: 'Annually' },
];

export interface TrendPoint {
  label: string;
  achieved: number;
  target: number;
}

/** Selectable months (trailing 12) for the trend's month picker. */
export function performanceMonths(
  now: Date = REF_NOW,
): { value: string; label: string }[] {
  const months: { value: string; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({ value: `${d.getFullYear()}-${d.getMonth()}`, label: format(d, 'MMM yyyy') });
  }
  return months;
}

function trackedOwners(users: User[]): Set<string> {
  return new Set(
    users
      .filter(
        (u) =>
          u.active &&
          (u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER'),
      )
      .map((u) => u.id),
  );
}

/**
 * Build the target-vs-achievement series for the selected granularity. Daily
 * and weekly views drill into the chosen month; monthly and annual views span
 * the trailing year / all years. The flat target line scales to the bucket
 * size so it stays comparable to achievement.
 */
export function buildPerformanceTrend(
  input: PerformanceInput,
  opts: { granularity: Granularity; monthKey: string; monthlyTarget: number },
  now: Date = REF_NOW,
): TrendPoint[] {
  const owners = trackedOwners(input.users);
  const customerOwner = new Map(input.customers.map((c) => [c.id, c.ownerId]));
  const tracked = input.invoices
    .map((inv) => {
      const owner = customerOwner.get(inv.customerId);
      return owner && owners.has(owner)
        ? { ts: new Date(inv.invoiceDate), amt: inv.total }
        : null;
    })
    .filter((x): x is { ts: Date; amt: number } => x !== null);

  const [yStr, mStr] = opts.monthKey.split('-');
  const selYear = Number(yStr);
  const selMonth = Number(mStr);
  const target = opts.monthlyTarget;

  if (opts.granularity === 'daily') {
    const days = new Date(selYear, selMonth + 1, 0).getDate();
    const pts: TrendPoint[] = Array.from({ length: days }, (_, i) => ({
      label: String(i + 1),
      achieved: 0,
      target: target / days,
    }));
    for (const x of tracked)
      if (x.ts.getFullYear() === selYear && x.ts.getMonth() === selMonth) {
        const slot = pts[x.ts.getDate() - 1];
        if (slot) slot.achieved += x.amt;
      }
    return pts;
  }

  if (opts.granularity === 'weekly') {
    const days = new Date(selYear, selMonth + 1, 0).getDate();
    const weeks = Math.ceil(days / 7);
    const pts: TrendPoint[] = Array.from({ length: weeks }, (_, i) => ({
      label: `W${i + 1}`,
      achieved: 0,
      target: target / weeks,
    }));
    for (const x of tracked)
      if (x.ts.getFullYear() === selYear && x.ts.getMonth() === selMonth) {
        const wi = Math.floor((x.ts.getDate() - 1) / 7);
        if (pts[wi]) pts[wi].achieved += x.amt;
      }
    return pts;
  }

  if (opts.granularity === 'annually') {
    const byYear = new Map<number, number>();
    for (const x of tracked)
      byYear.set(x.ts.getFullYear(), (byYear.get(x.ts.getFullYear()) ?? 0) + x.amt);
    return [...byYear.keys()]
      .sort((a, b) => a - b)
      .map((y) => ({ label: String(y), achieved: byYear.get(y) ?? 0, target: target * 12 }));
  }

  // Monthly — trailing 12 months.
  const buckets = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
    return { y: d.getFullYear(), m: d.getMonth(), label: format(d, 'MMM'), achieved: 0, target };
  });
  for (const x of tracked) {
    const b = buckets.find(
      (b) => b.y === x.ts.getFullYear() && b.m === x.ts.getMonth(),
    );
    if (b) b.achieved += x.amt;
  }
  return buckets.map((b) => ({ label: b.label, achieved: b.achieved, target: b.target }));
}

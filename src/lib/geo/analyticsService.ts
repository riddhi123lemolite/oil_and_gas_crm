// ============================================================================
// Geographic analytics service.
//
// `buildGeoAnalytics` / `buildStateDetail` are PURE functions that derive
// state-level analytics from the CRM's local collections. `fetchGeoAnalytics`
// wraps them in a promise so the call site looks like a real API request —
// swap the body for `fetch('/api/analytics/geo')` and nothing else changes.
// ============================================================================

import type {
  Customer,
  Invoice,
  Item,
  ItemCategory,
  Proposal,
  SalesOrder,
  User,
} from '@/types';
import { normalizeStateName, REGION_BY_STATE, regionOf } from './regions';
import type {
  GeoAnalyticsResponse,
  GeoFilters,
  StateAnalytics,
  StateDetail,
} from './types';

// ---------------------------------------------------------------------------
// Domain groupings
// ---------------------------------------------------------------------------

const OIL_CATEGORIES: ItemCategory[] = ['OIL_FUEL', 'LUBRICANT'];
const GAS_CATEGORIES: ItemCategory[] = [
  'SOLVENT',
  'GLYCOL',
  'SPECIALTY',
  'PLASTIC_GRANULE',
];
const ALL_CATEGORIES: ItemCategory[] = [...OIL_CATEGORIES, ...GAS_CATEGORIES];

export interface BusinessUnit {
  key: string;
  label: string;
  categories: ItemCategory[];
}

export const BUSINESS_UNITS: BusinessUnit[] = [
  { key: 'fuels', label: 'Fuels & Lubricants', categories: OIL_CATEGORIES },
  {
    key: 'petrochem',
    label: 'Petrochemicals',
    categories: ['SOLVENT', 'GLYCOL', 'SPECIALTY'],
  },
  { key: 'polymers', label: 'Polymers', categories: ['PLASTIC_GRANULE'] },
];

const ORDER_PENDING_STATUSES = new Set([
  'CONFIRMED',
  'PROCESSING',
  'PARTIALLY_DISPATCHED',
]);

const PROPOSAL_ACTIVE_STATUSES = new Set([
  'SENT',
  'UNDER_REVIEW',
  'NEGOTIATION',
]);

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const DAY = 86_400_000;

/** Convert an item line quantity to litres (bulk is stored in kilolitres). */
function toLitres(quantity: number, unit: 'KL' | 'L'): number {
  return unit === 'KL' ? quantity * 1000 : quantity;
}

function rangeStart(range: GeoFilters['dateRange'], now: Date): number {
  const t = now.getTime();
  switch (range) {
    case '30d':
      return t - 30 * DAY;
    case '12m':
      return t - 365 * DAY;
    case 'quarter': {
      const q = Math.floor(now.getMonth() / 3) * 3;
      return new Date(now.getFullYear(), q, 1).getTime();
    }
    case 'fy': {
      // Indian fiscal year starts 1 April.
      const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1;
      return new Date(y, 3, 1).getTime();
    }
    case 'all':
    default:
      return -Infinity;
  }
}

export interface GeoInput {
  customers: Customer[];
  invoices: Invoice[];
  proposals: Proposal[];
  orders: SalesOrder[];
  items: Item[];
  users: User[];
}

/** Resolve which product categories are in scope given BU + product filters. */
function allowedCategories(filters: GeoFilters): {
  set: Set<ItemCategory>;
  active: boolean;
} {
  let cats = ALL_CATEGORIES;
  let active = false;
  if (filters.businessUnit !== 'all') {
    const bu = BUSINESS_UNITS.find((b) => b.key === filters.businessUnit);
    if (bu) {
      cats = cats.filter((c) => bu.categories.includes(c));
      active = true;
    }
  }
  if (filters.productType !== 'all') {
    cats = cats.filter((c) => c === filters.productType);
    active = true;
  }
  return { set: new Set(cats), active };
}

// ---------------------------------------------------------------------------
// Headline analytics (the choropleth rows)
// ---------------------------------------------------------------------------

export function buildGeoAnalytics(
  input: GeoInput,
  filters: GeoFilters,
  now: Date = new Date(),
): GeoAnalyticsResponse {
  const { customers, invoices, proposals, orders, items } = input;

  const itemsById = new Map(items.map((i) => [i.id, i]));
  const customersById = new Map(customers.map((c) => [c.id, c]));
  const { set: allowedCats, active: catFilterActive } =
    allowedCategories(filters);

  // Which customers pass the non-date scope filters (region / exec / segment)?
  const customerInScope = (c: Customer): boolean => {
    if (filters.region !== 'all' && regionOf(c.state) !== filters.region)
      return false;
    if (filters.salesExecId !== 'all' && c.ownerId !== filters.salesExecId)
      return false;
    if (filters.customerType !== 'all' && c.segment !== filters.customerType)
      return false;
    return true;
  };

  // Seed every in-region state so the map shows zero-data states too.
  const states: Record<string, StateAnalytics> = {};
  for (const state of Object.keys(REGION_BY_STATE)) {
    if (filters.region !== 'all' && REGION_BY_STATE[state] !== filters.region)
      continue;
    states[state] = {
      state,
      region: REGION_BY_STATE[state],
      revenue: 0,
      oil: 0,
      gas: 0,
      clients: 0,
      projects: 0,
      pendingOrders: 0,
      consumption: 0,
      growth: 0,
    };
  }

  const ensure = (rawState: string): StateAnalytics | null => {
    const state = normalizeStateName(rawState);
    return states[state] ?? null;
  };

  const from = rangeStart(filters.dateRange, now);
  const recentFrom = now.getTime() - 90 * DAY;
  const prevFrom = now.getTime() - 180 * DAY;

  // Track growth windows separately (trailing 90d vs the prior 90d).
  const growth: Record<string, { recent: number; prev: number }> = {};

  // --- Invoices → revenue, oil/gas volume, consumption, growth --------------
  for (const inv of invoices) {
    const customer = customersById.get(inv.customerId);
    if (!customer || !customerInScope(customer)) continue;
    const row = ensure(customer.state);
    if (!row) continue;

    let amount = 0;
    let oil = 0;
    let gas = 0;
    for (const li of inv.items) {
      const cat = itemsById.get(li.itemId)?.category;
      const inScope = cat ? allowedCats.has(cat) : !catFilterActive;
      if (!inScope) continue;
      amount += li.amount;
      const litres = toLitres(li.quantity, li.unit);
      if (cat && OIL_CATEGORIES.includes(cat)) oil += litres;
      else if (cat && GAS_CATEGORIES.includes(cat)) gas += litres;
    }
    if (amount === 0 && oil === 0 && gas === 0) continue;

    const ts = new Date(inv.invoiceDate).getTime();

    if (ts >= from) {
      row.revenue += amount;
      row.oil += oil;
      row.gas += gas;
      row.consumption += oil + gas;
    }

    // Growth momentum — independent of the selected date range.
    const g = (growth[row.state] ??= { recent: 0, prev: 0 });
    if (ts >= recentFrom) g.recent += amount;
    else if (ts >= prevFrom) g.prev += amount;
  }

  // --- Active clients -------------------------------------------------------
  for (const c of customers) {
    if (!c.active || !customerInScope(c)) continue;
    const row = ensure(c.state);
    if (row) row.clients += 1;
  }

  // --- Active projects (open proposals) ------------------------------------
  for (const p of proposals) {
    if (!PROPOSAL_ACTIVE_STATUSES.has(p.status)) continue;
    if (filters.salesExecId !== 'all' && p.createdById !== filters.salesExecId)
      continue;
    if (new Date(p.proposalDate).getTime() < from) continue;
    const row = ensure(p.state);
    if (row) row.projects += 1;
  }

  // --- Pending orders -------------------------------------------------------
  for (const o of orders) {
    if (!ORDER_PENDING_STATUSES.has(o.status)) continue;
    const customer = customersById.get(o.customerId);
    if (!customer || !customerInScope(customer)) continue;
    if (new Date(o.orderDate).getTime() < from) continue;
    const row = ensure(customer.state);
    if (row) row.pendingOrders += 1;
  }

  // --- Resolve growth percentages ------------------------------------------
  for (const [state, row] of Object.entries(states)) {
    const g = growth[state];
    if (!g) continue;
    row.growth =
      g.prev > 0
        ? ((g.recent - g.prev) / g.prev) * 100
        : g.recent > 0
          ? 100
          : 0;
    row.growth = Math.round(row.growth * 10) / 10;
  }

  return { states, generatedAt: now.toISOString() };
}

// ---------------------------------------------------------------------------
// Per-state detail (the slide-in panel)
// ---------------------------------------------------------------------------

export function buildStateDetail(
  stateName: string,
  input: GeoInput,
  filters: GeoFilters,
  now: Date = new Date(),
): StateDetail {
  const state = normalizeStateName(stateName);
  const { customers, invoices, items } = input;
  const itemsById = new Map(items.map((i) => [i.id, i]));
  const customersById = new Map(customers.map((c) => [c.id, c]));
  const { set: allowedCats, active: catFilterActive } =
    allowedCategories(filters);

  const base = buildGeoAnalytics(input, filters, now).states[state] ?? {
    state,
    region: regionOf(state),
    revenue: 0,
    oil: 0,
    gas: 0,
    clients: 0,
    projects: 0,
    pendingOrders: 0,
    consumption: 0,
    growth: 0,
  };

  const customerInScope = (c: Customer): boolean => {
    if (filters.salesExecId !== 'all' && c.ownerId !== filters.salesExecId)
      return false;
    if (filters.customerType !== 'all' && c.segment !== filters.customerType)
      return false;
    return true;
  };

  const from = rangeStart(filters.dateRange, now);

  const lineAmount = (inv: Invoice): number => {
    let amount = 0;
    for (const li of inv.items) {
      const cat = itemsById.get(li.itemId)?.category;
      const inScope = cat ? allowedCats.has(cat) : !catFilterActive;
      if (inScope) amount += li.amount;
    }
    return amount;
  };

  // Invoices for this state, in scope.
  const stateInvoices = invoices.filter((inv) => {
    const c = customersById.get(inv.customerId);
    return (
      c &&
      normalizeStateName(c.state) === state &&
      customerInScope(c) &&
      new Date(inv.invoiceDate).getTime() >= from
    );
  });

  // Recent transactions (newest first).
  const recentTransactions = [...stateInvoices]
    .sort(
      (a, b) =>
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime(),
    )
    .slice(0, 6)
    .map((inv) => ({
      id: inv.id,
      number: inv.number,
      customer: customersById.get(inv.customerId)?.companyName ?? 'Unknown',
      amount: inv.total,
      date: inv.invoiceDate,
      status: inv.status,
    }));

  // Top customers by in-scope billed revenue.
  const revenueByCustomer = new Map<string, number>();
  for (const inv of stateInvoices) {
    revenueByCustomer.set(
      inv.customerId,
      (revenueByCustomer.get(inv.customerId) ?? 0) + lineAmount(inv),
    );
  }
  const topCustomers = [...revenueByCustomer.entries()]
    .map(([id, revenue]) => {
      const c = customersById.get(id);
      return {
        id,
        name: c?.companyName ?? 'Unknown',
        revenue,
        segment: c?.segment ?? 'STANDARD',
      };
    })
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Trailing 8-month revenue trend (independent of the date-range filter).
  const trend: { month: string; revenue: number }[] = [];
  const monthFmt = new Intl.DateTimeFormat('en-IN', { month: 'short' });
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    trend.push({ month: monthFmt.format(d), revenue: 0 });
  }
  const trendStart = new Date(now.getFullYear(), now.getMonth() - 7, 1).getTime();
  for (const inv of invoices) {
    const c = customersById.get(inv.customerId);
    if (!c || normalizeStateName(c.state) !== state || !customerInScope(c))
      continue;
    const ts = new Date(inv.invoiceDate).getTime();
    if (ts < trendStart) continue;
    const d = new Date(inv.invoiceDate);
    const idx =
      (d.getFullYear() - now.getFullYear()) * 12 +
      (d.getMonth() - now.getMonth()) +
      7;
    const slot = trend[idx];
    if (slot) slot.revenue += lineAmount(inv);
  }

  // Category breakdown for the oil-vs-gas / mix donut.
  const catTotals = new Map<ItemCategory, number>();
  for (const inv of stateInvoices) {
    for (const li of inv.items) {
      const cat = itemsById.get(li.itemId)?.category;
      if (!cat) continue;
      if (catFilterActive && !allowedCats.has(cat)) continue;
      catTotals.set(cat, (catTotals.get(cat) ?? 0) + li.amount);
    }
  }
  const categoryBreakdown = [...catTotals.entries()]
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);

  return {
    ...base,
    topCustomers,
    recentTransactions,
    salesTrend: trend,
    categoryBreakdown,
  };
}

// ---------------------------------------------------------------------------
// Async facade — the seam where a real backend would plug in.
// ---------------------------------------------------------------------------

export async function fetchGeoAnalytics(
  input: GeoInput,
  filters: GeoFilters,
): Promise<GeoAnalyticsResponse> {
  // A live endpoint would be: return (await fetch('/api/analytics/geo', …)).json()
  return Promise.resolve(buildGeoAnalytics(input, filters));
}

/** Sales executives available for the filter dropdown. */
export function salesExecutives(users: User[]): User[] {
  return users
    .filter(
      (u) => u.role === 'SALES_EXECUTIVE' || u.role === 'SALES_MANAGER',
    )
    .filter((u) => u.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}

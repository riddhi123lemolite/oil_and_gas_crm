import {
  Activity,
  BarChart3,
  Building2,
  CheckSquare,
  Filter,
  Gauge,
  IndianRupee,
  Map,
  Package2,
  PieChart,
  Target,
  TrendingUp,
  Trophy,
  Users,
  type LucideIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// The dashboard widget registry.
//
// Every block on the Dashboard is declared here once. The store persists only
// what the admin explicitly changed (order + visibility overrides), so defaults
// stay role-aware and a widget added to this list later shows up for everyone
// without a migration — the same fallback approach `can()` uses in
// lib/permissions.ts.
// ---------------------------------------------------------------------------

export type WidgetId =
  // KPI strip
  | 'totalSales'
  | 'quantitySold'
  | 'avgRate'
  | 'margin'
  | 'myCustomers'
  | 'activeLeads'
  | 'wonDeals'
  // Sections
  | 'geoAnalytics'
  | 'employeePerformance'
  | 'performanceAnalytics'
  | 'leaderboard'
  | 'salesTrend'
  | 'salesByState'
  | 'productMix'
  | 'pipelineFunnel'
  | 'topCustomers'
  | 'recentActivity'
  | 'myTasks';

export type WidgetGroup = 'kpi' | 'section';

export interface WidgetDef {
  id: WidgetId;
  label: string;
  description: string;
  group: WidgetGroup;
  icon: LucideIcon;
  /** Premium analytics blocks — only ever rendered for ADMIN. */
  adminOnly?: boolean;
  /** Needs cost/margin visibility (ADMIN or SALES_MANAGER). */
  needsMargins?: boolean;
}

/** Role/permission context that decides what a given user may see. */
export interface WidgetContext {
  isAdmin: boolean;
  canSeeMargins: boolean;
}

/**
 * Declaration order is the default dashboard order. Keep KPIs first — the
 * Dashboard renders the two groups into separate containers.
 */
export const WIDGETS: WidgetDef[] = [
  {
    id: 'totalSales',
    label: 'Total Sales',
    description: 'Invoiced revenue for the selected period',
    group: 'kpi',
    icon: IndianRupee,
  },
  {
    id: 'quantitySold',
    label: 'Quantity Sold',
    description: 'Total volume in KL',
    group: 'kpi',
    icon: Package2,
  },
  {
    id: 'avgRate',
    label: 'Avg Rate',
    description: 'Blended realisation per KL',
    group: 'kpi',
    icon: Gauge,
  },
  {
    id: 'margin',
    label: 'Est. Margin',
    description: 'Estimated gross margin — managers and admins only',
    group: 'kpi',
    icon: TrendingUp,
    needsMargins: true,
  },
  {
    id: 'myCustomers',
    label: 'My Customers',
    description: 'Customer count — shown instead of margin when hidden',
    group: 'kpi',
    icon: Building2,
  },
  {
    id: 'activeLeads',
    label: 'Active Leads',
    description: 'Leads not yet won or lost',
    group: 'kpi',
    icon: Target,
  },
  {
    id: 'wonDeals',
    label: 'Won Deals (MTD)',
    description: 'Proposals won this month',
    group: 'kpi',
    icon: Trophy,
  },

  {
    id: 'geoAnalytics',
    label: 'Geographic Analytics',
    description: 'India map, hotspots and state drilldown',
    group: 'section',
    icon: Map,
    adminOnly: true,
  },
  {
    id: 'employeePerformance',
    label: 'Employee Performance',
    description: 'Monthly targets vs achievement per employee',
    group: 'section',
    icon: Users,
    adminOnly: true,
  },
  {
    id: 'performanceAnalytics',
    label: 'Performance Analytics',
    description: 'Team achievement trends and department breakdown',
    group: 'section',
    icon: BarChart3,
    adminOnly: true,
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    description: 'Top performers, ranked',
    group: 'section',
    icon: Trophy,
    adminOnly: true,
  },
  {
    id: 'salesTrend',
    label: 'Sales Trend',
    description: 'Monthly revenue line chart',
    group: 'section',
    icon: TrendingUp,
  },
  {
    id: 'salesByState',
    label: 'Sales by State',
    description: 'Compact India heatmap — click a state to filter',
    group: 'section',
    icon: Map,
  },
  {
    id: 'productMix',
    label: 'Product Mix',
    description: 'Revenue split by product category',
    group: 'section',
    icon: PieChart,
  },
  {
    id: 'pipelineFunnel',
    label: 'Pipeline Funnel',
    description: 'Lead stages from new to won',
    group: 'section',
    icon: Filter,
  },
  {
    id: 'topCustomers',
    label: 'Top Customers',
    description: 'Highest billed customers this period',
    group: 'section',
    icon: Building2,
  },
  {
    id: 'recentActivity',
    label: 'Recent Activity',
    description: 'Latest actions across the team',
    group: 'section',
    icon: Activity,
  },
  {
    id: 'myTasks',
    label: 'My Tasks Today',
    description: 'Your pending tasks, soonest first',
    group: 'section',
    icon: CheckSquare,
  },
];

export const WIDGET_BY_ID: Record<WidgetId, WidgetDef> = Object.fromEntries(
  WIDGETS.map((w) => [w.id, w]),
) as Record<WidgetId, WidgetDef>;

export const DEFAULT_ORDER: WidgetId[] = WIDGETS.map((w) => w.id);

/** Is this widget offered to the given user at all? */
export function isWidgetAvailable(id: WidgetId, ctx: WidgetContext): boolean {
  const w = WIDGET_BY_ID[id];
  if (!w) return false;
  if (w.adminOnly && !ctx.isAdmin) return false;
  if (w.needsMargins && !ctx.canSeeMargins) return false;
  return true;
}

/**
 * Visibility before the admin touches anything. `margin` and `myCustomers`
 * are deliberately complementary (the original dashboard showed one or the
 * other), and admins get `AdminGeoHero` instead of the compact state map —
 * but any of these can be overridden from the customiser.
 */
export function isWidgetVisibleByDefault(
  id: WidgetId,
  ctx: WidgetContext,
): boolean {
  switch (id) {
    case 'margin':
      return ctx.canSeeMargins;
    case 'myCustomers':
      return !ctx.canSeeMargins;
    case 'salesByState':
      return !ctx.isAdmin;
    default:
      return true;
  }
}

/**
 * Merge a persisted order with the registry: drop ids that no longer exist and
 * append any widget added since the layout was saved, keeping it near its
 * declared position rather than dumping it at the end.
 */
export function reconcileOrder(saved: WidgetId[]): WidgetId[] {
  const known = saved.filter((id) => id in WIDGET_BY_ID);
  const seen = new Set(known);
  const merged: WidgetId[] = [];
  let cursor = 0;

  for (const id of DEFAULT_ORDER) {
    if (seen.has(id)) continue;
    // Copy every saved widget that precedes this one by default, then slot the
    // newcomer in behind them.
    const defaultIndex = DEFAULT_ORDER.indexOf(id);
    while (cursor < known.length) {
      const candidate = known[cursor];
      if (candidate === undefined) break;
      if (DEFAULT_ORDER.indexOf(candidate) > defaultIndex) break;
      merged.push(candidate);
      cursor += 1;
    }
    merged.push(id);
  }
  merged.push(...known.slice(cursor));
  return merged;
}

/** Rewrite one group's positions inside the flat order, leaving others put. */
export function applyGroupOrder(
  flat: WidgetId[],
  group: WidgetGroup,
  groupOrder: WidgetId[],
): WidgetId[] {
  let i = 0;
  return flat.map((id) => {
    if (WIDGET_BY_ID[id]?.group !== group) return id;
    const next = groupOrder[i];
    i += 1;
    return next ?? id;
  });
}

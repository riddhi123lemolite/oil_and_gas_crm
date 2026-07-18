import {
  Fragment,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Package2,
  Gauge,
  TrendingUp,
  Target,
  Trophy,
  ArrowRight,
  Users,
  BarChart3,
  Building2,
  LayoutGrid,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { TrendChart } from '@/components/charts/TrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { IndiaMap } from '@/components/charts/IndiaMap';
import { SelectField } from '@/components/forms/SelectField';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { AdminGeoHero } from '@/components/dashboard/AdminGeoHero';
import { CustomizeDashboardDialog } from '@/components/dashboard/customize/CustomizeDashboardDialog';
import { CustomizeFab } from '@/components/dashboard/customize/CustomizeFab';
import { readStorage, writeStorage } from '@/lib/storage';
import { EmployeePerformanceSection } from '@/components/performance/EmployeePerformanceSection';
import { PerformanceCharts } from '@/components/performance/PerformanceCharts';
import { PerformanceLeaderboard } from '@/components/performance/PerformanceLeaderboard';
import { buildTeamPerformance } from '@/lib/performance/service';
import { useDataStore } from '@/stores/dataStore';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  isWidgetAvailable,
  isWidgetVisibleByDefault,
  sectionSpanFor,
  type WidgetId,
} from '@/lib/dashboard/widgets';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import {
  monthlySales,
  pipelineCounts,
  topBy,
  isWithinMonths,
} from '@/lib/analytics';
import { formatINRCompact, formatNumber, formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import { LEAD_STATUS, ITEM_CATEGORY_COLOR } from '@/lib/constants';
import type { ItemCategory } from '@/types';

/** Labelled divider that introduces each premium admin section. */
function SectionTitle({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: typeof Users;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="flex items-center gap-2.5 pt-1">
      <span className="flex size-8 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
        <Icon className="size-4" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold tracking-tight text-content">
          {title}
        </h2>
        {subtitle && <p className="text-xs text-content-muted">{subtitle}</p>}
      </div>
    </div>
  );
}

/** Set once the launcher has been used, so its attention sheen plays only once. */
const CUSTOMISE_SEEN_KEY = 'oilgas-crm:customise-seen';

const PERIODS = [
  { value: '1', label: 'This Month' },
  { value: '3', label: 'This Quarter' },
  { value: '12', label: 'This Financial Year' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, canSeeMargins, isAdmin } = useAuth();
  const { customerName, userName } = useLookups();
  const {
    invoices,
    leads,
    proposals,
    items,
    activities,
    tasks,
    customers,
    payments,
    users,
  } = useDataStore();

  const [period, setPeriod] = useState('12');
  const [stateFilter, setStateFilter] = useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  // The launcher's one-shot sheen plays until it has been used once.
  const [sheenSeen, setSheenSeen] = useState(true);
  useEffect(() => {
    setSheenSeen(readStorage(CUSTOMISE_SEEN_KEY, false));
  }, []);

  // Per-user dashboard layout. Re-init on user change so switching accounts (or
  // demo roles) loads that user's arrangement rather than the previous one's.
  const initLayout = useDashboardStore((s) => s.init);
  const order = useDashboardStore((s) => s.order);
  const visibility = useDashboardStore((s) => s.visibility);
  useEffect(() => {
    initLayout();
  }, [initLayout, user?.id]);

  const widgetCtx = useMemo(
    () => ({ isAdmin, canSeeMargins }),
    [isAdmin, canSeeMargins],
  );

  const visibleIds = useMemo(
    () =>
      order.filter(
        (id) =>
          isWidgetAvailable(id, widgetCtx) &&
          (visibility[id] ?? isWidgetVisibleByDefault(id, widgetCtx)),
      ),
    [order, visibility, widgetCtx],
  );
  const shown = useMemo(() => new Set(visibleIds), [visibleIds]);

  const months = Number(period);

  const filtered = useMemo(() => {
    const custInState = new Set(
      customers
        .filter((c) => !stateFilter || c.state === stateFilter)
        .map((c) => c.id),
    );
    const inv = invoices.filter(
      (i) =>
        isWithinMonths(i.invoiceDate, months) &&
        (!stateFilter || custInState.has(i.customerId)),
    );
    const lds = leads.filter((l) => !stateFilter || l.state === stateFilter);
    return { inv, lds };
  }, [invoices, leads, customers, months, stateFilter]);

  const stats = useMemo(() => {
    const totalSales = filtered.inv.reduce((s, i) => s + i.total, 0);
    // Normalise every line to kilolitres (litre lines ÷ 1000) so the total is
    // a single coherent volume rather than a mix of L and KL counts.
    const qty = filtered.inv.reduce(
      (s, i) => s + i.items.reduce((q, li) => q + (li.unit === 'L' ? li.quantity / 1000 : li.quantity), 0),
      0,
    );
    const margin = filtered.inv.reduce((s, i) => s + i.subtotal * 0.07, 0);
    const activeLeads = filtered.lds.filter(
      (l) => l.status !== 'WON' && l.status !== 'LOST',
    ).length;
    const wonDeals = proposals.filter(
      (p) => p.status === 'WON' && isWithinMonths(p.wonAt ?? p.createdAt, 1),
    ).length;
    const avgRate = qty > 0 ? totalSales / qty : 0;
    return { totalSales, qty, margin, activeLeads, wonDeals, avgRate };
  }, [filtered, proposals]);

  const trend = useMemo(() => {
    const series = monthlySales(filtered.inv, Math.max(months, 6));
    return series.map((m) => ({ month: m.month, sales: m.sales }));
  }, [filtered.inv, months]);

  const geoData = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inv of invoices) {
      const cust = customers.find((c) => c.id === inv.customerId);
      if (cust) map[cust.state] = (map[cust.state] ?? 0) + inv.total;
    }
    return map;
  }, [invoices, customers]);

  const productMix = useMemo(() => {
    const byCat = new Map<ItemCategory, number>();
    for (const inv of filtered.inv) {
      for (const li of inv.items) {
        const item = items.find((it) => it.id === li.itemId);
        if (item) {
          byCat.set(
            item.category,
            (byCat.get(item.category) ?? 0) + li.amount,
          );
        }
      }
    }
    return [...byCat.entries()].map(([cat, value]) => ({
      name: cat.replace('_', ' '),
      value,
      color: ITEM_CATEGORY_COLOR[cat],
    }));
  }, [filtered.inv, items]);

  const funnel = useMemo(() => {
    const counts = pipelineCounts(filtered.lds);
    return [
      { label: 'New', value: counts.NEW + counts.CONTACTED, color: '#2563EB' },
      { label: 'Qualified', value: counts.QUALIFIED, color: '#3B82F6' },
      { label: 'Proposal', value: counts.PROPOSAL_SENT, color: '#0F3D5C' },
      { label: 'Negotiation', value: counts.NEGOTIATION, color: '#E87722' },
      { label: 'Won', value: counts.WON, color: '#16A34A' },
    ];
  }, [filtered.lds]);

  const topCustomers = useMemo(
    () =>
      topBy(
        filtered.inv,
        (i) => i.customerId,
        (i) => i.total,
        5,
      ),
    [filtered.inv],
  );

  const recentActivity = useMemo(
    () =>
      [...activities]
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 8),
    [activities],
  );

  const todayTasks = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            t.assignedToId === user?.id &&
            t.status !== 'COMPLETED' &&
            t.status !== 'CANCELLED',
        )
        .sort((a, b) => (a.dueDate ?? '').localeCompare(b.dueDate ?? ''))
        .slice(0, 6),
    [tasks, user],
  );

  // Admin-only employee performance (skipped entirely for other roles).
  const perfInput = useMemo(
    () => ({ users, customers, invoices, payments }),
    [users, customers, invoices, payments],
  );
  const team = useMemo(
    () => (isAdmin ? buildTeamPerformance(perfInput) : null),
    [isAdmin, perfInput],
  );

  // ── Widget nodes ───────────────────────────────────────────────────
  // Each block is keyed by widget id so the layout decides what renders and in
  // what order. Building the map is cheap — the expensive work is already
  // memoised above.
  const kpiNodes: Partial<Record<WidgetId, ReactNode>> = {
    totalSales: (
      <KpiCard
        label="Total Sales"
        value={formatINRCompact(stats.totalSales)}
        icon={IndianRupee}
        delta={12.4}
        accent="#0F3D5C"
        spark={trend.map((t) => t.sales)}
        onClick={() => navigate('/reports/sales')}
      />
    ),
    quantitySold: (
      <KpiCard
        label="Quantity Sold"
        value={`${formatNumber(stats.qty)} KL`}
        icon={Package2}
        delta={8.1}
        accent="#E87722"
      />
    ),
    avgRate: (
      <KpiCard
        label="Avg Rate"
        value={formatINRCompact(stats.avgRate)}
        icon={Gauge}
        delta={2.3}
        accent="#0891B2"
      />
    ),
    margin: (
      <KpiCard
        label="Est. Margin"
        value={formatINRCompact(stats.margin)}
        icon={TrendingUp}
        delta={5.7}
        accent="#16A34A"
      />
    ),
    myCustomers: (
      <KpiCard
        label="My Customers"
        value={formatNumber(customers.length)}
        icon={Building2}
        accent="#16A34A"
      />
    ),
    activeLeads: (
      <KpiCard
        label="Active Leads"
        value={formatNumber(stats.activeLeads)}
        icon={Target}
        delta={-3.2}
        accent="#7C3AED"
        onClick={() => navigate('/leads')}
      />
    ),
    wonDeals: (
      <KpiCard
        label="Won Deals (MTD)"
        value={formatNumber(stats.wonDeals)}
        icon={Trophy}
        delta={18.0}
        accent="#C2410C"
        onClick={() => navigate('/proposals?status=WON')}
      />
    ),
  };

  const sectionNodes: Partial<Record<WidgetId, ReactNode>> = {
    geoAnalytics: (
      <>
        <SectionTitle
          icon={TrendingUp}
          title="Geographic Analytics"
          subtitle="Where your business lives — customers, hotspots and sales spread"
        />
        <AdminGeoHero />
      </>
    ),
    employeePerformance: team ? (
      <>
        <SectionTitle
          icon={Users}
          title="Employee Performance"
          subtitle="Monthly targets vs achievement across every team"
        />
        <EmployeePerformanceSection team={team} />
      </>
    ) : null,
    performanceAnalytics: team ? (
      <>
        <SectionTitle
          icon={BarChart3}
          title="Performance Analytics"
          subtitle="Team achievement trends and departmental breakdown"
        />
        <PerformanceCharts team={team} input={perfInput} />
      </>
    ) : null,
    leaderboard: team ? (
      <>
        <SectionTitle icon={Trophy} title="Leaderboard" subtitle="Top performers, ranked" />
        <GlassCard className="p-4 sm:p-5">
          <PerformanceLeaderboard employees={team.employees} />
        </GlassCard>
      </>
    ) : null,
    salesTrend: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Sales Trend</CardTitle>
          <span className="text-xs text-content-muted">Monthly revenue (₹)</span>
        </CardHeader>
        <CardContent>
          <TrendChart
            data={trend}
            xKey="month"
            series={[{ key: 'sales', name: 'Sales', color: '#0F3D5C' }]}
            valueFormatter={formatINRCompact}
          />
        </CardContent>
      </Card>
    ),
    salesByState: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Sales by State</CardTitle>
          <span className="text-xs text-content-muted">Click to filter</span>
        </CardHeader>
        <CardContent>
          <IndiaMap
            data={geoData}
            selected={stateFilter}
            onSelect={setStateFilter}
            valueFormatter={formatINRCompact}
          />
        </CardContent>
      </Card>
    ),
    productMix: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Product Mix</CardTitle>
        </CardHeader>
        <CardContent>
          {productMix.length > 0 ? (
            <DonutChart
              data={productMix}
              centerLabel="Categories"
              centerValue={String(productMix.length)}
              valueFormatter={formatINRCompact}
            />
          ) : (
            <p className="py-8 text-center text-sm text-content-muted">
              No sales in this period.
            </p>
          )}
        </CardContent>
      </Card>
    ),
    pipelineFunnel: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Pipeline Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <FunnelChart stages={funnel} />
        </CardContent>
      </Card>
    ),
    topCustomers: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Top Customers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {topCustomers.map((c, i) => (
            <div key={c.label} className="flex items-center gap-2.5">
              <span className="num w-4 text-sm font-semibold text-content-muted">
                {i + 1}
              </span>
              <EntityAvatar name={customerName(c.label)} size="xs" />
              <span className="truncate text-sm text-content-secondary">
                {customerName(c.label)}
              </span>
              <span className="num ml-auto text-sm font-semibold text-content">
                {formatINRCompact(c.value)}
              </span>
            </div>
          ))}
          {topCustomers.length === 0 && (
            <p className="py-6 text-center text-sm text-content-muted">
              No data for this period.
            </p>
          )}
        </CardContent>
      </Card>
    ),
    recentActivity: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity.map((a) => (
            <div key={a.id} className="flex items-start gap-3">
              <EntityAvatar name={userName(a.userId)} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-content">
                  <span className="font-medium">{userName(a.userId)}</span>{' '}
                  <span className="text-content-secondary">{a.title}</span>
                </p>
                {a.description && (
                  <p className="truncate text-xs text-content-muted">
                    {a.description}
                  </p>
                )}
              </div>
              <span className="shrink-0 text-xs text-content-muted">
                {formatRelative(a.createdAt)}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    ),
    myTasks: (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>My Tasks Today</CardTitle>
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center gap-1 text-xs font-medium text-brand-secondary hover:underline"
          >
            All <ArrowRight className="size-3" />
          </button>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayTasks.length === 0 ? (
            <p className="py-6 text-center text-sm text-content-muted">
              No pending tasks. You're all caught up.
            </p>
          ) : (
            todayTasks.map((t) => (
              <button
                key={t.id}
                onClick={() => navigate('/tasks')}
                className="flex w-full items-center gap-2 rounded-md border border-line p-2 text-left transition-colors hover:bg-muted"
              >
                <span className="size-2 shrink-0 rounded-full bg-brand-secondary" />
                <span className="truncate text-sm text-content-secondary">
                  {t.title}
                </span>
                <StatusBadge
                  label={t.priority}
                  tone={t.priority === 'URGENT' ? 'danger' : 'neutral'}
                  size="sm"
                />
              </button>
            ))
          )}
        </CardContent>
      </Card>
    ),
  };

  // Column spans come from the shared registry, so the customiser's live
  // preview and this grid can never disagree.
  const SPAN_CLASS: Record<1 | 2 | 3, string> = {
    1: 'lg:col-span-1',
    2: 'lg:col-span-2',
    3: 'lg:col-span-3',
  };

  const visibleKpis = visibleIds.filter((id) => id in kpiNodes);
  const visibleSections = visibleIds.filter((id) => id in sectionNodes);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0] ?? 'there'}`}
        description="Here's how your sales operation is performing."
        icon={<TrendingUp />}
        actions={
          <div className="w-44">
            <SelectField value={period} onChange={setPeriod} options={PERIODS} />
          </div>
        }
      />

      {stateFilter && (
        <div className="flex items-center gap-2 rounded-md border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-1.5 text-sm">
          <span className="font-medium text-content">
            Filtered by state: {stateFilter}
          </span>
          <button
            onClick={() => setStateFilter(null)}
            className="ml-auto font-medium text-brand-secondary hover:underline"
          >
            Clear
          </button>
        </div>
      )}

      {/* KPI strip. Cards are direct grid children (no wrapper div) so the
          grid's default stretch keeps every card the same height as the
          tallest — the one carrying a sparkline. */}
      {visibleKpis.length > 0 && (
        <div
          // Column count follows how many cards are actually shown, so the strip
          // is always exactly one row on wide screens — a fixed 6 wrapped the
          // 7th card onto a second row.
          className="grid grid-cols-2 gap-3 lg:grid-cols-[repeat(var(--kpi-cols),minmax(0,1fr))]"
          style={{ '--kpi-cols': visibleKpis.length } as CSSProperties}
        >
          {visibleKpis.map((id) => (
            <Fragment key={id}>{kpiNodes[id]}</Fragment>
          ))}
        </div>
      )}

      {/* Sections — order and visibility come from the admin's saved layout. */}
      {visibleSections.length > 0 && (
        <div className="grid gap-4 lg:grid-cols-3">
          {visibleSections.map((id) => (
            <div
              key={id}
              className={cn(
                'min-w-0 space-y-4',
                SPAN_CLASS[sectionSpanFor(id, shown.has('salesByState'))],
              )}
            >
              {sectionNodes[id]}
            </div>
          ))}
        </div>
      )}

      {visibleIds.length === 0 && (
        <EmptyState
          icon={LayoutGrid}
          title="Your dashboard is empty"
          description="Every widget is hidden. Turn a few back on to see your numbers again."
          actionLabel={isAdmin ? 'Customise dashboard' : undefined}
          onAction={isAdmin ? () => setCustomizeOpen(true) : undefined}
        />
      )}

      <p className="pt-1 text-center text-xs text-content-muted">
        {LEAD_STATUS.NEW.label} leads update live · Demo data resets from
        Settings → System
      </p>

      {isAdmin && (
        <>
          <CustomizeFab
            onClick={() => {
              setCustomizeOpen(true);
              if (!sheenSeen) {
                writeStorage(CUSTOMISE_SEEN_KEY, true);
                setSheenSeen(true);
              }
            }}
            hidden={customizeOpen}
            showSheen={!sheenSeen}
          />
          <CustomizeDashboardDialog
            open={customizeOpen}
            onOpenChange={setCustomizeOpen}
            ctx={widgetCtx}
          />
        </>
      )}
    </div>
  );
}

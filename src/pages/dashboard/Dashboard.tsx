import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee,
  Package2,
  Gauge,
  TrendingUp,
  Target,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { TrendChart } from '@/components/charts/TrendChart';
import { DonutChart } from '@/components/charts/DonutChart';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { IndiaMap } from '@/components/charts/IndiaMap';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import {
  monthlySales,
  pipelineCounts,
  topBy,
  isWithinMonths,
} from '@/lib/analytics';
import { formatINRCompact, formatNumber, formatRelative } from '@/lib/format';
import { LEAD_STATUS, ITEM_CATEGORY_COLOR } from '@/lib/constants';
import type { ItemCategory } from '@/types';

const PERIODS = [
  { value: '1', label: 'This Month' },
  { value: '3', label: 'This Quarter' },
  { value: '12', label: 'This Financial Year' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, canSeeMargins } = useAuth();
  const { customerName, userName } = useLookups();
  const {
    invoices,
    leads,
    proposals,
    items,
    activities,
    tasks,
    customers,
  } = useDataStore();

  const [period, setPeriod] = useState('12');
  const [stateFilter, setStateFilter] = useState<string | null>(null);

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

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome back, ${user?.name.split(' ')[0] ?? 'there'}`}
        description="Here's how your sales operation is performing."
        icon={<TrendingUp />}
        actions={
          <div className="w-44">
            <SelectField
              value={period}
              onChange={setPeriod}
              options={PERIODS}
            />
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

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard
          label="Total Sales"
          value={formatINRCompact(stats.totalSales)}
          icon={IndianRupee}
          delta={12.4}
          accent="#0F3D5C"
          spark={trend.map((t) => t.sales)}
          onClick={() => navigate('/reports/sales')}
        />
        <KpiCard
          label="Quantity Sold"
          value={`${formatNumber(stats.qty)} KL`}
          icon={Package2}
          delta={8.1}
          accent="#E87722"
        />
        <KpiCard
          label="Avg Rate"
          value={formatINRCompact(stats.avgRate)}
          icon={Gauge}
          delta={2.3}
          accent="#0891B2"
        />
        {canSeeMargins ? (
          <KpiCard
            label="Est. Margin"
            value={formatINRCompact(stats.margin)}
            icon={TrendingUp}
            delta={5.7}
            accent="#16A34A"
          />
        ) : (
          <KpiCard
            label="My Customers"
            value={formatNumber(customers.length)}
            icon={TrendingUp}
            accent="#16A34A"
          />
        )}
        <KpiCard
          label="Active Leads"
          value={formatNumber(stats.activeLeads)}
          icon={Target}
          delta={-3.2}
          accent="#7C3AED"
          onClick={() => navigate('/leads')}
        />
        <KpiCard
          label="Won Deals (MTD)"
          value={formatNumber(stats.wonDeals)}
          icon={Trophy}
          delta={18.0}
          accent="#C2410C"
          onClick={() => navigate('/proposals?status=WON')}
        />
      </div>

      {/* Trend + Geo */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Trend</CardTitle>
            <span className="text-xs text-content-muted">
              Monthly revenue (₹)
            </span>
          </CardHeader>
          <CardContent>
            <TrendChart
              data={trend}
              xKey="month"
              series={[
                { key: 'sales', name: 'Sales', color: '#0F3D5C' },
              ]}
              valueFormatter={formatINRCompact}
            />
          </CardContent>
        </Card>
        <Card>
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
      </div>

      {/* Donut + Funnel + Top customers */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnel} />
          </CardContent>
        </Card>
        <Card>
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
      </div>

      {/* Activity + Tasks */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
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
        <Card>
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
      </div>

      <p className="pt-1 text-center text-xs text-content-muted">
        {LEAD_STATUS.NEW.label} leads update live · Demo data resets from
        Settings → System
      </p>
    </div>
  );
}

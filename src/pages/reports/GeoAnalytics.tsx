import { useEffect, useMemo, useState } from 'react';
import { Globe2, Banknote, Users, Gauge } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/shared/KpiCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { useCssVar } from '@/hooks/useCssVar';
import { useDataStore } from '@/stores/dataStore';
import {
  formatINRCompact,
  formatKL,
  formatNumber,
} from '@/lib/format';
import { GEO_METRICS } from '@/lib/geo/metrics';
import {
  buildGeoAnalytics,
  buildStateDetail,
  type GeoInput,
} from '@/lib/geo/analyticsService';
import {
  DEFAULT_GEO_FILTERS,
  type GeoFilters as GeoFiltersState,
  type GeoMetricKey,
} from '@/lib/geo/types';
import { GeoFilters } from '@/components/geo/GeoFilters';
import { MetricPicker } from '@/components/geo/MetricPicker';
import { IndiaChoropleth } from '@/components/geo/IndiaChoropleth';
import { MapLegend } from '@/components/geo/MapLegend';
import { MapTooltip } from '@/components/geo/MapTooltip';
import { StatePanel } from '@/components/geo/StatePanel';
import type { StateAnalytics } from '@/lib/geo/types';

export default function GeoAnalytics() {
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const proposals = useDataStore((s) => s.proposals);
  const orders = useDataStore((s) => s.orders);
  const items = useDataStore((s) => s.items);
  const users = useDataStore((s) => s.users);

  const [filters, setFilters] = useState<GeoFiltersState>(DEFAULT_GEO_FILTERS);
  const [metric, setMetric] = useState<GeoMetricKey>('revenue');
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{
    data: StateAnalytics | null;
    x: number;
    y: number;
  }>({ data: null, x: 0, y: 0 });

  const lowColor = useCssVar('--bg-muted', '#f4f6f8');
  const lineColor = useCssVar('--border', '#e5e9ef');

  const input: GeoInput = useMemo(
    () => ({ customers, invoices, proposals, orders, items, users }),
    [customers, invoices, proposals, orders, items, users],
  );

  const analytics = useMemo(
    () => buildGeoAnalytics(input, filters),
    [input, filters],
  );

  const states = analytics.states;
  const activeMetric = GEO_METRICS[metric];

  const max = useMemo(() => {
    let m = 0;
    for (const row of Object.values(states)) {
      const v = row[metric];
      if (v > m) m = v;
    }
    return m;
  }, [states, metric]);

  // Ranking for the side list.
  const ranked = useMemo(
    () =>
      Object.values(states)
        .filter((r) => r[metric] > 0)
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, 10),
    [states, metric],
  );

  // National summary.
  const totals = useMemo(() => {
    let revenue = 0;
    let clients = 0;
    let consumption = 0;
    let covered = 0;
    for (const r of Object.values(states)) {
      revenue += r.revenue;
      clients += r.clients;
      consumption += r.consumption;
      if (r.revenue > 0) covered += 1;
    }
    return { revenue, clients, consumption, covered };
  }, [states]);

  const detail = useMemo(
    () => (selected ? buildStateDetail(selected, input, filters) : null),
    [selected, input, filters],
  );

  // Drop a selection that falls out of scope when filters change.
  useEffect(() => {
    if (selected && !states[selected]) setSelected(null);
  }, [selected, states]);

  const isDirty =
    JSON.stringify(filters) !== JSON.stringify(DEFAULT_GEO_FILTERS);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Geographic Analytics"
        description="Interactive state-wise view of revenue, distribution and pipeline"
        icon={<Globe2 />}
      />

      {/* National summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <KpiCard
          label="Total Revenue"
          value={formatINRCompact(totals.revenue)}
          icon={Banknote}
          accent={GEO_METRICS.revenue.hue}
          deltaLabel={`${totals.covered} states active`}
        />
        <KpiCard
          label="Active Clients"
          value={formatNumber(totals.clients)}
          icon={Users}
          accent={GEO_METRICS.clients.hue}
          deltaLabel="across India"
        />
        <KpiCard
          label="Total Consumption"
          value={formatKL(totals.consumption)}
          icon={Gauge}
          accent={GEO_METRICS.consumption.hue}
          deltaLabel="oil + gas volume"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <GeoFilters
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            onReset={() => setFilters(DEFAULT_GEO_FILTERS)}
            users={users}
            isDirty={isDirty}
          />
        </CardContent>
      </Card>

      {/* Map + ranking */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-col items-stretch gap-3 sm:flex-row sm:items-center">
            <CardTitle>Colour by {activeMetric.label}</CardTitle>
            <MetricPicker value={metric} onChange={setMetric} />
          </CardHeader>
          <CardContent className="space-y-4">
            <IndiaChoropleth
              data={states}
              metric={activeMetric}
              max={max}
              lowColor={lowColor}
              lineColor={lineColor}
              selected={selected}
              onSelect={setSelected}
              onHover={(data, x, y) => setHover({ data, x, y })}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="sm:max-w-xs sm:flex-1">
                <MapLegend metric={activeMetric} low={lowColor} max={max} />
              </div>
              <p className="text-xs text-content-muted">
                Hover a state for details · click to drill in · drag to pan when
                zoomed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ranking */}
        <Card>
          <CardHeader>
            <CardTitle>Top States · {activeMetric.short}</CardTitle>
          </CardHeader>
          <CardContent>
            {ranked.length ? (
              <div className="space-y-1">
                {ranked.map((r, i) => (
                  <button
                    key={r.state}
                    onClick={() => setSelected(r.state)}
                    className="flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted"
                  >
                    <span className="num w-5 shrink-0 text-content-muted">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-content-secondary">
                        {r.state}
                      </div>
                      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${max > 0 ? (r[metric] / max) * 100 : 0}%`,
                            backgroundColor: activeMetric.hue,
                          }}
                        />
                      </div>
                    </div>
                    <span className="num shrink-0 font-medium text-content">
                      {activeMetric.format(r[metric])}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState compact title="No data for this metric" />
            )}
          </CardContent>
        </Card>
      </div>

      <MapTooltip data={hover.data} x={hover.x} y={hover.y} />
      <StatePanel detail={detail} onClose={() => setSelected(null)} />
    </div>
  );
}

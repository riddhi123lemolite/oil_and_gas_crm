import { useMemo, useState } from 'react';
import { Globe2, Users, MapPin, Flame } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { AnimatedCounter } from './AnimatedCounter';
import { useCssVar } from '@/hooks/useCssVar';
import { useDataStore } from '@/stores/dataStore';
import { formatNumber } from '@/lib/format';
import { GEO_METRICS } from '@/lib/geo/metrics';
import { buildGeoAnalytics, buildStateDetail, type GeoInput } from '@/lib/geo/analyticsService';
import { DEFAULT_GEO_FILTERS, type GeoMetricKey, type StateAnalytics } from '@/lib/geo/types';
import { regionOf, REGIONS } from '@/lib/geo/regions';
import { IndiaChoropleth } from '@/components/geo/IndiaChoropleth';
import { MapLegend } from '@/components/geo/MapLegend';
import { MapTooltip } from '@/components/geo/MapTooltip';
import { MetricPicker } from '@/components/geo/MetricPicker';
import { StatePanel } from '@/components/geo/StatePanel';

const REF_NOW = new Date('2026-06-30');
const REG_WINDOW_DAYS = 90;

function RailStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-base/50 p-2.5">
      <span
        className="flex size-8 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1f`, color: accent }}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wide text-content-muted">
          {label}
        </div>
        <div className="num truncate text-base font-bold text-content">{value}</div>
      </div>
    </div>
  );
}

export function AdminGeoHero() {
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const proposals = useDataStore((s) => s.proposals);
  const orders = useDataStore((s) => s.orders);
  const items = useDataStore((s) => s.items);
  const users = useDataStore((s) => s.users);

  const [metric, setMetric] = useState<GeoMetricKey>('revenue');
  const [selected, setSelected] = useState<string | null>(null);
  const [hover, setHover] = useState<{ data: StateAnalytics | null; x: number; y: number }>({
    data: null,
    x: 0,
    y: 0,
  });

  const lowColor = useCssVar('--bg-muted', '#f4f6f8');
  const lineColor = useCssVar('--border', '#e5e9ef');

  const input: GeoInput = useMemo(
    () => ({ customers, invoices, proposals, orders, items, users }),
    [customers, invoices, proposals, orders, items, users],
  );

  const states = useMemo(
    () => buildGeoAnalytics(input, DEFAULT_GEO_FILTERS).states,
    [input],
  );
  const activeMetric = GEO_METRICS[metric];

  const max = useMemo(() => {
    let m = 0;
    for (const r of Object.values(states)) if (r[metric] > m) m = r[metric];
    return m;
  }, [states, metric]);

  const hotspots = useMemo(
    () =>
      Object.values(states)
        .filter((r) => r[metric] > 0)
        .sort((a, b) => b[metric] - a[metric])
        .slice(0, 5),
    [states, metric],
  );

  const totalCustomers = customers.length;
  const activeLocations = useMemo(
    () => Object.values(states).filter((r) => r.clients > 0).length,
    [states],
  );

  // Recent registrations grouped by region (trailing window).
  const recentByRegion = useMemo(() => {
    const cutoff = REF_NOW.getTime() - REG_WINDOW_DAYS * 86_400_000;
    const counts = new Map<string, number>();
    for (const c of customers) {
      if (new Date(c.createdAt).getTime() < cutoff) continue;
      const region = regionOf(c.state);
      if (region) counts.set(region, (counts.get(region) ?? 0) + 1);
    }
    return REGIONS.map((r) => ({ region: r, count: counts.get(r) ?? 0 })).filter(
      (r) => r.count > 0,
    );
  }, [customers]);
  const recentMax = Math.max(1, ...recentByRegion.map((r) => r.count));

  const detail = useMemo(
    () => (selected ? buildStateDetail(selected, input, DEFAULT_GEO_FILTERS) : null),
    [selected, input],
  );

  return (
    <GlassCard className="p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-400 text-white">
            <Globe2 className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-bold tracking-tight text-content">
              Geographic Intelligence
            </h2>
            <p className="text-xs text-content-muted">
              Live customer distribution, hotspots & sales spread across India
            </p>
          </div>
        </div>
        <MetricPicker value={metric} onChange={setMetric} />
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-3">
        {/* Map */}
        <div className="lg:col-span-2">
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
          <div className="mt-2">
            <MapLegend metric={activeMetric} low={lowColor} max={max} />
          </div>
        </div>

        {/* Executive rail */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 lg:grid-cols-1">
            <RailStat
              icon={Users}
              label="Total Customers"
              value={<AnimatedCounter value={totalCustomers} format={(n) => formatNumber(n)} />}
              accent={GEO_METRICS.clients.hue}
            />
            <RailStat
              icon={MapPin}
              label="Active Locations"
              value={<AnimatedCounter value={activeLocations} format={(n) => formatNumber(n)} />}
              accent={GEO_METRICS.consumption.hue}
            />
            <RailStat
              icon={Flame}
              label="Top Hotspot"
              value={hotspots[0]?.state ?? '—'}
              accent={GEO_METRICS.revenue.hue}
            />
          </div>

          <div>
            <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-content-muted">
              Hotspots · {activeMetric.short}
            </h3>
            <div className="space-y-1.5">
              {hotspots.map((r) => (
                <button
                  key={r.state}
                  onClick={() => setSelected(r.state)}
                  className="flex w-full items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm transition-colors hover:bg-muted"
                >
                  <span className="min-w-0 flex-1 truncate text-content-secondary">
                    {r.state}
                  </span>
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${max > 0 ? (r[metric] / max) * 100 : 0}%`,
                        backgroundColor: activeMetric.hue,
                      }}
                    />
                  </div>
                  <span className="num shrink-0 text-xs font-semibold text-content">
                    {activeMetric.format(r[metric])}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {recentByRegion.length > 0 && (
            <div>
              <h3 className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-content-muted">
                Recent Registrations · by region
              </h3>
              <div className="space-y-1.5">
                {recentByRegion.map((r) => (
                  <div key={r.region} className="flex items-center gap-2 text-sm">
                    <span className="w-16 shrink-0 text-content-secondary">{r.region}</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-brand-accent"
                        style={{ width: `${(r.count / recentMax) * 100}%` }}
                      />
                    </div>
                    <span className="num w-6 shrink-0 text-right text-xs font-semibold text-content">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <MapTooltip data={hover.data} x={hover.x} y={hover.y} />
      <StatePanel detail={detail} onClose={() => setSelected(null)} />
    </GlassCard>
  );
}

import { TrendingUp, Fuel, LineChart as LineChartIcon } from 'lucide-react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { MarketTicker } from '@/components/portal/MarketTicker';
import { useLiveMarket } from '@/hooks/useLiveMarket';

export default function PortalMarket() {
  const { oil, fuel } = useLiveMarket();
  const brent = oil.find((o) => o.name === 'Brent Crude');
  const trend = (brent?.history ?? []).map((v, i) => ({ i, v }));

  return (
    <div className="space-y-6">
      <PageHeader title="Live Market" description="Auto-refreshing oil & gas benchmarks and retail fuel prices." icon={<TrendingUp />} />

      <section id="oil">
        <SectionLabel icon={<TrendingUp className="size-4" />} title="Oil & gas benchmarks" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {oil.map((t) => (
            <MarketTicker key={t.name} t={t} highlight={t.name === 'Brent Crude'} />
          ))}
        </div>
      </section>

      <section id="fuel">
        <SectionLabel icon={<Fuel className="size-4" />} title="Current fuel prices (India)" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {fuel.map((t) => (
            <MarketTicker key={t.name} t={t} />
          ))}
        </div>
      </section>

      <section id="trends">
        <SectionLabel icon={<LineChartIcon className="size-4" />} title="Brent crude — intraday trend" />
        <div className="card p-4">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend} margin={{ left: -10, right: 8, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="i" tick={false} stroke="var(--text-muted)" />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={(v) => `$${Number(v).toFixed(1)}`} />
                <Tooltip formatter={(v: number) => `$${v.toFixed(2)}/bbl`} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Line type="monotone" dataKey="v" stroke="#E87722" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-content-muted">Indicative simulated feed — connect a commodities API for live rates.</p>
        </div>
      </section>
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-brand-secondary">{icon}</span>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
    </div>
  );
}

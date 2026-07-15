import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowDownRight,
  ArrowUpRight,
  Briefcase,
  ClipboardList,
  Gauge,
  MapPin,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { DonutChart } from '@/components/charts/DonutChart';
import { TrendChart } from '@/components/charts/TrendChart';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { CUSTOMER_SEGMENT, INVOICE_STATUS } from '@/lib/constants';
import { formatKL, formatNumber, formatDate } from '@/lib/format';
import { GEO_METRICS } from '@/lib/geo/metrics';
import { cn } from '@/lib/utils';
import type { StateDetail } from '@/lib/geo/types';

interface StatePanelProps {
  detail: StateDetail | null;
  onClose: () => void;
}

function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-line bg-base p-3">
      <div className="flex items-center gap-1.5 text-content-muted">
        <span
          className="flex size-5 items-center justify-center rounded"
          style={{ backgroundColor: `${accent}1f`, color: accent }}
        >
          <Icon className="size-3" strokeWidth={1.75} />
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wide">
          {label}
        </span>
      </div>
      <div className="num mt-1.5 text-lg font-semibold text-content">
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 font-display text-sm font-semibold text-content">
        {title}
      </h4>
      {children}
    </div>
  );
}

export function StatePanel({ detail, onClose }: StatePanelProps) {
  return (
    <AnimatePresence>
      {detail && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[1px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-line bg-surface shadow-pop"
            role="dialog"
            aria-label={`${detail.state} analytics`}
          >
            {/* Header */}
            <div className="flex items-start justify-between border-b border-line px-5 py-4">
              <div>
                {detail.region && (
                  <span className="text-xs font-medium uppercase tracking-wide text-brand-secondary">
                    {detail.region} region
                  </span>
                )}
                <h3 className="font-display text-2xl font-bold tracking-tight text-content">
                  {detail.state}
                </h3>
                <div
                  className={cn(
                    'mt-1 inline-flex items-center gap-1 text-sm font-semibold',
                    detail.growth >= 0 ? 'text-success' : 'text-danger',
                  )}
                >
                  {detail.growth >= 0 ? (
                    <ArrowUpRight className="size-4" />
                  ) : (
                    <ArrowDownRight className="size-4" />
                  )}
                  {Math.abs(detail.growth).toFixed(1)}%
                  <span className="font-normal text-content-muted">
                    momentum
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded p-1.5 text-content-muted hover:bg-muted hover:text-content"
                aria-label="Close panel"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
              {/* KPIs — quantities only */}
              <div className="grid grid-cols-2 gap-2.5">
                <StatTile
                  icon={Gauge}
                  label="Consumption"
                  value={formatKL(detail.consumption)}
                  accent={GEO_METRICS.consumption.hue}
                />
                <StatTile
                  icon={GEO_METRICS.oil.icon}
                  label="Oil : Gas"
                  value={`${formatKL(detail.oil)} / ${formatKL(detail.gas)}`}
                  accent={GEO_METRICS.oil.hue}
                />
                <StatTile
                  icon={Users}
                  label="Active clients"
                  value={formatNumber(detail.clients)}
                  accent={GEO_METRICS.clients.hue}
                />
                <StatTile
                  icon={Briefcase}
                  label="Active projects"
                  value={formatNumber(detail.projects)}
                  accent={GEO_METRICS.projects.hue}
                />
                <StatTile
                  icon={ClipboardList}
                  label="Pending orders"
                  value={formatNumber(detail.pendingOrders)}
                  accent={GEO_METRICS.pendingOrders.hue}
                />
                <StatTile
                  icon={MapPin}
                  label="Cities"
                  value={formatNumber(detail.cityBreakdown.length)}
                  accent={GEO_METRICS.clients.hue}
                />
              </div>

              {/* Oil vs Gas distribution */}
              <Section title="Oil vs Gas Distribution">
                {detail.oil + detail.gas > 0 ? (
                  <DonutChart
                    height={180}
                    centerLabel="Total"
                    centerValue={formatKL(detail.oil + detail.gas)}
                    valueFormatter={formatKL}
                    data={[
                      {
                        name: 'Oil & Fuel',
                        value: detail.oil,
                        color: GEO_METRICS.oil.hue,
                      },
                      {
                        name: 'Gas & Petrochem',
                        value: detail.gas,
                        color: GEO_METRICS.gas.hue,
                      },
                    ]}
                  />
                ) : (
                  <EmptyState compact title="No distribution in range" />
                )}
              </Section>

              {/* City-wise distribution within the state */}
              <Section title="City-wise Distribution">
                {detail.cityBreakdown.length ? (
                  <div className="space-y-1.5">
                    {detail.cityBreakdown.map((c) => {
                      const maxCity = detail.cityBreakdown[0]?.consumption || 1;
                      return (
                        <div key={c.city} className="flex items-center gap-2 text-sm">
                          <span className="w-24 shrink-0 truncate text-content-secondary">
                            {c.city}
                          </span>
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: `${(c.consumption / maxCity) * 100}%`,
                                backgroundColor: GEO_METRICS.consumption.hue,
                              }}
                            />
                          </div>
                          <span className="num w-16 shrink-0 text-right text-xs font-semibold text-content">
                            {formatKL(c.consumption)}
                          </span>
                          <span className="num w-10 shrink-0 text-right text-[10px] text-content-muted">
                            {c.clients}👤
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState compact title="No city data in range" />
                )}
              </Section>

              {/* Volume trend */}
              <Section title="Volume Trend">
                <TrendChart
                  height={180}
                  data={detail.salesTrend as unknown as Record<
                    string,
                    string | number
                  >[]}
                  xKey="month"
                  valueFormatter={formatKL}
                  series={[
                    {
                      key: 'volume',
                      name: 'Volume',
                      color: GEO_METRICS.consumption.hue,
                    },
                  ]}
                />
              </Section>

              {/* Top customers */}
              <Section title="Top Customers">
                {detail.topCustomers.length ? (
                  <div className="space-y-1.5">
                    {detail.topCustomers.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2 text-sm"
                      >
                        <span className="flex-1 truncate text-content-secondary">
                          {c.name}
                        </span>
                        <StatusBadge def={CUSTOMER_SEGMENT[c.segment]} />
                        <span className="num shrink-0 font-medium text-content">
                          {formatKL(c.volume)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState compact title="No customers in range" />
                )}
              </Section>

              {/* Recent transactions */}
              <Section title="Recent Transactions">
                {detail.recentTransactions.length ? (
                  <div className="space-y-1.5">
                    {detail.recentTransactions.map((t) => (
                      <div
                        key={t.id}
                        className="flex items-center gap-2 rounded-md border border-line px-2.5 py-2 text-sm"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="num truncate text-xs text-content-muted">
                            {t.number}
                          </div>
                          <div className="truncate text-content-secondary">
                            {t.customer}
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="num font-medium text-content">
                            {formatKL(t.volume)}
                          </div>
                          <div className="text-[10px] text-content-muted">
                            {formatDate(t.date)}
                          </div>
                        </div>
                        <StatusBadge def={INVOICE_STATUS[t.status]} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState compact title="No transactions in range" />
                )}
              </Section>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

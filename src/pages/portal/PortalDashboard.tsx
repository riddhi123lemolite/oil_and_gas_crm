import { Link } from 'react-router-dom';
import { LayoutDashboard, Wallet, Truck, Boxes, Calculator, ArrowUpRight, ArrowDownRight, TrendingUp, Fuel, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { formatINR, formatDate } from '@/lib/format';
import { INVOICE_STATUS } from '@/lib/constants';
import { OIL_BENCHMARKS, FUEL_PRICES, formatMarket, type PriceTicker } from '@/lib/market';

export default function PortalDashboard() {
  const user = useAuthStore((s) => s.currentUser);
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const dispatches = useDataStore((s) => s.dispatches);
  const items = useDataStore((s) => s.items);

  const me = customers[0];
  const myInvoices = me ? invoices.filter((i) => i.customerId === me.id) : [];
  const myDispatches = me ? dispatches.filter((d) => d.customerId === me.id) : [];

  const outstanding = myInvoices
    .filter((i) => i.status !== 'PAID')
    .reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const lifetime = myInvoices.reduce((s, i) => s + i.amountPaid, 0);
  const activeShipments = myDispatches.filter((d) => d.status !== 'DELIVERED' && d.status !== 'CANCELLED').length;
  const recentBills = [...myInvoices]
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Welcome${user?.name ? `, ${user.name.split(' ')[0]}` : ''}`}
        description={me ? `${me.companyName} · account overview` : 'Your account overview'}
        icon={<LayoutDashboard />}
      />

      {/* Oil benchmarks */}
      <section>
        <SectionLabel icon={<TrendingUp className="size-4" />} title="Global oil benchmarks" note="Indicative reference prices" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {OIL_BENCHMARKS.map((t) => (
            <TickerCard key={t.name} t={t} highlight={t.name === 'Brent Crude'} />
          ))}
        </div>
      </section>

      {/* Fuel prices */}
      <section>
        <SectionLabel icon={<Fuel className="size-4" />} title="Current fuel prices (India)" note="Indicative retail rates" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {FUEL_PRICES.map((t) => (
            <TickerCard key={t.name} t={t} />
          ))}
        </div>
      </section>

      {/* Account KPIs */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="Outstanding" value={formatINR(outstanding)} icon={Wallet} accent="#DC2626" />
        <KpiCard label="Lifetime Paid" value={formatINR(lifetime)} icon={TrendingUp} accent="#00A878" />
        <KpiCard label="Active Shipments" value={String(activeShipments)} icon={Truck} accent="#2563EB" />
        <KpiCard label="Products" value={String(items.length)} icon={Boxes} accent="#7C3AED" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Recent bills */}
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <h3 className="font-display font-semibold">Recent Bills</h3>
            <Link to="/portal/invoices" className="flex items-center gap-1 text-xs font-medium text-brand-secondary hover:underline">
              View all <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          {recentBills.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-content-muted">No bills yet.</div>
          ) : (
            <table className="w-full text-sm">
              <tbody className="divide-y divide-line">
                {recentBills.map((inv) => (
                  <tr key={inv.id}>
                    <td className="px-4 py-2.5">
                      <div className="num font-medium">{inv.number}</div>
                      <div className="text-xs text-content-muted">{formatDate(inv.invoiceDate)}</div>
                    </td>
                    <td className="px-4 py-2.5 text-right num font-medium">{formatINR(inv.total)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <StatusBadge def={INVOICE_STATUS[inv.status]} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Quick action: calculator */}
        <Link to="/portal/calculator" className="card group flex flex-col justify-between p-5 transition-all hover:border-brand-secondary/40 hover:shadow-pop">
          <div className="flex size-11 items-center justify-center rounded-lg bg-brand-secondary/12 text-brand-secondary">
            <Calculator className="size-5" />
          </div>
          <div className="mt-4">
            <div className="font-display text-lg font-bold">ERP Calculator</div>
            <p className="mt-1 text-sm text-content-muted">Cost, density and blended price across tanks — instantly.</p>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-secondary">
            Open calculator <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>
    </div>
  );
}

function SectionLabel({ icon, title, note }: { icon: React.ReactNode; title: string; note: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-brand-secondary">{icon}</span>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
      <span className="text-xs text-content-muted">· {note}</span>
    </div>
  );
}

function TickerCard({ t, highlight }: { t: PriceTicker; highlight?: boolean }) {
  const up = t.change >= 0;
  return (
    <div className={`card p-3.5 ${highlight ? 'ring-1 ring-brand-secondary/40' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-content-secondary">{t.name}</span>
        {highlight && (
          <span className="rounded bg-brand-secondary/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-secondary">Key</span>
        )}
      </div>
      <div className="num mt-1.5 text-lg font-semibold text-content">{formatMarket(t)}</div>
      <div className={`mt-0.5 inline-flex items-center gap-0.5 text-xs font-semibold ${up ? 'text-success' : 'text-danger'}`}>
        {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
        {Math.abs(t.change).toFixed(2)}%
      </div>
    </div>
  );
}

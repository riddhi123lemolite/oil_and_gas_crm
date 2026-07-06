import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Package, Truck, PackageCheck, Wallet, ReceiptIndianRupee, FileText, Bell,
  TrendingUp, Fuel, ArrowUpRight, Boxes, FileDown, Calculator, History as HistoryIcon, LifeBuoy,
} from 'lucide-react';
import { KpiCard } from '@/components/shared/KpiCard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { MarketTicker } from '@/components/portal/MarketTicker';
import { useLiveMarket } from '@/hooks/useLiveMarket';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { formatINR, formatDate } from '@/lib/format';
import { INVOICE_STATUS } from '@/lib/constants';

export default function PortalDashboard() {
  const user = useAuthStore((s) => s.currentUser);
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const dispatches = useDataStore((s) => s.dispatches);
  const orders = useDataStore((s) => s.orders);
  const proposals = useDataStore((s) => s.proposals);
  const notifications = useDataStore((s) => s.notifications);
  const { oil, fuel } = useLiveMarket();

  const me = customers[0];
  const myInvoices = me ? invoices.filter((i) => i.customerId === me.id) : [];
  const myDispatches = me ? dispatches.filter((d) => d.customerId === me.id) : [];
  const myOrders = me ? orders.filter((o) => o.customerId === me.id) : [];
  const myProposals = me ? proposals.filter((p) => p.customerId === me.id) : [];

  const outstanding = myInvoices.filter((i) => i.status !== 'PAID').reduce((s, i) => s + (i.total - i.amountPaid), 0);
  const stats = {
    activeOrders: myOrders.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length,
    inTransit: myDispatches.filter((d) => d.status === 'IN_TRANSIT' || d.status === 'LOADING').length,
    delivered: myDispatches.filter((d) => d.status === 'DELIVERED').length,
    pendingPayments: myInvoices.filter((i) => i.status !== 'PAID').length,
    paidInvoices: myInvoices.filter((i) => i.status === 'PAID').length,
    openQuotations: myProposals.filter((p) => ['DRAFT', 'SENT', 'UNDER_REVIEW', 'NEGOTIATION'].includes(p.status)).length,
    unread: notifications.filter((n) => !n.read).length,
  };

  const recentBills = [...myInvoices].sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate)).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="card overflow-hidden">
        <div className="flex flex-col gap-4 bg-brand-primary p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="text-sm text-white/70">Welcome back</div>
            <h1 className="font-display text-2xl font-bold">{user?.name ?? 'Customer'}</h1>
            <div className="mt-0.5 text-sm text-white/80">{me?.companyName ?? '—'}</div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center sm:text-right">
            <HeroStat label="Account" value={me?.active ? 'Active' : 'Inactive'} />
            <HeroStat label="Outstanding" value={formatINR(outstanding)} />
            <HeroStat label="Credit Limit" value={me ? formatINR(me.creditLimit) : '—'} />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <KpiCard label="Active Orders" value={String(stats.activeOrders)} icon={Package} accent="#2563EB" />
        <KpiCard label="In Transit" value={String(stats.inTransit)} icon={Truck} accent="#E87722" />
        <KpiCard label="Delivered" value={String(stats.delivered)} icon={PackageCheck} accent="#00A878" />
        <KpiCard label="Pending Payments" value={String(stats.pendingPayments)} icon={Wallet} accent="#DC2626" />
        <KpiCard label="Paid Invoices" value={String(stats.paidInvoices)} icon={ReceiptIndianRupee} accent="#16A34A" />
        <KpiCard label="Open Quotations" value={String(stats.openQuotations)} icon={FileText} accent="#7C3AED" />
        <KpiCard label="Notifications" value={String(stats.unread)} icon={Bell} accent="#0891B2" />
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-7">
        <QuickAction to="/portal/products" icon={<Boxes className="size-5" />} label="Track Products" />
        <QuickAction to="/portal/invoices" icon={<ReceiptIndianRupee className="size-5" />} label="View Invoices" />
        <QuickAction to="/portal/documents" icon={<FileDown className="size-5" />} label="Documents" />
        <QuickAction to="/portal/payments" icon={<Wallet className="size-5" />} label="Payments" />
        <QuickAction to="/portal/calculator" icon={<Calculator className="size-5" />} label="ERP Calculator" />
        <QuickAction to="/portal/history" icon={<HistoryIcon className="size-5" />} label="History" />
        <QuickAction icon={<LifeBuoy className="size-5" />} label="Raise Ticket" onClick={() => toast.success('Support ticket raised — our team will reach out.')} />
      </div>

      {/* Live market */}
      <section>
        <SectionLabel icon={<TrendingUp className="size-4" />} title="Live oil & gas benchmarks" note="Auto-refreshing · indicative feed" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {oil.map((t) => (
            <MarketTicker key={t.name} t={t} highlight={t.name === 'Brent Crude'} />
          ))}
        </div>
      </section>
      <section>
        <SectionLabel icon={<Fuel className="size-4" />} title="Current fuel prices (India)" note="Auto-refreshing · indicative retail" />
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
          {fuel.map((t) => (
            <MarketTicker key={t.name} t={t} />
          ))}
        </div>
      </section>

      {/* Recent bills */}
      <div className="card">
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
                  <td className="px-4 py-2.5 text-right"><StatusBadge def={INVOICE_STATUS[inv.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-white/60">{label}</div>
      <div className="num text-lg font-semibold">{value}</div>
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

function QuickAction({ to, icon, label, onClick }: { to?: string; icon: React.ReactNode; label: string; onClick?: () => void }) {
  const inner = (
    <div className="card flex h-full flex-col items-center gap-2 p-3.5 text-center transition-all hover:border-brand-secondary/40 hover:shadow-pop">
      <span className="flex size-10 items-center justify-center rounded-lg bg-brand-secondary/12 text-brand-secondary">{icon}</span>
      <span className="text-xs font-medium text-content">{label}</span>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <button onClick={onClick} className="text-left">{inner}</button>;
}

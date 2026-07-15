import { useMemo, useState } from 'react';
import { ScrollText, Download } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SelectField } from '@/components/forms/SelectField';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatINR, formatDate, formatQty } from '@/lib/format';
import { exportToExcel } from '@/lib/excel';
import { INVOICE_STATUS } from '@/lib/constants';
import type { InvoiceStatus, Unit } from '@/types';

const BAR_COLORS = ['#0F3D5C', '#E87722', '#00A878', '#7C3AED', '#0891B2', '#C2410C'];

export default function PortalHistory() {
  const invoices = useDataStore((s) => s.invoices);
  const dispatches = useDataStore((s) => s.dispatches);
  const items = useDataStore((s) => s.items);
  const me = usePortalCustomer();

  const itemName = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [items]);

  const myInvoices = useMemo(() => (me ? invoices.filter((i) => i.customerId === me.id) : []), [me, invoices]);
  const myDispatches = useMemo(() => (me ? dispatches.filter((d) => d.customerId === me.id) : []), [me, dispatches]);

  const years = useMemo(() => ['all', ...Array.from(new Set(myInvoices.map((i) => i.invoiceDate.slice(0, 4)))).sort().reverse()], [myInvoices]);
  const [year, setYear] = useState('all');
  const [status, setStatus] = useState<InvoiceStatus | 'all'>('all');

  const monthly = useMemo(() => {
    const map = new Map<string, number>();
    myInvoices.forEach((i) => map.set(i.invoiceDate.slice(0, 7), (map.get(i.invoiceDate.slice(0, 7)) ?? 0) + i.total));
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12).map(([month, total]) => ({ month: month.slice(2), total }));
  }, [myInvoices]);

  const topProducts = useMemo(() => {
    const qtyMap = new Map<string, number>();
    const unitMap = new Map<string, Unit>();
    myDispatches.forEach((d) => {
      qtyMap.set(d.itemId, (qtyMap.get(d.itemId) ?? 0) + d.quantity);
      unitMap.set(d.itemId, d.unit);
    });
    return [...qtyMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([id, qty]) => ({ name: itemName(id).slice(0, 16), qty, unit: unitMap.get(id) ?? 'KL' }));
  }, [myDispatches, itemName]);

  const rows = myInvoices
    .filter((i) => (year === 'all' || i.invoiceDate.startsWith(year)) && (status === 'all' || i.status === status))
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

  const totalSpend = myInvoices.reduce((s, i) => s + i.total, 0);

  const exportRows = () =>
    exportToExcel(
      rows.map((i) => ({ Invoice: i.number, Date: formatDate(i.invoiceDate), Amount: i.total, Paid: i.amountPaid, Status: i.status })),
      'order-history',
      'History',
    );

  return (
    <div className="space-y-5">
      <PageHeader title="Order History" description="Historical purchases, spend trends and top products." icon={<ScrollText />} />

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-4">
          <div className="mb-1 flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold">Monthly Purchase Trend</h3>
            <span className="num text-xs text-content-muted">Total {formatINR(totalSpend)}</span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly} margin={{ left: -10, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#E87722" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#E87722" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--text-muted)" tickFormatter={(v) => `₹${(v / 100000).toFixed(0)} Lakh`} />
                <Tooltip formatter={(v: number) => formatINR(v)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="total" stroke="#E87722" strokeWidth={2} fill="url(#spendFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4">
          <h3 className="mb-1 font-display text-sm font-semibold">Top Purchased Products</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 10, right: 8 }}>
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 11 }} stroke="var(--text-muted)" />
                <Tooltip formatter={(v: number, _n: string, item: any) => formatQty(v, (item?.payload?.unit ?? 'KL') as Unit)} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="qty" radius={[0, 4, 4, 0]}>
                  {topProducts.map((_, i) => (
                    <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Filters + table */}
      <div className="card overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line p-3">
          <div className="w-32">
            <SelectField value={year} onChange={setYear} options={years.map((y) => ({ value: y, label: y === 'all' ? 'All Years' : y }))} />
          </div>
          <div className="w-36">
            <SelectField
              value={status}
              onChange={(v) => setStatus(v as InvoiceStatus | 'all')}
              options={[{ value: 'all', label: 'All Statuses' }, ...Object.entries(INVOICE_STATUS).map(([v, d]) => ({ value: v, label: d.label }))]}
            />
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={exportRows}>
            <Download className="size-4" /> Export
          </Button>
        </div>
        {rows.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-content-muted">No history for this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-2.5">Invoice</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Paid</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((i) => (
                  <tr key={i.id}>
                    <td className="px-4 py-2.5 num font-medium">{i.number}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{formatDate(i.invoiceDate)}</td>
                    <td className="px-4 py-2.5 text-right num">{formatINR(i.total)}</td>
                    <td className="px-4 py-2.5 text-right num text-success">{formatINR(i.amountPaid)}</td>
                    <td className="px-4 py-2.5"><StatusBadge def={INVOICE_STATUS[i.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

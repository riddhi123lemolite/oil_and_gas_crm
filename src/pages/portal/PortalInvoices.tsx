import { useState } from 'react';
import { ReceiptIndianRupee, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { formatINR, formatDate } from '@/lib/format';
import { INVOICE_STATUS } from '@/lib/constants';
import type { InvoiceStatus } from '@/types';

const FILTERS: { key: InvoiceStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UNPAID', label: 'Unpaid' },
  { key: 'PARTIAL', label: 'Partial' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'PAID', label: 'Paid' },
];

export default function PortalInvoices() {
  const invoices = useDataStore((s) => s.invoices);
  const customers = useDataStore((s) => s.customers);
  const me = customers[0];
  const [filter, setFilter] = useState<InvoiceStatus | 'ALL'>('ALL');

  const mine = (me ? invoices.filter((i) => i.customerId === me.id) : [])
    .filter((i) => filter === 'ALL' || i.status === filter)
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bills & Invoices"
        description="Every invoice, e-bill and paperwork for your account — in one place."
        icon={<ReceiptIndianRupee />}
      />

      <div className="flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-md border px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'border-brand-secondary bg-brand-secondary/10 text-brand-secondary'
                : 'border-line text-content-secondary hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        {mine.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-content-muted">No bills found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-2.5">Invoice</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Due</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Balance</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5 text-right">e-Bill</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {mine.map((inv) => {
                  const balance = inv.total - inv.amountPaid;
                  return (
                    <tr key={inv.id}>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <FileText className="size-3.5 text-content-muted" />
                          <span className="num font-medium">{inv.number}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-content-secondary">{formatDate(inv.invoiceDate)}</td>
                      <td className="px-4 py-2.5 text-content-secondary">{formatDate(inv.dueDate)}</td>
                      <td className="px-4 py-2.5 text-right num">{formatINR(inv.total)}</td>
                      <td className={`px-4 py-2.5 text-right num ${balance > 0 ? 'text-danger' : 'text-content-muted'}`}>
                        {formatINR(balance)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge def={INVOICE_STATUS[inv.status]} />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => toast.success(`Downloading ${inv.number}.pdf`)}
                          className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-content-secondary hover:bg-muted"
                        >
                          <Download className="size-3.5" /> PDF
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

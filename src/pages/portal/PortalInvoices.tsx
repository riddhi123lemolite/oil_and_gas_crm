import { useState } from 'react';
import { ReceiptIndianRupee, Download, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatINR, formatDate } from '@/lib/format';
import { downloadBlob } from '@/lib/utils';
import { INVOICE_STATUS } from '@/lib/constants';
import type { InvoiceStatus, Invoice } from '@/types';
import type { BusinessDocData } from '@/components/pdf/BusinessDocPdf';

const FILTERS: { key: InvoiceStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'UNPAID', label: 'Unpaid' },
  { key: 'PARTIAL', label: 'Partial' },
  { key: 'OVERDUE', label: 'Overdue' },
  { key: 'PAID', label: 'Paid' },
];

export default function PortalInvoices() {
  const invoices = useDataStore((s) => s.invoices);
  const company = useDataStore((s) => s.company);
  const me = usePortalCustomer();
  const [filter, setFilter] = useState<InvoiceStatus | 'ALL'>('ALL');
  const [busy, setBusy] = useState<string | null>(null);

  const mine = (me ? invoices.filter((i) => i.customerId === me.id) : [])
    .filter((i) => filter === 'ALL' || i.status === filter)
    .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));

  const download = async (inv: Invoice) => {
    if (!me) return;
    setBusy(inv.id);
    try {
      const addr = me.billingAddress;
      const data: BusinessDocData = {
        docLabel: 'TAX INVOICE',
        number: inv.number,
        date: formatDate(inv.invoiceDate),
        validLabel: 'Due Date',
        validValue: formatDate(inv.dueDate),
        company,
        partyName: me.companyName,
        partyAddress: `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} ${addr.pincode}`,
        partyGstin: me.gstin,
        items: inv.items,
        subtotal: inv.subtotal,
        cgst: inv.cgst,
        sgst: inv.sgst,
        igst: inv.igst,
        transportCharge: inv.transportCharge,
        total: inv.total,
        terms: company.terms,
      };
      const { renderBusinessDoc } = await import('@/components/pdf/renderPdf');
      const blob = await renderBusinessDoc(data);
      downloadBlob(blob, `${inv.number.replace(/[\\/]/g, '-')}.pdf`);
      toast.success('Invoice downloaded');
    } catch {
      toast.error('Could not generate the invoice.');
    } finally {
      setBusy(null);
    }
  };

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
                          disabled={busy === inv.id}
                          onClick={() => download(inv)}
                          className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-content-secondary hover:bg-muted disabled:opacity-50"
                        >
                          <Download className="size-3.5" /> {busy === inv.id ? '…' : 'PDF'}
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

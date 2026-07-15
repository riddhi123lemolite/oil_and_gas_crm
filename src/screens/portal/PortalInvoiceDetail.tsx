import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ReceiptIndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatINR, formatDate, formatQty } from '@/lib/format';
import { downloadBusinessDoc, invoiceDocData } from '@/lib/downloadDoc';
import { INVOICE_STATUS } from '@/lib/constants';

export default function PortalInvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const invoices = useDataStore((s) => s.invoices);
  const items = useDataStore((s) => s.items);
  const company = useDataStore((s) => s.company);
  const me = usePortalCustomer();
  const [busy, setBusy] = useState(false);

  // Scoped to the signed-in customer — you can only open your own invoices.
  const invoice = invoices.find((i) => i.id === id && i.customerId === me?.id);

  if (!invoice) {
    return (
      <div className="space-y-5">
        <PageHeader title="Invoice" icon={<ReceiptIndianRupee />} />
        <div className="card">
          <EmptyState title="Invoice not found" description="This bill isn't available on your account." />
        </div>
        <Button variant="outline" onClick={() => navigate('/portal/invoices')}>
          <ArrowLeft className="size-4" /> Back to invoices
        </Button>
      </div>
    );
  }

  const itemName = (itemId: string) => items.find((it) => it.id === itemId)?.name ?? '—';
  const balance = invoice.total - invoice.amountPaid;

  const download = async () => {
    setBusy(true);
    try {
      await downloadBusinessDoc(invoiceDocData(invoice, me, company), invoice.number);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={`Invoice ${invoice.number}`}
        description={`Issued ${formatDate(invoice.invoiceDate)} · due ${formatDate(invoice.dueDate)}`}
        icon={<ReceiptIndianRupee />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate('/portal/invoices')}>
              <ArrowLeft className="size-4" /> Back
            </Button>
            <Button loading={busy} onClick={download}>
              {!busy && <Download className="size-4" />} Download PDF
            </Button>
          </div>
        }
      />

      <div className="card p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-content-muted">Billed To</div>
            <div className="mt-1 font-display text-lg font-bold">{me?.companyName}</div>
            {me?.gstin && <div className="num text-xs text-content-muted">GSTIN: {me.gstin}</div>}
          </div>
          <StatusBadge def={INVOICE_STATUS[invoice.status]} />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5 text-right">Qty</th>
                <th className="px-4 py-2.5 text-right">Rate</th>
                <th className="px-4 py-2.5 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoice.items.map((li) => (
                <tr key={li.id}>
                  <td className="px-4 py-2.5">{li.description || itemName(li.itemId)}</td>
                  <td className="px-4 py-2.5 text-right num">{formatQty(li.quantity, li.unit)}</td>
                  <td className="px-4 py-2.5 text-right num">{formatINR(li.rate)}</td>
                  <td className="px-4 py-2.5 text-right num">{formatINR(li.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end border-t border-line p-4">
          <div className="w-64 space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
            {invoice.cgst > 0 && <Row label="CGST" value={formatINR(invoice.cgst)} />}
            {invoice.sgst > 0 && <Row label="SGST" value={formatINR(invoice.sgst)} />}
            {invoice.igst > 0 && <Row label="IGST" value={formatINR(invoice.igst)} />}
            {invoice.transportCharge > 0 && <Row label="Transport" value={formatINR(invoice.transportCharge)} />}
            <div className="flex items-center justify-between border-t border-line pt-1.5 font-semibold">
              <span>Total</span>
              <span className="num">{formatINR(invoice.total)}</span>
            </div>
            <Row label="Paid" value={formatINR(invoice.amountPaid)} />
            <div className={`flex items-center justify-between font-semibold ${balance > 0 ? 'text-danger' : 'text-success'}`}>
              <span>Balance Due</span>
              <span className="num">{formatINR(balance)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-content-secondary">
      <span>{label}</span>
      <span className="num">{value}</span>
    </div>
  );
}

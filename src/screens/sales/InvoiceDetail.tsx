import { useParams, useNavigate } from 'react-router-dom';
import { ReceiptIndianRupee, Printer, Wallet } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { PdfDownloadButton } from '@/components/pdf/PdfDownloadButton';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { useAuth } from '@/hooks/useAuth';
import { INVOICE_STATUS } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import { generateId } from '@/lib/utils';
import type { BusinessDocData } from '@/components/pdf/BusinessDocPdf';
import type { Payment } from '@/types';

export default function InvoiceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customerName } = useLookups();
  const { can } = useAuth();

  const invoices = useDataStore((s) => s.invoices);
  const customers = useDataStore((s) => s.customers);
  const payments = useDataStore((s) => s.payments);
  const company = useDataStore((s) => s.company);
  const updateInvoice = useDataStore((s) => s.update);
  const addPayment = useDataStore((s) => s.add);

  const invoice = invoices.find((i) => i.id === id);
  if (!invoice) {
    return (
      <EmptyState
        icon={ReceiptIndianRupee}
        title="Invoice not found"
        actionLabel="Back to Invoices"
        onAction={() => navigate('/invoices')}
      />
    );
  }

  const customer = customers.find((c) => c.id === invoice.customerId);
  const invPayments = payments.filter((p) => p.invoiceId === invoice.id);
  const balance = invoice.total - invoice.amountPaid;

  const pdfData: BusinessDocData = {
    docLabel: 'TAX INVOICE',
    number: invoice.number,
    date: formatDate(invoice.invoiceDate),
    validLabel: 'Due Date',
    validValue: formatDate(invoice.dueDate),
    company,
    partyName: customer?.companyName ?? 'Customer',
    partyAddress: customer
      ? `${customer.billingAddress.line1}, ${customer.city}, ${customer.state} ${customer.pincode}`
      : '',
    partyGstin: customer?.gstin,
    items: invoice.items,
    subtotal: invoice.subtotal,
    cgst: invoice.cgst,
    sgst: invoice.sgst,
    igst: invoice.igst,
    transportCharge: invoice.transportCharge,
    total: invoice.total,
    terms: company.terms,
  };

  const recordPayment = () => {
    const payment: Payment = {
      id: generateId('pay'),
      number: `RCPT/2026/${generateId('').slice(-5)}`,
      invoiceId: invoice.id,
      customerId: invoice.customerId,
      amount: balance,
      mode: 'NEFT',
      reference: generateId('REF').toUpperCase().slice(0, 12),
      paidAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
    addPayment('payments', payment);
    updateInvoice('invoices', invoice.id, {
      status: 'PAID',
      amountPaid: invoice.total,
      paidAt: new Date().toISOString(),
    });
    toast.success('Payment recorded — invoice marked Paid');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={invoice.number}
        description={`${customerName(invoice.customerId)} · Due ${formatDate(invoice.dueDate)}`}
        icon={<ReceiptIndianRupee />}
        actions={
          <>
            <Button variant="ghost" onClick={() => window.print()}>
              <Printer className="size-4" /> Print
            </Button>
            <PdfDownloadButton
              data={pdfData}
              filename={invoice.number.replace(/\//g, '-')}
            />
            {can('invoices', 'edit') && balance > 0 && (
              <Button onClick={recordPayment}>
                <Wallet className="size-4" /> Record Payment
              </Button>
            )}
          </>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge def={INVOICE_STATUS[invoice.status]} />
        <span className="text-sm text-content-muted">
          Balance due:{' '}
          <span className="num font-semibold text-content">
            {formatINR(balance)}
          </span>
        </span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{customer?.companyName}</CardTitle>
          <span className="num text-sm text-content-muted">
            {customer?.gstin}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[520px] text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase text-content-muted">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Rate</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((li) => (
                  <tr key={li.id} className="border-b border-line last:border-0">
                    <td className="py-2 text-content">{li.description}</td>
                    <td className="num py-2 text-right text-content-secondary">
                      {li.quantity} {li.unit}
                    </td>
                    <td className="num py-2 text-right text-content-secondary">
                      {formatINR(li.rate)}
                    </td>
                    <td className="num py-2 text-right font-medium text-content">
                      {formatINR(li.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
            <Row label="Subtotal" value={formatINR(invoice.subtotal)} />
            {invoice.cgst > 0 ? (
              <>
                <Row label="CGST" value={formatINR(invoice.cgst)} />
                <Row label="SGST" value={formatINR(invoice.sgst)} />
              </>
            ) : (
              <Row label="IGST" value={formatINR(invoice.igst)} />
            )}
            <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
              <span>Total</span>
              <span className="num">{formatINR(invoice.total)}</span>
            </div>
            <Row label="Paid" value={formatINR(invoice.amountPaid)} />
            <Row label="Balance Due" value={formatINR(balance)} />
          </div>
        </CardContent>
      </Card>

      {invPayments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Payments Received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {invPayments.map((p) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-md border border-line p-2.5 text-sm"
              >
                <span className="num font-medium text-content">{p.number}</span>
                <span className="text-content-muted">
                  {p.mode} · {formatDate(p.paidAt)}
                </span>
                <span className="num ml-auto font-semibold text-success">
                  {formatINR(p.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-content-muted">{label}</span>
      <span className="num font-medium text-content">{value}</span>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { Wallet, CreditCard, Landmark, Banknote, Smartphone, FileCheck, Download } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatINR, formatDate } from '@/lib/format';
import { downloadBusinessDoc } from '@/lib/downloadDoc';
import type { Payment } from '@/types';
import type { BusinessDocData } from '@/components/pdf/BusinessDocPdf';

const METHODS = [
  { code: 'NEFT', icon: Landmark, label: 'NEFT', desc: 'Bank transfer · settles same/next working day' },
  { code: 'RTGS', icon: Landmark, label: 'RTGS', desc: 'Real-time bank transfer for high-value payments' },
  { code: 'UPI', icon: Smartphone, label: 'UPI', desc: 'Instant transfer up to ₹1,00,000 per txn' },
  { code: 'CHEQUE', icon: FileCheck, label: 'Cheque', desc: 'Realised after clearing (2–3 working days)' },
  { code: 'CASH', icon: Banknote, label: 'Cash', desc: 'Accepted at branch, subject to limits' },
];

export default function PortalPayments() {
  const payments = useDataStore((s) => s.payments);
  const invoices = useDataStore((s) => s.invoices);
  const company = useDataStore((s) => s.company);
  const me = usePortalCustomer();
  const [busy, setBusy] = useState<string | null>(null);

  const invNo = useMemo(() => {
    const map = new Map(invoices.map((i) => [i.id, i.number]));
    return (id: string) => map.get(id) ?? '—';
  }, [invoices]);

  const download = async (p: Payment) => {
    if (!me) return;
    setBusy(p.id);
    try {
      const addr = me.billingAddress;
      const data: BusinessDocData = {
        docLabel: 'PAYMENT RECEIPT',
        number: p.number,
        date: formatDate(p.paidAt),
        company,
        partyName: me.companyName,
        partyAddress: `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} ${addr.pincode}`,
        partyGstin: me.gstin,
        subject: `Payment received via ${p.mode} · Ref ${p.reference} · against invoice ${invNo(p.invoiceId)}`,
        items: [],
        subtotal: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        transportCharge: 0,
        total: p.amount,
        terms: company.terms,
      };
      await downloadBusinessDoc(data, `${p.number}-Receipt`);
    } finally {
      setBusy(null);
    }
  };

  const myPayments = me
    ? payments.filter((p) => p.customerId === me.id).sort((a, b) => b.paidAt.localeCompare(a.paidAt))
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        description="Your payment terms, accepted methods, and full payment history."
        icon={<Wallet />}
      />

      {/* Terms */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <TermTile label="Payment Terms" value={me ? `NET ${me.paymentTermsDays} days` : '—'} icon={<CreditCard className="size-4" />} />
        <TermTile label="Credit Limit" value={me ? formatINR(me.creditLimit) : '—'} icon={<Landmark className="size-4" />} />
        <TermTile label="Current Outstanding" value={me ? formatINR(me.outstanding) : '—'} icon={<Wallet className="size-4" />} tone="danger" />
      </div>

      {/* Methods */}
      <div className="card">
        <div className="border-b border-line px-4 py-3 font-display font-semibold">Accepted Payment Methods</div>
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {METHODS.map((m) => {
            const Icon = m.icon;
            return (
              <div key={m.code} className="flex items-start gap-3 bg-surface p-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
                  <Icon className="size-4" />
                </span>
                <div>
                  <div className="font-medium">{m.label}</div>
                  <div className="text-xs text-content-muted">{m.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* History */}
      <div className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-display font-semibold">Payment History</div>
        {myPayments.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-content-muted">No payments recorded.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-2.5">Receipt</th>
                  <th className="px-4 py-2.5">Against Invoice</th>
                  <th className="px-4 py-2.5">Method</th>
                  <th className="px-4 py-2.5">Reference</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Amount</th>
                  <th className="px-4 py-2.5 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myPayments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2.5 num font-medium">{p.number}</td>
                    <td className="px-4 py-2.5 num text-content-secondary">{invNo(p.invoiceId)}</td>
                    <td className="px-4 py-2.5">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold">{p.mode}</span>
                    </td>
                    <td className="px-4 py-2.5 num text-content-secondary">{p.reference}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{formatDate(p.paidAt)}</td>
                    <td className="px-4 py-2.5 text-right num font-medium text-success">{formatINR(p.amount)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        disabled={busy === p.id}
                        onClick={() => download(p)}
                        className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs font-medium text-content-secondary hover:bg-muted disabled:opacity-50"
                      >
                        <Download className="size-3.5" /> {busy === p.id ? '…' : 'PDF'}
                      </button>
                    </td>
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

function TermTile({ label, value, icon, tone }: { label: string; value: string; icon: React.ReactNode; tone?: 'danger' }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
        {icon}
      </span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wide text-content-muted">{label}</div>
        <div className={`num text-lg font-semibold ${tone === 'danger' ? 'text-danger' : 'text-content'}`}>{value}</div>
      </div>
    </div>
  );
}

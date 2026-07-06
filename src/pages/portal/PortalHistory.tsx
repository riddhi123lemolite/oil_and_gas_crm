import { useMemo } from 'react';
import { ScrollText, ReceiptIndianRupee, Wallet, Truck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useDataStore } from '@/stores/dataStore';
import { formatINR, formatDateLong } from '@/lib/format';

interface Event {
  id: string;
  date: string;
  kind: 'Invoice' | 'Payment' | 'Shipment';
  title: string;
  detail: string;
}

const KIND_META = {
  Invoice: { icon: ReceiptIndianRupee, color: '#2563EB' },
  Payment: { icon: Wallet, color: '#00A878' },
  Shipment: { icon: Truck, color: '#E87722' },
};

export default function PortalHistory() {
  const invoices = useDataStore((s) => s.invoices);
  const payments = useDataStore((s) => s.payments);
  const dispatches = useDataStore((s) => s.dispatches);
  const customers = useDataStore((s) => s.customers);
  const me = customers[0];

  const events = useMemo<Event[]>(() => {
    if (!me) return [];
    const ev: Event[] = [];
    invoices.filter((i) => i.customerId === me.id).forEach((i) =>
      ev.push({ id: `i-${i.id}`, date: i.invoiceDate, kind: 'Invoice', title: `Invoice ${i.number}`, detail: `${formatINR(i.total)} · ${i.status}` }),
    );
    payments.filter((p) => p.customerId === me.id).forEach((p) =>
      ev.push({ id: `p-${p.id}`, date: p.paidAt, kind: 'Payment', title: `Payment ${p.number}`, detail: `${formatINR(p.amount)} via ${p.mode}` }),
    );
    dispatches.filter((d) => d.customerId === me.id).forEach((d) =>
      ev.push({ id: `d-${d.id}`, date: d.scheduledAt, kind: 'Shipment', title: `Dispatch ${d.number}`, detail: `${d.status}` }),
    );
    return ev.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);
  }, [me, invoices, payments, dispatches]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="History"
        description="A chronological record of your invoices, payments and shipments."
        icon={<ScrollText />}
      />

      <div className="card p-5">
        {events.length === 0 ? (
          <div className="py-10 text-center text-sm text-content-muted">No history yet.</div>
        ) : (
          <ol className="relative ml-3 border-l border-line">
            {events.map((e) => {
              const meta = KIND_META[e.kind];
              const Icon = meta.icon;
              return (
                <li key={e.id} className="mb-5 ml-6 last:mb-0">
                  <span
                    className="absolute -left-3 flex size-6 items-center justify-center rounded-full ring-4 ring-surface"
                    style={{ backgroundColor: `${meta.color}1a`, color: meta.color }}
                  >
                    <Icon className="size-3.5" />
                  </span>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="font-medium">{e.title}</span>
                    <span className="text-xs text-content-muted">{formatDateLong(e.date)}</span>
                  </div>
                  <div className="num text-sm text-content-secondary">{e.detail}</div>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Boxes, PackageCheck } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { formatQty, formatINR, formatDate } from '@/lib/format';
import { DISPATCH_STATUS, ITEM_CATEGORY } from '@/lib/constants';

export default function ProductTracking() {
  const items = useDataStore((s) => s.items);
  const dispatches = useDataStore((s) => s.dispatches);
  const customers = useDataStore((s) => s.customers);
  const me = customers[0];

  const itemName = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [items]);

  const myDispatches = me
    ? dispatches.filter((d) => d.customerId === me.id).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
    : [];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Product Tracking"
        description="Live product availability and the status of your shipments."
        icon={<Boxes />}
      />

      {/* Live availability */}
      <div className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-display font-semibold">Live Product Availability</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                <th className="px-4 py-2.5">Product</th>
                <th className="px-4 py-2.5">Category</th>
                <th className="px-4 py-2.5">Warehouse</th>
                <th className="px-4 py-2.5 text-right">Rate</th>
                <th className="px-4 py-2.5 text-right">In Stock</th>
                <th className="px-4 py-2.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.slice(0, 20).map((it) => {
                const low = it.stockTotal < 5000;
                return (
                  <tr key={it.id}>
                    <td className="px-4 py-2.5 font-medium">{it.name}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{ITEM_CATEGORY[it.category].label}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{it.warehouse}</td>
                    <td className="px-4 py-2.5 text-right num">{formatINR(it.rate)}</td>
                    <td className="px-4 py-2.5 text-right num">{formatQty(it.stockTotal, it.unit)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <StatusBadge
                        def={low ? { label: 'Low', tone: 'warm' } : { label: 'In Stock', tone: 'success' }}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shipments */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3 font-display font-semibold">
          <PackageCheck className="size-4 text-brand-secondary" /> Your Shipments
        </div>
        {myDispatches.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-content-muted">No shipments on record.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-2.5">Dispatch</th>
                  <th className="px-4 py-2.5">Product</th>
                  <th className="px-4 py-2.5 text-right">Quantity</th>
                  <th className="px-4 py-2.5">Scheduled</th>
                  <th className="px-4 py-2.5">Location</th>
                  <th className="px-4 py-2.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {myDispatches.map((d) => (
                  <tr key={d.id}>
                    <td className="px-4 py-2.5 num font-medium">{d.number}</td>
                    <td className="px-4 py-2.5">{itemName(d.itemId)}</td>
                    <td className="px-4 py-2.5 text-right num">{formatQty(d.quantity, d.unit)}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{formatDate(d.scheduledAt)}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{d.currentLocation ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right">
                      <StatusBadge def={DISPATCH_STATUS[d.status]} />
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

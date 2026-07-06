import { useMemo, useState } from 'react';
import { Boxes, Truck, User, MapPin, Navigation, Package, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { formatQty, formatINR, formatDate } from '@/lib/format';
import { DISPATCH_STATUS, ITEM_CATEGORY } from '@/lib/constants';
import type { DispatchStatus } from '@/types';

const STEPS = ['Order Confirmed', 'Processing', 'Loaded', 'Dispatched', 'In Transit', 'Reached Destination', 'Delivered', 'Completed'];

// Map a dispatch status to how far along the milestone timeline it is.
const STEP_FOR: Record<DispatchStatus, number> = {
  SCHEDULED: 1,
  LOADING: 2,
  IN_TRANSIT: 4,
  DELIVERED: 7,
  RETURNED: 4,
  CANCELLED: 0,
};

export default function ProductTracking() {
  const items = useDataStore((s) => s.items);
  const dispatches = useDataStore((s) => s.dispatches);
  const routes = useDataStore((s) => s.routes);
  const customers = useDataStore((s) => s.customers);
  const me = customers[0];

  const itemName = useMemo(() => {
    const map = new Map(items.map((i) => [i.id, i.name]));
    return (id: string) => map.get(id) ?? '—';
  }, [items]);
  const routeById = useMemo(() => new Map(routes.map((r) => [r.id, r])), [routes]);

  const myDispatches = me
    ? dispatches.filter((d) => d.customerId === me.id).sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt))
    : [];

  const [selectedId, setSelectedId] = useState<string | null>(myDispatches[0]?.id ?? null);
  const selected = myDispatches.find((d) => d.id === selectedId) ?? myDispatches[0];
  const route = selected?.routeId ? routeById.get(selected.routeId) : undefined;
  const step = selected ? STEP_FOR[selected.status] : 0;

  return (
    <div className="space-y-5">
      <PageHeader title="Product Tracking" description="Track every shipment from dispatch to delivery, plus live stock." icon={<Boxes />} />

      {/* Tracking detail */}
      {selected && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="flex items-center gap-2">
              <Truck className="size-4 text-brand-secondary" />
              <span className="num font-semibold">{selected.number}</span>
              <StatusBadge def={DISPATCH_STATUS[selected.status]} />
            </div>
            <span className="text-sm text-content-muted">{itemName(selected.itemId)} · {formatQty(selected.quantity, selected.unit)}</span>
          </div>

          <div className="grid gap-4 p-4 lg:grid-cols-[1.3fr_1fr]">
            {/* Milestone timeline */}
            <ol className="relative ml-2 border-l border-line">
              {STEPS.map((label, i) => {
                const done = i < step;
                const active = i === step;
                return (
                  <li key={label} className="mb-4 ml-5 last:mb-0">
                    <span
                      className={`absolute -left-[9px] flex size-4 items-center justify-center rounded-full ring-4 ring-surface ${
                        done ? 'bg-success text-white' : active ? 'bg-brand-secondary text-white' : 'bg-muted text-content-muted'
                      }`}
                    >
                      {done && <CheckCircle2 className="size-3" />}
                    </span>
                    <span className={`text-sm ${done ? 'text-content-secondary' : active ? 'font-semibold text-content' : 'text-content-muted'}`}>
                      {label}
                    </span>
                  </li>
                );
              })}
            </ol>

            {/* Details */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 self-start rounded-lg border border-line p-4 text-sm">
              <Detail icon={<Truck className="size-3.5" />} label="Truck No" value={selected.vehicleNo ?? '—'} />
              <Detail icon={<User className="size-3.5" />} label="Driver" value={selected.driverName ?? '—'} />
              <Detail icon={<Navigation className="size-3.5" />} label="Carrier" value={route?.carrier ?? '—'} />
              <Detail icon={<MapPin className="size-3.5" />} label="Destination" value={route?.toLocation ?? '—'} />
              <Detail icon={<Package className="size-3.5" />} label="Dispatch Date" value={formatDate(selected.dispatchedAt ?? selected.scheduledAt)} />
              <Detail icon={<MapPin className="size-3.5" />} label="Current Location" value={selected.currentLocation ?? '—'} />
              <Detail icon={<Navigation className="size-3.5" />} label="Distance" value={route ? `${route.distanceKm} km` : '—'} />
              <Detail icon={<Package className="size-3.5" />} label="Expected" value={formatDate(selected.deliveredAt ?? selected.scheduledAt)} />
            </div>
          </div>
        </div>
      )}

      {/* Shipments list (click to track) */}
      <div className="card overflow-hidden">
        <div className="border-b border-line px-4 py-3 font-display font-semibold">Your Shipments</div>
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
                  <tr
                    key={d.id}
                    onClick={() => setSelectedId(d.id)}
                    className={`cursor-pointer transition-colors hover:bg-muted ${d.id === selected?.id ? 'bg-brand-primary/5' : ''}`}
                  >
                    <td className="px-4 py-2.5 num font-medium">{d.number}</td>
                    <td className="px-4 py-2.5">{itemName(d.itemId)}</td>
                    <td className="px-4 py-2.5 text-right num">{formatQty(d.quantity, d.unit)}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{formatDate(d.scheduledAt)}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{d.currentLocation ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right"><StatusBadge def={DISPATCH_STATUS[d.status]} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

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
              {items.slice(0, 15).map((it) => {
                const low = it.stockTotal < 5000;
                return (
                  <tr key={it.id}>
                    <td className="px-4 py-2.5 font-medium">{it.name}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{ITEM_CATEGORY[it.category].label}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{it.warehouse}</td>
                    <td className="px-4 py-2.5 text-right num">{formatINR(it.rate)}</td>
                    <td className="px-4 py-2.5 text-right num">{formatQty(it.stockTotal, it.unit)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <StatusBadge def={low ? { label: 'Low', tone: 'warm' } : { label: 'In Stock', tone: 'success' }} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Detail({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-content-muted">
        {icon} {label}
      </div>
      <div className="mt-0.5 font-medium text-content">{value}</div>
    </div>
  );
}

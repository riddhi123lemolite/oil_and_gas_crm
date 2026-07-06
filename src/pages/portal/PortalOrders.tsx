import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatINR, formatDate } from '@/lib/format';
import type { OrderStatus } from '@/types';
import type { BadgeTone } from '@/lib/constants';

const STATUS: Record<OrderStatus, { label: string; tone: BadgeTone }> = {
  CONFIRMED: { label: 'Confirmed', tone: 'info' },
  PROCESSING: { label: 'Processing', tone: 'cold' },
  PARTIALLY_DISPATCHED: { label: 'Partially Dispatched', tone: 'warm' },
  DISPATCHED: { label: 'Dispatched', tone: 'brand' },
  DELIVERED: { label: 'Delivered', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'neutral' },
};

export default function PortalOrders() {
  const [params] = useSearchParams();
  const status = params.get('status') ?? 'active';
  const orders = useDataStore((s) => s.orders);
  const me = usePortalCustomer();

  const rows = useMemo(() => {
    const mine = me ? orders.filter((o) => o.customerId === me.id) : [];
    const filtered =
      status === 'delivered'
        ? mine.filter((o) => o.status === 'DELIVERED')
        : status === 'active'
          ? mine.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
          : mine;
    return filtered.sort((a, b) => b.orderDate.localeCompare(a.orderDate));
  }, [me, orders, status]);

  const title = status === 'delivered' ? 'Delivered Orders' : status === 'active' ? 'Active Orders' : 'Orders';

  return (
    <div className="space-y-5">
      <PageHeader title={title} description="Your purchase orders and their fulfilment status." icon={<Package />} />
      <div className="card overflow-hidden">
        {rows.length === 0 ? (
          <EmptyState title={`No ${status === 'all' ? '' : status + ' '}orders`} description="Orders will appear here once placed." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-2.5">Order</th>
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5 text-right">Line Items</th>
                  <th className="px-4 py-2.5 text-right">Value</th>
                  <th className="px-4 py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-2.5 num font-medium">{o.number}</td>
                    <td className="px-4 py-2.5 text-content-secondary">{formatDate(o.orderDate)}</td>
                    <td className="px-4 py-2.5 text-right num">{o.items.length}</td>
                    <td className="px-4 py-2.5 text-right num">{formatINR(o.total)}</td>
                    <td className="px-4 py-2.5"><StatusBadge def={STATUS[o.status]} /></td>
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

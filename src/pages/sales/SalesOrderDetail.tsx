import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, CheckCircle2, Circle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { formatINR, formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { OrderStatus } from '@/types';

const FULFILMENT: OrderStatus[] = [
  'CONFIRMED',
  'PROCESSING',
  'PARTIALLY_DISPATCHED',
  'DISPATCHED',
  'DELIVERED',
];

const STAGE_LABEL: Record<OrderStatus, string> = {
  CONFIRMED: 'Order Confirmed',
  PROCESSING: 'Processing',
  PARTIALLY_DISPATCHED: 'Partially Dispatched',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

export default function SalesOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customerName } = useLookups();
  const orders = useDataStore((s) => s.orders);

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return (
      <EmptyState
        icon={ShoppingCart}
        title="Order not found"
        actionLabel="Back to Orders"
        onAction={() => navigate('/orders')}
      />
    );
  }

  const currentIndex = FULFILMENT.indexOf(order.status);

  return (
    <div className="space-y-5">
      <PageHeader
        title={order.number}
        description={`${customerName(order.customerId)} · ${formatDate(order.orderDate)}`}
        icon={<ShoppingCart />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Fulfilment Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
            {FULFILMENT.map((stage, i) => {
              const done = i <= currentIndex;
              return (
                <div key={stage} className="flex flex-1 gap-3 sm:flex-col sm:items-center">
                  <div className="flex flex-col items-center sm:flex-row sm:w-full">
                    {i > 0 && (
                      <div
                        className={cn(
                          'hidden h-0.5 flex-1 sm:block',
                          i <= currentIndex ? 'bg-brand-accent' : 'bg-line',
                        )}
                      />
                    )}
                    {done ? (
                      <CheckCircle2 className="size-6 shrink-0 text-brand-accent" />
                    ) : (
                      <Circle className="size-6 shrink-0 text-content-muted" />
                    )}
                    {i < FULFILMENT.length - 1 && (
                      <div
                        className={cn(
                          'hidden h-0.5 flex-1 sm:block',
                          i < currentIndex ? 'bg-brand-accent' : 'bg-line',
                        )}
                      />
                    )}
                  </div>
                  <span
                    className={cn(
                      'pb-3 text-xs font-medium sm:pb-0 sm:pt-1.5 sm:text-center',
                      done ? 'text-content' : 'text-content-muted',
                    )}
                  >
                    {STAGE_LABEL[stage]}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-[11px] uppercase text-content-muted">
                <th className="py-2">Description</th>
                <th className="py-2 text-right">Qty</th>
                <th className="py-2 text-right">Rate</th>
                <th className="py-2 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((li) => (
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
          <div className="mt-3 flex justify-end gap-8 text-sm">
            <span className="text-content-muted">Tax</span>
            <span className="num font-medium text-content">
              {formatINR(order.taxTotal)}
            </span>
          </div>
          <div className="flex justify-end gap-8 text-base font-semibold">
            <span>Total</span>
            <span className="num text-brand-primary dark:text-brand-secondary">
              {formatINR(order.total)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

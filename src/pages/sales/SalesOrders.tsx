import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { formatINR, formatDate } from '@/lib/format';
import type { BadgeTone } from '@/lib/constants';
import type { OrderStatus, SalesOrder } from '@/types';

const ORDER_TONE: Record<OrderStatus, BadgeTone> = {
  CONFIRMED: 'info',
  PROCESSING: 'cold',
  PARTIALLY_DISPATCHED: 'warm',
  DISPATCHED: 'brand',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

export default function SalesOrders() {
  const navigate = useNavigate();
  const { customerName } = useLookups();
  const orders = useDataStore((s) => s.orders);

  const columns = useMemo<ColumnDef<SalesOrder, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Order No.',
        cell: ({ row }) => (
          <span className="num font-medium text-content">
            {row.original.number}
          </span>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        accessorFn: (r) => r.customerId,
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {customerName(row.original.customerId)}
          </span>
        ),
      },
      {
        accessorKey: 'orderDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.orderDate)}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Value',
        cell: ({ row }) => (
          <span className="num font-medium text-content">
            {formatINR(row.original.total)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge
            label={row.original.status.replace(/_/g, ' ')}
            tone={ORDER_TONE[row.original.status]}
          />
        ),
      },
    ],
    [customerName],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sales Orders"
        description={`${orders.length} confirmed sales orders`}
        icon={<ShoppingCart />}
      />
      <DataTable
        columns={columns}
        data={orders}
        getRowId={(o) => o.id}
        onRowClick={(o) => navigate(`/orders/${o.id}`)}
        searchPlaceholder="Search orders…"
        searchKeys={['number']}
        exportName="sales-orders"
        emptyTitle="No sales orders yet"
      />
    </div>
  );
}

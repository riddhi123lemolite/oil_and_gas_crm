import { useMemo } from 'react';
import { Boxes, AlertTriangle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { formatNumber, formatRelative } from '@/lib/format';
import type { InventoryRecord } from '@/types';

export default function Inventory() {
  const inventory = useDataStore((s) => s.inventory);
  const { itemMap } = useLookups();

  const lowStock = useMemo(
    () => inventory.filter((r) => r.quantity < r.reorderLevel).length,
    [inventory],
  );

  const columns = useMemo<ColumnDef<InventoryRecord, unknown>[]>(
    () => [
      {
        id: 'item',
        header: 'Product',
        accessorFn: (r) => itemMap.get(r.itemId)?.name ?? '',
        cell: ({ row }) => {
          const item = itemMap.get(row.original.itemId);
          return (
            <div>
              <div className="font-medium text-content">
                {item?.name ?? '—'}
              </div>
              <div className="num text-xs text-content-muted">
                {item?.code}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'warehouse',
        header: 'Warehouse',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {row.original.warehouse}
          </span>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'In Stock',
        cell: ({ row }) => {
          const item = itemMap.get(row.original.itemId);
          return (
            <span className="num font-medium text-content">
              {formatNumber(row.original.quantity)} {item?.unit ?? ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'reorderLevel',
        header: 'Reorder Level',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {formatNumber(row.original.reorderLevel)}
          </span>
        ),
      },
      {
        id: 'health',
        header: 'Status',
        cell: ({ row }) => {
          const low = row.original.quantity < row.original.reorderLevel;
          return low ? (
            <Badge tone="danger">
              <AlertTriangle className="size-3" /> Low Stock
            </Badge>
          ) : (
            <Badge tone="success">Healthy</Badge>
          );
        },
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => (
          <span className="text-xs text-content-muted">
            {formatRelative(row.original.updatedAt)}
          </span>
        ),
      },
    ],
    [itemMap],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Inventory"
        description={`${inventory.length} stock records · ${lowStock} below reorder level`}
        icon={<Boxes />}
      />
      {lowStock > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-warning/40 bg-warning/10 px-3 py-2 text-sm">
          <AlertTriangle className="size-4 text-warning" />
          <span className="text-content-secondary">
            {lowStock} product(s) have fallen below their reorder level.
          </span>
        </div>
      )}
      <DataTable
        columns={columns}
        data={inventory}
        getRowId={(r) => r.id}
        searchPlaceholder="Search inventory…"
        exportName="inventory"
      />
    </div>
  );
}

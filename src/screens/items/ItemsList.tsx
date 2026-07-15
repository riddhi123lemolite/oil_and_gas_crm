import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Package, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { ITEM_CATEGORY, ITEM_CATEGORY_COLOR } from '@/lib/constants';
import { formatINR, formatNumber, formatPercent } from '@/lib/format';
import type { Item, ItemCategory } from '@/types';

export default function ItemsList() {
  const navigate = useNavigate();
  const { can, canSeeMargins } = useAuth();
  const items = useDataStore((s) => s.items);
  const removeItem = useDataStore((s) => s.remove);
  const [category, setCategory] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<Item[] | null>(null);

  const filtered = useMemo(
    () => items.filter((i) => category === 'all' || i.category === category),
    [items, category],
  );

  const columns = useMemo<ColumnDef<Item, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Item',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <span
              className="size-2.5 rounded-full"
              style={{
                backgroundColor: ITEM_CATEGORY_COLOR[row.original.category],
              }}
            />
            <div>
              <div className="font-medium text-content">{row.original.name}</div>
              <div className="num text-xs text-content-muted">
                {row.original.code} · HSN {row.original.hsnCode}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => (
          <Badge tone="outline">
            {ITEM_CATEGORY[row.original.category].label}
          </Badge>
        ),
      },
      {
        accessorKey: 'rate',
        header: 'Rate',
        cell: ({ row }) => (
          <div>
            <div className="num font-medium text-content">
              {formatINR(row.original.rate)}
            </div>
            <div className="text-xs text-content-muted">
              per {row.original.unit}
            </div>
          </div>
        ),
      },
      ...(canSeeMargins
        ? [
            {
              id: 'margin',
              header: 'Margin',
              cell: ({ row }: { row: { original: Item } }) => {
                const item = row.original;
                const margin = item.rate - (item.costRate ?? 0);
                return (
                  <span className="num text-success">
                    {formatINR(margin)}/{item.unit}
                  </span>
                );
              },
            } as ColumnDef<Item, unknown>,
          ]
        : []),
      {
        accessorKey: 'gstPercent',
        header: 'GST',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {formatPercent(row.original.gstPercent)}
          </span>
        ),
      },
      {
        accessorKey: 'stockTotal',
        header: 'Stock',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {formatNumber(row.original.stockTotal)} {row.original.unit}
          </span>
        ),
      },
      {
        accessorKey: 'active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={row.original.active ? 'success' : 'neutral'}>
            {row.original.active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
    ],
    [canSeeMargins],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Items & Products"
        description={`${items.length} products in your catalogue`}
        icon={<Package />}
        actions={
          can('items', 'create') && (
            <Button onClick={() => navigate('/items/new')}>
              <Plus className="size-4" /> Add Item
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(i) => i.id}
        onRowClick={(i) => navigate(`/items/${i.id}`)}
        searchPlaceholder="Search items by name, code, HSN…"
        searchKeys={['name', 'code', 'hsnCode', 'group']}
        enableSelection
        exportName="items"
        exportMapper={(i) => ({
          Code: i.code,
          Name: i.name,
          HSN: i.hsnCode,
          Category: ITEM_CATEGORY[i.category].label,
          Unit: i.unit,
          Rate: i.rate,
          'GST %': i.gstPercent,
          Stock: i.stockTotal,
        })}
        emptyTitle="No items found"
        toolbar={
          <div className="w-48">
            <SelectField
              value={category}
              onChange={setCategory}
              options={[
                { value: 'all', label: 'All Categories' },
                ...(Object.keys(ITEM_CATEGORY) as ItemCategory[]).map((c) => ({
                  value: c,
                  label: ITEM_CATEGORY[c].label,
                })),
              ]}
            />
          </div>
        }
        bulkActions={(rows) =>
          can('items', 'delete') && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => setConfirmDelete(rows)}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          )
        }
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.length ?? 0} item(s)?`}
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          confirmDelete?.forEach((i) => removeItem('items', i.id));
          toast.success(`${confirmDelete?.length} item(s) deleted`);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

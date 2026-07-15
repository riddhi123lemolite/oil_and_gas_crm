import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { CUSTOMER_SEGMENT } from '@/lib/constants';
import { formatINRCompact, formatPhone, formatDate } from '@/lib/format';
import type { Customer } from '@/types';

export default function CustomersList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const customers = useDataStore((s) => s.customers);
  const removeCustomer = useDataStore((s) => s.remove);

  const [segment, setSegment] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<Customer[] | null>(null);

  const filtered = useMemo(
    () =>
      customers.filter((c) => segment === 'all' || c.segment === segment),
    [customers, segment],
  );

  const columns = useMemo<ColumnDef<Customer, unknown>[]>(
    () => [
      {
        accessorKey: 'companyName',
        header: 'Customer',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <EntityAvatar name={row.original.companyName} size="sm" />
            <div className="min-w-0">
              <div className="truncate font-medium text-content">
                {row.original.companyName}
              </div>
              <div className="num text-xs text-content-muted">
                {row.original.code}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'contactPerson',
        header: 'Contact',
        cell: ({ row }) => (
          <div>
            <div className="text-content-secondary">
              {row.original.contactPerson}
            </div>
            <div className="num text-xs text-content-muted">
              {formatPhone(row.original.phone)}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'gstin',
        header: 'GSTIN',
        cell: ({ row }) => (
          <span className="num text-xs text-content-secondary">
            {row.original.gstin ?? '—'}
          </span>
        ),
      },
      {
        id: 'location',
        header: 'Location',
        accessorFn: (row) => `${row.city}, ${row.state}`,
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {row.original.city}, {row.original.state}
          </span>
        ),
      },
      {
        accessorKey: 'segment',
        header: 'Segment',
        cell: ({ row }) => (
          <StatusBadge def={CUSTOMER_SEGMENT[row.original.segment]} />
        ),
      },
      {
        accessorKey: 'totalRevenue',
        header: 'Revenue',
        cell: ({ row }) => (
          <span className="num font-medium text-content">
            {formatINRCompact(row.original.totalRevenue)}
          </span>
        ),
      },
      {
        accessorKey: 'outstanding',
        header: 'Outstanding',
        cell: ({ row }) => (
          <span
            className={`num font-medium ${
              row.original.outstanding > 0 ? 'text-danger' : 'text-content-muted'
            }`}
          >
            {formatINRCompact(row.original.outstanding)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customers"
        description={`${customers.length} active customer accounts`}
        icon={<Building2 />}
        actions={
          can('customers', 'create') && (
            <Button onClick={() => navigate('/customers/new')}>
              <Plus className="size-4" /> Add Customer
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(c) => c.id}
        onRowClick={(c) => navigate(`/customers/${c.id}`)}
        searchPlaceholder="Search by company, contact, GSTIN…"
        searchKeys={['companyName', 'contactPerson', 'gstin', 'code', 'city']}
        enableSelection
        exportName="customers"
        exportMapper={(c) => ({
          Code: c.code,
          Company: c.companyName,
          Contact: c.contactPerson,
          Phone: c.phone,
          GSTIN: c.gstin ?? '',
          City: c.city,
          State: c.state,
          Segment: CUSTOMER_SEGMENT[c.segment].label,
          Revenue: c.totalRevenue,
          Outstanding: c.outstanding,
          'Credit Limit': c.creditLimit,
          'Customer Since': formatDate(c.createdAt),
        })}
        emptyTitle="No customers found"
        toolbar={
          <div className="w-44">
            <SelectField
              value={segment}
              onChange={setSegment}
              options={[
                { value: 'all', label: 'All Segments' },
                ...Object.entries(CUSTOMER_SEGMENT).map(([v, d]) => ({
                  value: v,
                  label: d.label,
                })),
              ]}
            />
          </div>
        }
        bulkActions={(rows) =>
          can('customers', 'delete') && (
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
        title={`Delete ${confirmDelete?.length ?? 0} customer(s)?`}
        description="This removes the selected customers from your demo data."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          confirmDelete?.forEach((c) => removeCustomer('customers', c.id));
          toast.success(`${confirmDelete?.length} customer(s) deleted`);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { DISPATCH_STATUS } from '@/lib/constants';
import { formatDateTime } from '@/lib/format';
import type { Dispatch } from '@/types';

export default function DispatchSchedule() {
  const navigate = useNavigate();
  const { customerName, itemName, routeLabel } = useLookups();
  const dispatches = useDataStore((s) => s.dispatches);
  const [status, setStatus] = useState('all');

  const filtered = useMemo(
    () => dispatches.filter((d) => status === 'all' || d.status === status),
    [dispatches, status],
  );

  const columns = useMemo<ColumnDef<Dispatch, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Dispatch No.',
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
        id: 'item',
        header: 'Product',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {itemName(row.original.itemId)} · {row.original.quantity}{' '}
            {row.original.unit}
          </span>
        ),
      },
      {
        id: 'route',
        header: 'Route',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {routeLabel(row.original.routeId)}
          </span>
        ),
      },
      {
        accessorKey: 'vehicleNo',
        header: 'Vehicle',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.vehicleNo ?? '—'}
          </span>
        ),
      },
      {
        accessorKey: 'scheduledAt',
        header: 'Scheduled',
        cell: ({ row }) => (
          <span className="text-xs text-content-secondary">
            {formatDateTime(row.original.scheduledAt)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge def={DISPATCH_STATUS[row.original.status]} />
        ),
      },
    ],
    [customerName, itemName, routeLabel],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Dispatch Schedule"
        description={`${dispatches.length} tanker dispatches`}
        icon={<Truck />}
      />
      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(d) => d.id}
        onRowClick={(d) => navigate(`/trips/${d.id}`)}
        searchPlaceholder="Search dispatches…"
        searchKeys={['number', 'vehicleNo', 'driverName']}
        exportName="dispatches"
        toolbar={
          <div className="w-44">
            <SelectField
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...Object.entries(DISPATCH_STATUS).map(([v, d]) => ({
                  value: v,
                  label: d.label,
                })),
              ]}
            />
          </div>
        }
      />
    </div>
  );
}

import { useMemo } from 'react';
import { Bus, AlertTriangle } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/tooltip';
import { useDataStore } from '@/stores/dataStore';
import { formatDate, daysBetween } from '@/lib/format';
import type { Vehicle } from '@/types';

function ExpiryCell({ date, label }: { date: string; label: string }) {
  const days = daysBetween(new Date(), date);
  const expired = days < 0;
  const soon = days >= 0 && days < 45;
  return (
    <span
      className={`num inline-flex items-center gap-1 ${
        expired ? 'text-danger' : soon ? 'text-warning' : 'text-content-secondary'
      }`}
    >
      {(expired || soon) && (
        <Tooltip content={`${label} ${expired ? 'expired' : `expires in ${days} days`}`}>
          <AlertTriangle className="size-3.5" />
        </Tooltip>
      )}
      {formatDate(date)}
    </span>
  );
}

export default function Vehicles() {
  const vehicles = useDataStore((s) => s.vehicles);
  const drivers = useDataStore((s) => s.drivers);

  const columns = useMemo<ColumnDef<Vehicle, unknown>[]>(() => {
    const driverName = (id?: string) =>
      drivers.find((d) => d.id === id)?.name ?? 'Unassigned';
    return [
      {
        accessorKey: 'registrationNo',
        header: 'Registration',
        cell: ({ row }) => (
          <span className="num font-medium text-content">
            {row.original.registrationNo}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-content-secondary">{row.original.type}</span>
        ),
      },
      {
        accessorKey: 'ownerType',
        header: 'Ownership',
        cell: ({ row }) => (
          <Badge tone={row.original.ownerType === 'OWNED' ? 'brand' : 'outline'}>
            {row.original.ownerType}
          </Badge>
        ),
      },
      {
        id: 'driver',
        header: 'Driver',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {driverName(row.original.currentDriverId)}
          </span>
        ),
      },
      {
        accessorKey: 'rcExpiry',
        header: 'RC Expiry',
        cell: ({ row }) => <ExpiryCell date={row.original.rcExpiry} label="RC" />,
      },
      {
        accessorKey: 'fitnessExpiry',
        header: 'Fitness',
        cell: ({ row }) => (
          <ExpiryCell date={row.original.fitnessExpiry} label="Fitness" />
        ),
      },
      {
        accessorKey: 'insuranceExpiry',
        header: 'Insurance',
        cell: ({ row }) => (
          <ExpiryCell date={row.original.insuranceExpiry} label="Insurance" />
        ),
      },
    ];
  }, [drivers]);

  const warnings = vehicles.filter(
    (v) =>
      daysBetween(new Date(), v.fitnessExpiry) < 45 ||
      daysBetween(new Date(), v.insuranceExpiry) < 45,
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Vehicles / Tankers"
        description={`${vehicles.length} tankers · ${warnings} with expiring documents`}
        icon={<Bus />}
      />
      <DataTable
        columns={columns}
        data={vehicles}
        getRowId={(v) => v.id}
        searchPlaceholder="Search by registration…"
        searchKeys={['registrationNo', 'type']}
        exportName="vehicles"
      />
    </div>
  );
}

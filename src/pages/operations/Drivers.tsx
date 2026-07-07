import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { formatDate, formatPhone } from '@/lib/format';
import type { Driver } from '@/types';

export default function Drivers() {
  const navigate = useNavigate();
  const drivers = useDataStore((s) => s.drivers);
  const vehicles = useDataStore((s) => s.vehicles);

  const columns = useMemo<ColumnDef<Driver, unknown>[]>(() => {
    const vehicleFor = (driverId: string) =>
      vehicles.find((v) => v.currentDriverId === driverId)?.registrationNo;
    return [
      {
        accessorKey: 'name',
        header: 'Driver',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <EntityAvatar name={row.original.name} size="sm" />
            <span className="font-medium text-content">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Mobile',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {formatPhone(row.original.phone)}
          </span>
        ),
      },
      {
        accessorKey: 'licenseNo',
        header: 'License No.',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.licenseNo}
          </span>
        ),
      },
      {
        accessorKey: 'licenseExpiry',
        header: 'License Expiry',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.licenseExpiry)}
          </span>
        ),
      },
      {
        accessorKey: 'experienceYears',
        header: 'Experience',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.experienceYears} yrs
          </span>
        ),
      },
      {
        id: 'assignment',
        header: 'Current Vehicle',
        cell: ({ row }) => {
          const veh = vehicleFor(row.original.id);
          return veh ? (
            <span className="num text-content-secondary">{veh}</span>
          ) : (
            <Badge tone="neutral">Available</Badge>
          );
        },
      },
    ];
  }, [vehicles]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Drivers"
        description={`${drivers.length} drivers in your fleet`}
        icon={<IdCard />}
        actions={
          <Button onClick={() => navigate('/drivers/new')}>
            <Plus className="size-4" /> Add Driver
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={drivers}
        getRowId={(d) => d.id}
        searchPlaceholder="Search drivers…"
        searchKeys={['name', 'phone', 'licenseNo']}
        exportName="drivers"
      />
    </div>
  );
}

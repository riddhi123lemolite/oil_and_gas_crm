import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Route as RouteIcon, MapPin } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { formatINR, formatNumber } from '@/lib/format';
import type { TransportRoute } from '@/types';

export default function TransportRoutes() {
  const navigate = useNavigate();
  const routes = useDataStore((s) => s.routes);

  const columns = useMemo<ColumnDef<TransportRoute, unknown>[]>(
    () => [
      {
        id: 'route',
        header: 'Route',
        accessorFn: (r) => `${r.fromLocation} ${r.toLocation}`,
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-content-muted" />
            <span className="font-medium text-content">
              {row.original.fromLocation}
            </span>
            <span className="text-content-muted">→</span>
            <span className="font-medium text-content">
              {row.original.toLocation}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'distanceKm',
        header: 'Distance',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {formatNumber(row.original.distanceKm)} km
          </span>
        ),
      },
      {
        accessorKey: 'baseRent',
        header: 'Base Rent',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.baseRent ? formatINR(row.original.baseRent) : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'perKmRate',
        header: 'Per KM',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.perKmRate ? `₹${row.original.perKmRate}` : '—'}
          </span>
        ),
      },
      {
        accessorKey: 'carrier',
        header: 'Carrier',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {row.original.carrier ?? '—'}
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
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Transport Routes"
        description={`${routes.length} routes in your network`}
        icon={<RouteIcon />}
        actions={
          <Button onClick={() => navigate('/routes/new')}>
            <Plus className="size-4" /> Add Route
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={routes}
        getRowId={(r) => r.id}
        searchPlaceholder="Search by location, carrier…"
        searchKeys={['fromLocation', 'toLocation', 'carrier']}
        exportName="transport-routes"
        exportMapper={(r) => ({
          From: r.fromLocation,
          To: r.toLocation,
          'Distance (km)': r.distanceKm,
          'Base Rent': r.baseRent ?? '',
          'Per KM': r.perKmRate ?? '',
          Carrier: r.carrier ?? '',
        })}
      />
    </div>
  );
}

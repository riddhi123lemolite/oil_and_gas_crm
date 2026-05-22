import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Upload, Target, Trash2, UserCheck, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms/SelectField';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import {
  LEAD_STATUS,
  LEAD_TEMPERATURE,
  LEAD_SOURCE,
  LEAD_ROW_TINT,
} from '@/lib/constants';
import { formatINRCompact, formatRelative } from '@/lib/format';
import type { Lead, LeadStatus } from '@/types';

export default function LeadsList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { userName } = useLookups();
  const leads = useDataStore((s) => s.leads);
  const removeLead = useDataStore((s) => s.remove);
  const updateLead = useDataStore((s) => s.update);

  const [statusFilter, setStatusFilter] = useState('all');
  const [tempFilter, setTempFilter] = useState('all');
  const [confirmDelete, setConfirmDelete] = useState<Lead[] | null>(null);

  const filtered = useMemo(
    () =>
      leads.filter(
        (l) =>
          (statusFilter === 'all' || l.status === statusFilter) &&
          (tempFilter === 'all' || l.temperature === tempFilter),
      ),
    [leads, statusFilter, tempFilter],
  );

  const columns = useMemo<ColumnDef<Lead, unknown>[]>(
    () => [
      {
        accessorKey: 'code',
        header: 'Lead',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <EntityAvatar name={row.original.companyName ?? row.original.name} size="sm" />
            <div className="min-w-0">
              <div className="truncate font-medium text-content">
                {row.original.companyName ?? row.original.name}
              </div>
              <div className="num text-xs text-content-muted">
                {row.original.code}
              </div>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Contact',
        cell: ({ row }) => (
          <div>
            <div className="num text-content-secondary">
              {row.original.phone}
            </div>
            <div className="text-xs text-content-muted">
              {row.original.city}, {row.original.state}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {LEAD_SOURCE[row.original.source]}
          </span>
        ),
      },
      {
        accessorKey: 'temperature',
        header: 'Temp',
        cell: ({ row }) => (
          <StatusBadge def={LEAD_TEMPERATURE[row.original.temperature]} dot />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Stage',
        cell: ({ row }) => (
          <StatusBadge def={LEAD_STATUS[row.original.status]} />
        ),
      },
      {
        accessorKey: 'estimatedValue',
        header: 'Est. Value',
        cell: ({ row }) => (
          <span className="num font-medium text-content">
            {formatINRCompact(row.original.estimatedValue ?? 0)}
          </span>
        ),
      },
      {
        accessorKey: 'assignedToId',
        header: 'Owner',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {userName(row.original.assignedToId)}
          </span>
        ),
      },
      {
        accessorKey: 'lastActivityAt',
        header: 'Last Activity',
        cell: ({ row }) => (
          <span className="text-xs text-content-muted">
            {formatRelative(row.original.lastActivityAt)}
          </span>
        ),
      },
    ],
    [userName],
  );

  const bulkSetStatus = (rows: Lead[], status: LeadStatus, clear: () => void) => {
    rows.forEach((r) =>
      updateLead('leads', r.id, {
        status,
        updatedAt: new Date().toISOString(),
      }),
    );
    toast.success(`${rows.length} lead(s) moved to ${LEAD_STATUS[status].label}`);
    clear();
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Leads"
        description={`${leads.length} leads in your pipeline`}
        icon={<Target />}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate('/leads/import')}>
              <Upload className="size-4" /> Import
            </Button>
            {can('leads', 'create') && (
              <Button onClick={() => navigate('/leads/new')}>
                <Plus className="size-4" /> Add Lead
              </Button>
            )}
          </>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(l) => l.id}
        onRowClick={(l) => navigate(`/leads/${l.id}`)}
        searchPlaceholder="Search leads by name, company, phone…"
        searchKeys={['name', 'companyName', 'phone', 'code', 'city']}
        enableSelection
        rowClassName={(l) => LEAD_ROW_TINT[l.temperature]}
        exportName="leads"
        exportMapper={(l) => ({
          Code: l.code,
          Name: l.name,
          Company: l.companyName ?? '',
          Phone: l.phone,
          City: l.city,
          State: l.state,
          Source: LEAD_SOURCE[l.source],
          Status: LEAD_STATUS[l.status].label,
          Temperature: LEAD_TEMPERATURE[l.temperature].label,
          'Estimated Value': l.estimatedValue ?? 0,
          Owner: userName(l.assignedToId),
        })}
        emptyTitle="No leads found"
        emptyDescription="Adjust your filters or add a new lead to get started."
        toolbar={
          <>
            <div className="w-40">
              <SelectField
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: 'All Stages' },
                  ...Object.entries(LEAD_STATUS).map(([v, d]) => ({
                    value: v,
                    label: d.label,
                  })),
                ]}
              />
            </div>
            <div className="w-36">
              <SelectField
                value={tempFilter}
                onChange={setTempFilter}
                options={[
                  { value: 'all', label: 'All Temps' },
                  ...Object.entries(LEAD_TEMPERATURE).map(([v, d]) => ({
                    value: v,
                    label: d.label,
                  })),
                ]}
              />
            </div>
          </>
        }
        bulkActions={(rows, clear) => (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Flame className="size-4" /> Set Stage
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {Object.entries(LEAD_STATUS).map(([v, d]) => (
                  <DropdownMenuItem
                    key={v}
                    onClick={() =>
                      bulkSetStatus(rows, v as LeadStatus, clear)
                    }
                  >
                    {d.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast.success(`${rows.length} lead(s) reassigned`);
                clear();
              }}
            >
              <UserCheck className="size-4" /> Reassign
            </Button>
            {can('leads', 'delete') && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setConfirmDelete(rows)}
              >
                <Trash2 className="size-4" /> Delete
              </Button>
            )}
          </>
        )}
      />

      <ConfirmDialog
        open={!!confirmDelete}
        onOpenChange={(o) => !o && setConfirmDelete(null)}
        title={`Delete ${confirmDelete?.length ?? 0} lead(s)?`}
        description="This removes the selected leads from your browser's demo data. You can restore the original data from Settings."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          confirmDelete?.forEach((l) => removeLead('leads', l.id));
          toast.success(`${confirmDelete?.length} lead(s) deleted`);
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

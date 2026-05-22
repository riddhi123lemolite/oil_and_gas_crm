import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, FileText, ShieldAlert } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import { PROPOSAL_STATUS } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import type { Proposal } from '@/types';

export default function ProposalsList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { customerName } = useLookups();
  const proposals = useDataStore((s) => s.proposals);
  const [status, setStatus] = useState('all');

  const filtered = useMemo(
    () => proposals.filter((p) => status === 'all' || p.status === status),
    [proposals, status],
  );

  const columns = useMemo<ColumnDef<Proposal, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Proposal',
        cell: ({ row }) => (
          <div>
            <div className="num font-medium text-content">
              {row.original.number}
            </div>
            <div className="truncate text-xs text-content-muted">
              {row.original.subject}
            </div>
          </div>
        ),
      },
      {
        id: 'customer',
        header: 'Customer',
        accessorFn: (row) => row.customerId ?? '',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {customerName(row.original.customerId)}
          </span>
        ),
      },
      {
        accessorKey: 'proposalDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.proposalDate)}
          </span>
        ),
      },
      {
        accessorKey: 'total',
        header: 'Value',
        cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <span className="num font-medium text-content">
              {formatINR(row.original.total)}
            </span>
            {row.original.needsApproval && !row.original.approvedById && (
              <ShieldAlert className="size-3.5 text-warning" />
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <StatusBadge def={PROPOSAL_STATUS[row.original.status]} />
        ),
      },
    ],
    [customerName],
  );

  const pendingApproval = proposals.filter(
    (p) => p.needsApproval && !p.approvedById,
  ).length;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Proposals"
        description={`${proposals.length} proposals · ${pendingApproval} pending approval`}
        icon={<FileText />}
        actions={
          can('proposals', 'create') && (
            <Button onClick={() => navigate('/proposals/new')}>
              <Plus className="size-4" /> Create Proposal
            </Button>
          )
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(p) => p.id}
        onRowClick={(p) => navigate(`/proposals/${p.id}`)}
        searchPlaceholder="Search proposals by number, subject…"
        searchKeys={['number', 'subject']}
        exportName="proposals"
        exportMapper={(p) => ({
          Number: p.number,
          Subject: p.subject,
          Customer: customerName(p.customerId),
          Date: formatDate(p.proposalDate),
          Status: PROPOSAL_STATUS[p.status].label,
          Total: p.total,
        })}
        emptyTitle="No proposals found"
        toolbar={
          <div className="w-44">
            <SelectField
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All Statuses' },
                ...Object.entries(PROPOSAL_STATUS).map(([v, d]) => ({
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

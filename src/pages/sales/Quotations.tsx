import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileCheck2 } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { PROPOSAL_STATUS } from '@/lib/constants';
import { formatINR, formatDate } from '@/lib/format';
import type { Proposal } from '@/types';

export default function Quotations() {
  const navigate = useNavigate();
  const { customerName } = useLookups();
  const proposals = useDataStore((s) => s.proposals);

  // Quotations are proposals that have been shared with a customer.
  const quotations = useMemo(
    () =>
      proposals.filter((p) =>
        ['SENT', 'UNDER_REVIEW', 'NEGOTIATION'].includes(p.status),
      ),
    [proposals],
  );

  const columns = useMemo<ColumnDef<Proposal, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Quotation No.',
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
        accessorKey: 'subject',
        header: 'Subject',
        cell: ({ row }) => (
          <span className="text-content-secondary">{row.original.subject}</span>
        ),
      },
      {
        accessorKey: 'validUntil',
        header: 'Valid Until',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.validUntil)}
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
          <StatusBadge def={PROPOSAL_STATUS[row.original.status]} />
        ),
      },
    ],
    [customerName],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Quotations"
        description={`${quotations.length} quotations shared with customers`}
        icon={<FileCheck2 />}
      />
      <DataTable
        columns={columns}
        data={quotations}
        getRowId={(p) => p.id}
        onRowClick={(p) => navigate(`/proposals/${p.id}`)}
        searchPlaceholder="Search quotations…"
        searchKeys={['number', 'subject']}
        exportName="quotations"
        emptyTitle="No active quotations"
        emptyDescription="Proposals that are sent or under negotiation appear here."
      />
    </div>
  );
}

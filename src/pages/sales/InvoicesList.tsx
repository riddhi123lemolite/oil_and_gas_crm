import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ReceiptIndianRupee } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { Button } from '@/components/ui/button';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { useLookups } from '@/hooks/useLookups';
import { INVOICE_STATUS } from '@/lib/constants';
import { formatINR, formatDate, daysBetween } from '@/lib/format';
import type { Invoice } from '@/types';

export default function InvoicesList() {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { customerName } = useLookups();
  const invoices = useDataStore((s) => s.invoices);
  const [status, setStatus] = useState('all');

  const filtered = useMemo(
    () => invoices.filter((i) => status === 'all' || i.status === status),
    [invoices, status],
  );

  const summary = useMemo(() => {
    const outstanding = invoices
      .filter((i) => i.status !== 'PAID')
      .reduce((s, i) => s + (i.total - i.amountPaid), 0);
    const overdue = invoices.filter((i) => i.status === 'OVERDUE').length;
    return { outstanding, overdue };
  }, [invoices]);

  const columns = useMemo<ColumnDef<Invoice, unknown>[]>(
    () => [
      {
        accessorKey: 'number',
        header: 'Invoice No.',
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
        accessorKey: 'invoiceDate',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.invoiceDate)}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due',
        cell: ({ row }) => {
          const overdue = row.original.status === 'OVERDUE';
          return (
            <span className={overdue ? 'text-danger' : 'text-content-secondary'}>
              {formatDate(row.original.dueDate)}
              {overdue && (
                <span className="ml-1 text-xs">
                  ({daysBetween(row.original.dueDate, new Date())}d)
                </span>
              )}
            </span>
          );
        },
      },
      {
        accessorKey: 'total',
        header: 'Amount',
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
          <StatusBadge def={INVOICE_STATUS[row.original.status]} />
        ),
      },
    ],
    [customerName],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Invoices"
        description={`${invoices.length} invoices · ${summary.overdue} overdue`}
        icon={<ReceiptIndianRupee />}
        actions={
          can('invoices', 'create') && (
            <Button onClick={() => navigate('/invoices/new')}>
              <Plus className="size-4" /> Create Invoice
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Total Invoices" value={String(invoices.length)} />
        <Stat
          label="Outstanding"
          value={formatINR(summary.outstanding)}
          danger
        />
        <Stat
          label="Overdue"
          value={String(summary.overdue)}
          danger={summary.overdue > 0}
        />
        <Stat
          label="Paid"
          value={String(invoices.filter((i) => i.status === 'PAID').length)}
        />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(i) => i.id}
        onRowClick={(i) => navigate(`/invoices/${i.id}`)}
        searchPlaceholder="Search invoices…"
        searchKeys={['number']}
        exportName="invoices"
        exportMapper={(i) => ({
          Number: i.number,
          Customer: customerName(i.customerId),
          Date: formatDate(i.invoiceDate),
          Due: formatDate(i.dueDate),
          Status: INVOICE_STATUS[i.status].label,
          Total: i.total,
          Paid: i.amountPaid,
        })}
        toolbar={
          <div className="w-40">
            <SelectField
              value={status}
              onChange={setStatus}
              options={[
                { value: 'all', label: 'All Invoices' },
                ...Object.entries(INVOICE_STATUS).map(([v, d]) => ({
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

function Stat({
  label,
  value,
  danger,
}: {
  label: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="text-xs uppercase tracking-wide text-content-muted">
        {label}
      </div>
      <div
        className={`num mt-1 text-lg font-bold ${danger ? 'text-danger' : 'text-content'}`}
      >
        {value}
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Wallet } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { formatINR, formatDate } from '@/lib/format';
import type { Payment } from '@/types';

export default function Payments() {
  const { customerName } = useLookups();
  const payments = useDataStore((s) => s.payments);
  const invoices = useDataStore((s) => s.invoices);

  const total = useMemo(
    () => payments.reduce((s, p) => s + p.amount, 0),
    [payments],
  );

  const invoiceNumber = (invoiceId: string) =>
    invoices.find((i) => i.id === invoiceId)?.number ?? '—';

  const columns = useMemo<ColumnDef<Payment, unknown>[]>(() => {
    const lookupInvoice = (invoiceId: string) =>
      invoices.find((i) => i.id === invoiceId)?.number ?? '—';
    return [
      {
        accessorKey: 'number',
        header: 'Receipt No.',
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
        id: 'invoice',
        header: 'Invoice',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {lookupInvoice(row.original.invoiceId)}
          </span>
        ),
      },
      {
        accessorKey: 'mode',
        header: 'Mode',
        cell: ({ row }) => <Badge tone="outline">{row.original.mode}</Badge>,
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="num text-xs text-content-muted">
            {row.original.reference}
          </span>
        ),
      },
      {
        accessorKey: 'paidAt',
        header: 'Date',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.paidAt)}
          </span>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <span className="num font-semibold text-success">
            {formatINR(row.original.amount)}
          </span>
        ),
      },
    ];
  }, [customerName, invoices]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Payments"
        description={`${payments.length} payments received · ${formatINR(total)} total`}
        icon={<Wallet />}
      />
      <DataTable
        columns={columns}
        data={payments}
        getRowId={(p) => p.id}
        searchPlaceholder="Search payments…"
        searchKeys={['number', 'reference']}
        exportName="payments"
        exportMapper={(p) => ({
          Receipt: p.number,
          Customer: customerName(p.customerId),
          Invoice: invoiceNumber(p.invoiceId),
          Mode: p.mode,
          Reference: p.reference,
          Date: formatDate(p.paidAt),
          Amount: p.amount,
        })}
      />
    </div>
  );
}

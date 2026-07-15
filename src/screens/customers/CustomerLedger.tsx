import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Receipt } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { formatINR, formatDate } from '@/lib/format';

interface LedgerEntry {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
}

export default function CustomerLedger() {
  const { id } = useParams();
  const navigate = useNavigate();
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const payments = useDataStore((s) => s.payments);

  const customer = customers.find((c) => c.id === id);

  const entries = useMemo<LedgerEntry[]>(() => {
    if (!customer) return [];
    const rows: LedgerEntry[] = [];
    invoices
      .filter((i) => i.customerId === customer.id)
      .forEach((i) =>
        rows.push({
          date: i.invoiceDate,
          particulars: `Invoice ${i.number}`,
          debit: i.total,
          credit: 0,
        }),
      );
    payments
      .filter((p) => p.customerId === customer.id)
      .forEach((p) =>
        rows.push({
          date: p.paidAt,
          particulars: `Payment ${p.number} (${p.mode})`,
          debit: 0,
          credit: p.amount,
        }),
      );
    return rows.sort((a, b) => a.date.localeCompare(b.date));
  }, [customer, invoices, payments]);

  if (!customer) {
    return (
      <EmptyState
        title="Customer not found"
        actionLabel="Back"
        onAction={() => navigate('/customers')}
      />
    );
  }

  let balance = 0;
  const totalDebit = entries.reduce((s, e) => s + e.debit, 0);
  const totalCredit = entries.reduce((s, e) => s + e.credit, 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Customer Ledger"
        description={`${customer.companyName} · ${customer.code}`}
        icon={<Receipt />}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3.5">
          <div className="text-xs uppercase text-content-muted">Total Billed</div>
          <div className="num mt-1 text-xl font-bold text-content">
            {formatINR(totalDebit)}
          </div>
        </div>
        <div className="card p-3.5">
          <div className="text-xs uppercase text-content-muted">Total Received</div>
          <div className="num mt-1 text-xl font-bold text-success">
            {formatINR(totalCredit)}
          </div>
        </div>
        <div className="card p-3.5">
          <div className="text-xs uppercase text-content-muted">Closing Balance</div>
          <div className="num mt-1 text-xl font-bold text-danger">
            {formatINR(totalDebit - totalCredit)}
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Statement of Account</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          {entries.length === 0 ? (
            <EmptyState compact title="No ledger entries" />
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr className="text-left text-[11px] uppercase tracking-wide text-content-muted">
                  <th className="px-4 py-2.5">Date</th>
                  <th className="px-4 py-2.5">Particulars</th>
                  <th className="px-4 py-2.5 text-right">Debit</th>
                  <th className="px-4 py-2.5 text-right">Credit</th>
                  <th className="px-4 py-2.5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((e, i) => {
                  balance += e.debit - e.credit;
                  return (
                    <tr key={i} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 text-content-secondary">
                        {formatDate(e.date)}
                      </td>
                      <td className="px-4 py-2.5 text-content">
                        {e.particulars}
                      </td>
                      <td className="num px-4 py-2.5 text-right text-content-secondary">
                        {e.debit ? formatINR(e.debit) : '—'}
                      </td>
                      <td className="num px-4 py-2.5 text-right text-success">
                        {e.credit ? formatINR(e.credit) : '—'}
                      </td>
                      <td className="num px-4 py-2.5 text-right font-semibold text-content">
                        {formatINR(balance)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

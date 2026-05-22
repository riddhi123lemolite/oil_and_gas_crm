import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReceiptIndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { CurrencyInput } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { calculateGst } from '@/lib/gst';
import { formatINR, toInputDate } from '@/lib/format';
import { generateId } from '@/lib/utils';
import type { Invoice } from '@/types';

export default function CreateInvoice() {
  const navigate = useNavigate();
  const orders = useDataStore((s) => s.orders);
  const customers = useDataStore((s) => s.customers);
  const invoices = useDataStore((s) => s.invoices);
  const addInvoice = useDataStore((s) => s.add);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [orderId, setOrderId] = useState('');
  const [transport, setTransport] = useState(0);
  const [invoiceDate, setInvoiceDate] = useState(
    toInputDate(new Date().toISOString()),
  );

  const order = orders.find((o) => o.id === orderId);
  const customer = customers.find((c) => c.id === order?.customerId);

  const totals = useMemo(
    () =>
      calculateGst(
        order?.items ?? [],
        customer?.state ?? 'Gujarat',
        transport,
      ),
    [order, customer, transport],
  );

  const create = () => {
    if (!order || !customer) {
      toast.error('Select a sales order first.');
      return;
    }
    const seq = String(invoices.length + 1).padStart(5, '0');
    const due = new Date(invoiceDate);
    due.setDate(due.getDate() + customer.paymentTermsDays);
    const invoice: Invoice = {
      id: generateId('inv'),
      number: `INV/2026/${seq}`,
      customerId: customer.id,
      orderId: order.id,
      invoiceDate: new Date(invoiceDate).toISOString(),
      dueDate: due.toISOString(),
      status: 'UNPAID',
      items: order.items,
      subtotal: totals.subtotal,
      cgst: totals.cgst,
      sgst: totals.sgst,
      igst: totals.igst,
      transportCharge: transport,
      total: totals.total,
      amountPaid: 0,
      createdById: currentUser?.id ?? 'user_04',
      createdAt: new Date().toISOString(),
    };
    addInvoice('invoices', invoice);
    toast.success('Invoice created');
    navigate(`/invoices/${invoice.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Create Invoice"
        description="Generate a GST-compliant tax invoice from a sales order"
        icon={<ReceiptIndianRupee />}
      />

      <Card>
        <CardContent>
          <FormGrid>
            <FormField label="Sales Order" required>
              <SelectField
                value={orderId}
                onChange={setOrderId}
                placeholder="Select an order to invoice"
                options={orders.map((o) => ({
                  value: o.id,
                  label: `${o.number} — ${customers.find((c) => c.id === o.customerId)?.companyName ?? ''}`,
                }))}
              />
            </FormField>
            <FormField label="Invoice Date">
              <Input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
              />
            </FormField>
          </FormGrid>
        </CardContent>
      </Card>

      {order && customer && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Invoice Items</CardTitle>
              <span className="text-xs text-content-muted">
                Pre-filled from {order.number}
              </span>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full min-w-[460px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-[11px] uppercase text-content-muted">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Qty</th>
                    <th className="py-2 text-right">Rate</th>
                    <th className="py-2 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((li) => (
                    <tr key={li.id} className="border-b border-line last:border-0">
                      <td className="py-2 text-content">{li.description}</td>
                      <td className="num py-2 text-right text-content-secondary">
                        {li.quantity} {li.unit}
                      </td>
                      <td className="num py-2 text-right text-content-secondary">
                        {formatINR(li.rate)}
                      </td>
                      <td className="num py-2 text-right font-medium text-content">
                        {formatINR(li.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2">
            <Card>
              <CardContent>
                <FormField label="Transportation Charge">
                  <CurrencyInput value={transport} onChange={setTransport} />
                </FormField>
                <p className="mt-2 text-xs text-content-muted">
                  {totals.intraState
                    ? 'Intra-state — CGST + SGST applied.'
                    : `Inter-state to ${customer.state} — IGST applied.`}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-1.5 text-sm">
                <Row label="Subtotal" value={formatINR(totals.subtotal)} />
                <Row label="Transport" value={formatINR(transport)} />
                {totals.intraState ? (
                  <>
                    <Row label="CGST" value={formatINR(totals.cgst)} />
                    <Row label="SGST" value={formatINR(totals.sgst)} />
                  </>
                ) : (
                  <Row label="IGST" value={formatINR(totals.igst)} />
                )}
                <div className="flex justify-between border-t border-line pt-1.5 text-base font-semibold">
                  <span>Grand Total</span>
                  <span className="num text-brand-primary dark:text-brand-secondary">
                    {formatINR(totals.total)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      <Card>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => navigate('/invoices')}>
            Cancel
          </Button>
          <Button onClick={create} disabled={!order}>
            Create Invoice
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-content-muted">{label}</span>
      <span className="num font-medium text-content">{value}</span>
    </div>
  );
}

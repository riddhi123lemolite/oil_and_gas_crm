import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { calculateGst, lineAmount } from '@/lib/gst';
import { formatINR, toInputDate } from '@/lib/format';
import { generateId } from '@/lib/utils';
import type { SalesOrder, ProposalItem, OrderStatus } from '@/types';

interface DraftLine {
  id: string;
  itemId: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  discount: number;
  gstPercent: number;
}

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'PARTIALLY_DISPATCHED', label: 'Partially Dispatched' },
  { value: 'DISPATCHED', label: 'Dispatched' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export default function OrderForm() {
  const navigate = useNavigate();
  const orders = useDataStore((s) => s.orders);
  const customers = useDataStore((s) => s.customers);
  const items = useDataStore((s) => s.items);
  const addOrder = useDataStore((s) => s.add);
  const currentUser = useAuthStore((s) => s.currentUser);

  const [customerId, setCustomerId] = useState('');
  const [orderDate, setOrderDate] = useState(toInputDate(new Date().toISOString()));
  const [status, setStatus] = useState<OrderStatus>('CONFIRMED');
  const [lines, setLines] = useState<DraftLine[]>([]);

  const customer = customers.find((c) => c.id === customerId);

  const builtItems = useMemo<ProposalItem[]>(
    () =>
      lines.map((l) => ({
        id: l.id,
        itemId: l.itemId,
        description: l.description,
        unit: l.unit as ProposalItem['unit'],
        quantity: l.quantity,
        rate: l.rate,
        discount: l.discount,
        gstPercent: l.gstPercent,
        amount: lineAmount(l.quantity, l.rate, l.discount),
      })),
    [lines],
  );

  const totals = useMemo(
    () => calculateGst(builtItems, customer?.state ?? 'Gujarat', 0),
    [builtItems, customer],
  );

  const addLine = () => {
    const first = items[0];
    if (!first) return;
    setLines((ls) => [
      ...ls,
      {
        id: generateId('line'),
        itemId: first.id,
        description: first.name,
        quantity: 10,
        unit: first.unit,
        rate: first.rate,
        discount: 0,
        gstPercent: first.gstPercent,
      },
    ]);
  };

  const updateLine = (lineId: string, patch: Partial<DraftLine>) =>
    setLines((ls) => ls.map((l) => (l.id === lineId ? { ...l, ...patch } : l)));

  const onItemChange = (lineId: string, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    updateLine(lineId, { itemId, description: item.name, unit: item.unit, rate: item.rate, gstPercent: item.gstPercent });
  };

  const save = () => {
    if (!customerId || lines.length === 0) {
      toast.error('Pick a customer and add at least one line item.');
      return;
    }
    const seq = String(orders.length + 1).padStart(5, '0');
    const order: SalesOrder = {
      id: generateId('ord'),
      number: `SO/2026/${seq}`,
      customerId,
      orderDate: new Date(orderDate).toISOString(),
      status,
      items: builtItems,
      subtotal: totals.subtotal,
      taxTotal: totals.cgst + totals.sgst + totals.igst,
      total: totals.total,
      createdById: currentUser?.id ?? 'user_03',
      createdAt: new Date().toISOString(),
    };
    addOrder('orders', order);
    toast.success('Sales order created');
    navigate(`/orders/${order.id}`);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader title="Create Sales Order" description="Confirm a customer order with automatic GST calculation" icon={<ShoppingCart />} />

      <Card>
        <CardContent>
          <FormGrid>
            <FormField label="Customer" required>
              <SelectField
                value={customerId}
                onChange={setCustomerId}
                placeholder="Select a customer"
                options={customers.map((c) => ({ value: c.id, label: c.companyName }))}
              />
            </FormField>
            <FormField label="Order Date">
              <Input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} />
            </FormField>
            <FormField label="Status">
              <SelectField value={status} onChange={(v) => setStatus(v as OrderStatus)} options={STATUS_OPTIONS} />
            </FormField>
          </FormGrid>
          {customer && (
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-xs text-content-secondary">
              {customer.state === 'Gujarat'
                ? 'Intra-state supply — CGST 9% + SGST 9% will apply.'
                : `Inter-state supply to ${customer.state} — IGST 18% will apply.`}
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Line Items</CardTitle>
          <Button size="sm" variant="outline" onClick={addLine}>
            <Plus className="size-4" /> Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-2 overflow-x-auto">
          {lines.length === 0 ? (
            <p className="py-6 text-center text-sm text-content-muted">No line items yet. Click "Add Item" to start.</p>
          ) : (
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase text-content-muted">
                  <th className="pb-2">Item</th>
                  <th className="pb-2 text-right">Qty</th>
                  <th className="pb-2 text-right">Rate</th>
                  <th className="pb-2 text-right">Disc %</th>
                  <th className="pb-2 text-right">GST %</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {lines.map((line) => (
                  <tr key={line.id} className="border-t border-line">
                    <td className="py-2 pr-2">
                      <SelectField value={line.itemId} onChange={(v) => onItemChange(line.id, v)} options={items.map((i) => ({ value: i.id, label: i.name }))} />
                    </td>
                    <td className="py-2 pr-1">
                      <Input type="number" className="num w-20 text-right" value={line.quantity} onChange={(e) => updateLine(line.id, { quantity: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 pr-1">
                      <Input type="number" className="num w-24 text-right" value={line.rate} onChange={(e) => updateLine(line.id, { rate: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 pr-1">
                      <Input type="number" className="num w-16 text-right" value={line.discount} onChange={(e) => updateLine(line.id, { discount: Number(e.target.value) })} />
                    </td>
                    <td className="py-2 pr-1">
                      <Input type="number" className="num w-16 text-right" value={line.gstPercent} onChange={(e) => updateLine(line.id, { gstPercent: Number(e.target.value) })} />
                    </td>
                    <td className="num py-2 pr-2 text-right font-medium text-content">
                      {formatINR(lineAmount(line.quantity, line.rate, line.discount))}
                    </td>
                    <td className="py-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => setLines((ls) => ls.filter((l) => l.id !== line.id))}>
                        <Trash2 className="text-danger" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <div />
        <Card>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatINR(totals.subtotal)} />
            {totals.intraState ? (
              <>
                <Row label="CGST" value={formatINR(totals.cgst)} />
                <Row label="SGST" value={formatINR(totals.sgst)} />
              </>
            ) : (
              <Row label="IGST (18%)" value={formatINR(totals.igst)} />
            )}
            <div className="flex items-center justify-between border-t border-line pt-2 text-base font-semibold">
              <span className="text-content">Order Total</span>
              <span className="num text-brand-primary dark:text-brand-secondary">{formatINR(totals.total)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => navigate('/orders')}>Cancel</Button>
          <Button onClick={save}>Create Order</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-content-muted">{label}</span>
      <span className="num font-medium text-content">{value}</span>
    </div>
  );
}

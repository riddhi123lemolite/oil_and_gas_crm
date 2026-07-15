import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FileText, Plus, Trash2 } from 'lucide-react';
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
import { calculateGst, lineAmount } from '@/lib/gst';
import { formatINR } from '@/lib/format';
import { generateId } from '@/lib/utils';
import { toInputDate } from '@/lib/format';
import type { Proposal, ProposalItem } from '@/types';

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

export default function ProposalForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const proposals = useDataStore((s) => s.proposals);
  const customers = useDataStore((s) => s.customers);
  const items = useDataStore((s) => s.items);
  const addProposal = useDataStore((s) => s.add);
  const updateProposal = useDataStore((s) => s.update);
  const logActivity = useDataStore((s) => s.logActivity);
  const currentUser = useAuthStore((s) => s.currentUser);

  const existing = proposals.find((p) => p.id === id);

  const [customerId, setCustomerId] = useState(existing?.customerId ?? '');
  const [subject, setSubject] = useState(existing?.subject ?? '');
  const [proposalDate, setProposalDate] = useState(
    toInputDate(existing?.proposalDate ?? new Date().toISOString()),
  );
  const [validUntil, setValidUntil] = useState(
    toInputDate(
      existing?.validUntil ??
        new Date(Date.now() + 30 * 86400000).toISOString(),
    ),
  );
  const [transport, setTransport] = useState(existing?.transportCharge ?? 0);
  const [lines, setLines] = useState<DraftLine[]>(
    existing
      ? existing.items.map((li) => ({
          id: li.id,
          itemId: li.itemId,
          description: li.description,
          quantity: li.quantity,
          unit: li.unit,
          rate: li.rate,
          discount: li.discount,
          gstPercent: li.gstPercent,
        }))
      : [],
  );

  const customer = customers.find((c) => c.id === customerId);

  const builtItems = useMemo<ProposalItem[]>(
    () =>
      lines.map((l) => ({
        id: l.id,
        itemId: l.itemId,
        description: l.description,
        quantity: l.quantity,
        unit: l.unit as ProposalItem['unit'],
        rate: l.rate,
        discount: l.discount,
        gstPercent: l.gstPercent,
        amount: lineAmount(l.quantity, l.rate, l.discount),
      })),
    [lines],
  );

  const totals = useMemo(
    () => calculateGst(builtItems, customer?.state ?? 'Gujarat', transport),
    [builtItems, customer, transport],
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
    setLines((ls) =>
      ls.map((l) => (l.id === lineId ? { ...l, ...patch } : l)),
    );

  const onItemChange = (lineId: string, itemId: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    updateLine(lineId, {
      itemId,
      description: item.name,
      unit: item.unit,
      rate: item.rate,
      gstPercent: item.gstPercent,
    });
  };

  const save = () => {
    if (!customerId || lines.length === 0) {
      toast.error('Pick a customer and add at least one line item.');
      return;
    }
    if (isEdit && existing) {
      updateProposal('proposals', existing.id, {
        customerId,
        subject,
        proposalDate: new Date(proposalDate).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        items: builtItems,
        ...totals,
        needsApproval: totals.total > 1000000,
        state: customer?.state ?? 'Gujarat',
        city: customer?.city ?? '',
      });
      toast.success('Proposal updated');
      navigate(`/proposals/${existing.id}`);
    } else {
      const seq = String(proposals.length + 1).padStart(5, '0');
      const proposal: Proposal = {
        id: generateId('prop'),
        number: `PROP/2026/${seq}`,
        customerId,
        subject: subject || `Proposal for ${customer?.companyName ?? 'customer'}`,
        proposalDate: new Date(proposalDate).toISOString(),
        validUntil: new Date(validUntil).toISOString(),
        status: 'DRAFT',
        state: customer?.state ?? 'Gujarat',
        city: customer?.city ?? '',
        items: builtItems,
        subtotal: totals.subtotal,
        cgst: totals.cgst,
        sgst: totals.sgst,
        igst: totals.igst,
        transportCharge: transport,
        total: totals.total,
        needsApproval: totals.total > 1000000,
        createdById: currentUser?.id ?? 'user_03',
        createdAt: new Date().toISOString(),
      };
      addProposal('proposals', proposal);
      if (currentUser) {
        logActivity('proposal', proposal.id, 'PROPOSAL', 'created this proposal', currentUser.id);
      }
      toast.success('Proposal created');
      navigate(`/proposals/${proposal.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit Proposal' : 'Create Proposal'}
        description="Build a quotation with automatic GST calculation"
        icon={<FileText />}
      />

      <Card>
        <CardContent>
          <FormGrid>
            <FormField label="Customer" required>
              <SelectField
                value={customerId}
                onChange={setCustomerId}
                placeholder="Select a customer"
                options={customers.map((c) => ({
                  value: c.id,
                  label: c.companyName,
                }))}
              />
            </FormField>
            <FormField label="Subject">
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Supply of HSD BS-VI"
              />
            </FormField>
            <FormField label="Proposal Date">
              <Input
                type="date"
                value={proposalDate}
                onChange={(e) => setProposalDate(e.target.value)}
              />
            </FormField>
            <FormField label="Valid Until">
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
              />
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
            <p className="py-6 text-center text-sm text-content-muted">
              No line items yet. Click "Add Item" to start.
            </p>
          ) : (
            <table className="w-full min-w-[760px] text-sm">
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
                      <SelectField
                        value={line.itemId}
                        onChange={(v) => onItemChange(line.id, v)}
                        options={items.map((i) => ({
                          value: i.id,
                          label: i.name,
                        }))}
                      />
                    </td>
                    <td className="py-2 pr-1">
                      <Input
                        type="number"
                        className="num w-20 text-right"
                        value={line.quantity}
                        onChange={(e) =>
                          updateLine(line.id, {
                            quantity: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 pr-1">
                      <Input
                        type="number"
                        className="num w-24 text-right"
                        value={line.rate}
                        onChange={(e) =>
                          updateLine(line.id, { rate: Number(e.target.value) })
                        }
                      />
                    </td>
                    <td className="py-2 pr-1">
                      <Input
                        type="number"
                        className="num w-16 text-right"
                        value={line.discount}
                        onChange={(e) =>
                          updateLine(line.id, {
                            discount: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="py-2 pr-1">
                      <Input
                        type="number"
                        className="num w-16 text-right"
                        value={line.gstPercent}
                        onChange={(e) =>
                          updateLine(line.id, {
                            gstPercent: Number(e.target.value),
                          })
                        }
                      />
                    </td>
                    <td className="num py-2 pr-2 text-right font-medium text-content">
                      {formatINR(
                        lineAmount(line.quantity, line.rate, line.discount),
                      )}
                    </td>
                    <td className="py-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() =>
                          setLines((ls) =>
                            ls.filter((l) => l.id !== line.id),
                          )
                        }
                      >
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
        <Card>
          <CardContent>
            <FormField label="Transportation Charge" hint="Added as a taxable line">
              <CurrencyInput value={transport} onChange={setTransport} />
            </FormField>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-1.5 text-sm">
            <Row label="Subtotal" value={formatINR(totals.subtotal)} />
            <Row label="Transport" value={formatINR(totals.transportCharge)} />
            {totals.intraState ? (
              <>
                <Row label="CGST" value={formatINR(totals.cgst)} />
                <Row label="SGST" value={formatINR(totals.sgst)} />
              </>
            ) : (
              <Row label="IGST (18%)" value={formatINR(totals.igst)} />
            )}
            <div className="flex items-center justify-between border-t border-line pt-2 text-base font-semibold">
              <span className="text-content">Grand Total</span>
              <span className="num text-brand-primary dark:text-brand-secondary">
                {formatINR(totals.total)}
              </span>
            </div>
            {totals.total > 1000000 && (
              <p className="text-xs text-warning">
                This proposal exceeds ₹10,00,000 and will require manager
                approval.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button onClick={save}>
            {isEdit ? 'Save Changes' : 'Create Proposal'}
          </Button>
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

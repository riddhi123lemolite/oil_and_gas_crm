import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ColumnDef } from '@tanstack/react-table';
import { FolderOpen, Download, Eye, FileText } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SelectField } from '@/components/forms/SelectField';
import { Dialog, DialogContent, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatDate } from '@/lib/format';
import { downloadBusinessDoc } from '@/lib/downloadDoc';
import type { BusinessDocData } from '@/components/pdf/BusinessDocPdf';
import type { BadgeTone } from '@/lib/constants';
import type { ProposalItem } from '@/types';

type DocKind = 'INVOICE' | 'ORDER' | 'DISPATCH' | 'PAYMENT' | 'STATIC';

interface Doc {
  id: string;
  title: string;
  type: string;
  date: string;
  ref: string;
  sizeKb: number;
  kind: DocKind;
  srcId?: string;
}

const TYPE_TONE: Record<string, BadgeTone> = {
  'Tax Invoice': 'info',
  'E-Invoice': 'brand',
  'Delivery Challan': 'cold',
  'LR Copy': 'followup',
  'Weight Slip': 'warm',
  Certificate: 'success',
  'Purchase Order': 'info',
  Receipt: 'success',
  'Credit Note': 'followup',
  'Debit Note': 'warm',
  Other: 'neutral',
};

export default function DocumentCenter() {
  const invoices = useDataStore((s) => s.invoices);
  const dispatches = useDataStore((s) => s.dispatches);
  const orders = useDataStore((s) => s.orders);
  const payments = useDataStore((s) => s.payments);
  const items = useDataStore((s) => s.items);
  const company = useDataStore((s) => s.company);
  const me = usePortalCustomer();
  const [params] = useSearchParams();
  const [type, setType] = useState(params.get('type') ?? 'all');
  const [preview, setPreview] = useState<Doc | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  // Keep the filter in sync with the sidebar's ?type= links.
  useEffect(() => {
    setType(params.get('type') ?? 'all');
  }, [params]);

  const docs = useMemo<Doc[]>(() => {
    if (!me) return [];
    const out: Doc[] = [];
    invoices
      .filter((i) => i.customerId === me.id)
      .forEach((i) => {
        out.push({ id: `tax-${i.id}`, title: `Tax Invoice ${i.number}`, type: 'Tax Invoice', date: i.invoiceDate, ref: i.number, sizeKb: 180 + (i.number.length % 7) * 24, kind: 'INVOICE', srcId: i.id });
        out.push({ id: `e-${i.id}`, title: `E-Invoice ${i.number}`, type: 'E-Invoice', date: i.invoiceDate, ref: i.number, sizeKb: 96 + (i.number.length % 5) * 18, kind: 'INVOICE', srcId: i.id });
      });
    dispatches
      .filter((d) => d.customerId === me.id)
      .forEach((d) => {
        out.push({ id: `dc-${d.id}`, title: `Delivery Challan ${d.number}`, type: 'Delivery Challan', date: d.scheduledAt, ref: d.number, sizeKb: 120, kind: 'DISPATCH', srcId: d.id });
        out.push({ id: `lr-${d.id}`, title: `LR Copy ${d.number}`, type: 'LR Copy', date: d.scheduledAt, ref: d.number, sizeKb: 88, kind: 'DISPATCH', srcId: d.id });
        out.push({ id: `ws-${d.id}`, title: `Weight Slip ${d.number}`, type: 'Weight Slip', date: d.scheduledAt, ref: d.number, sizeKb: 64, kind: 'DISPATCH', srcId: d.id });
      });
    orders
      .filter((o) => o.customerId === me.id)
      .forEach((o) => out.push({ id: `po-${o.id}`, title: `Purchase Order ${o.number}`, type: 'Purchase Order', date: o.orderDate, ref: o.number, sizeKb: 110, kind: 'ORDER', srcId: o.id }));
    payments
      .filter((p) => p.customerId === me.id)
      .forEach((p) => out.push({ id: `rc-${p.id}`, title: `Receipt ${p.number}`, type: 'Receipt', date: p.paidAt, ref: p.number, sizeKb: 72, kind: 'PAYMENT', srcId: p.id }));
    invoices
      .filter((i) => i.customerId === me.id)
      .forEach((i, idx) => {
        if (idx % 6 === 0) out.push({ id: `cn-${i.id}`, title: `Credit Note CN-${i.number}`, type: 'Credit Note', date: i.invoiceDate, ref: i.number, sizeKb: 68, kind: 'INVOICE', srcId: i.id });
        if (idx % 8 === 0) out.push({ id: `dn-${i.id}`, title: `Debit Note DN-${i.number}`, type: 'Debit Note', date: i.invoiceDate, ref: i.number, sizeKb: 66, kind: 'INVOICE', srcId: i.id });
      });
    out.push({ id: 'cert-1', title: 'ISO 9001 Quality Certificate', type: 'Certificate', date: '2026-01-15', ref: 'CERT-ISO-9001', sizeKb: 340, kind: 'STATIC' });
    out.push({ id: 'oth-1', title: 'KYC Declaration Form', type: 'Other', date: '2026-01-10', ref: 'KYC-2026', sizeKb: 210, kind: 'STATIC' });
    out.push({ id: 'oth-2', title: 'Annual Rate Agreement', type: 'Other', date: '2026-04-01', ref: 'AGR-2026-27', sizeKb: 260, kind: 'STATIC' });
    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [me, invoices, dispatches, orders, payments]);

  const types = useMemo(() => ['all', ...Array.from(new Set(docs.map((d) => d.type)))], [docs]);
  const filtered = type === 'all' ? docs : docs.filter((d) => d.type === type);

  /** Build the PDF data for a document from its underlying CRM record. */
  const buildDocData = useCallback(
    (doc: Doc): BusinessDocData => {
      const addr = me?.billingAddress;
      const base: BusinessDocData = {
        docLabel: doc.type.toUpperCase(),
        number: doc.ref,
        date: formatDate(doc.date),
        company,
        partyName: me?.companyName ?? 'Customer',
        partyAddress: addr
          ? `${addr.line1}${addr.line2 ? ', ' + addr.line2 : ''}, ${addr.city}, ${addr.state} ${addr.pincode}`
          : '',
        partyGstin: me?.gstin,
        subject: doc.title,
        items: [],
        subtotal: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        transportCharge: 0,
        total: 0,
        terms: company.terms,
      };
      if (doc.kind === 'INVOICE') {
        const inv = invoices.find((i) => i.id === doc.srcId);
        if (inv) {
          return {
            ...base,
            validLabel: 'Due Date',
            validValue: formatDate(inv.dueDate),
            items: inv.items,
            subtotal: inv.subtotal,
            cgst: inv.cgst,
            sgst: inv.sgst,
            igst: inv.igst,
            transportCharge: inv.transportCharge,
            total: inv.total,
          };
        }
      }
      if (doc.kind === 'ORDER') {
        const o = orders.find((x) => x.id === doc.srcId);
        if (o) return { ...base, items: o.items, subtotal: o.subtotal, igst: o.taxTotal, total: o.total };
      }
      if (doc.kind === 'DISPATCH') {
        const d = dispatches.find((x) => x.id === doc.srcId);
        if (d) {
          const name = items.find((it) => it.id === d.itemId)?.name ?? 'Product';
          const line: ProposalItem = { id: '1', itemId: d.itemId, description: name, quantity: d.quantity, unit: d.unit, rate: 0, discount: 0, gstPercent: 0, amount: 0 };
          return { ...base, items: [line] };
        }
      }
      if (doc.kind === 'PAYMENT') {
        const p = payments.find((x) => x.id === doc.srcId);
        if (p) return { ...base, subject: `Payment received via ${p.mode} · Ref ${p.reference}`, total: p.amount };
      }
      return base;
    },
    [me, company, invoices, orders, dispatches, payments, items],
  );

  const download = useCallback(
    async (doc: Doc) => {
      if (!me) return;
      setBusyId(doc.id);
      try {
        await downloadBusinessDoc(buildDocData(doc), `${doc.ref}-${doc.type}`);
      } finally {
        setBusyId(null);
      }
    },
    [me, buildDocData],
  );

  const columns = useMemo<ColumnDef<Doc, unknown>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Document',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-content-muted" />
            <span className="font-medium text-content">{row.original.title}</span>
          </div>
        ),
      },
      { accessorKey: 'type', header: 'Type', cell: ({ row }) => <StatusBadge def={{ label: row.original.type, tone: TYPE_TONE[row.original.type] ?? 'neutral' }} /> },
      { accessorKey: 'date', header: 'Date', cell: ({ row }) => <span className="text-content-secondary">{formatDate(row.original.date)}</span> },
      { accessorKey: 'ref', header: 'Reference', cell: ({ row }) => <span className="num text-content-secondary">{row.original.ref}</span> },
      { accessorKey: 'sizeKb', header: 'Size', cell: ({ row }) => <span className="num text-content-secondary">{row.original.sizeKb} KB</span> },
      {
        id: 'actions',
        header: '',
        enableSorting: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-1.5">
            <Button variant="outline" size="icon-sm" aria-label="Preview" onClick={() => setPreview(row.original)}>
              <Eye className="size-4" />
            </Button>
            <Button variant="outline" size="icon-sm" aria-label="Download" loading={busyId === row.original.id} onClick={() => download(row.original)}>
              {busyId !== row.original.id && <Download className="size-4" />}
            </Button>
          </div>
        ),
      },
    ],
    [busyId, download],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Document Center" description="Invoices, e-invoices, challans, LR copies, certificates and more — download any as PDF." icon={<FolderOpen />} />

      <DataTable
        columns={columns}
        data={filtered}
        getRowId={(d) => d.id}
        searchPlaceholder="Search documents…"
        searchKeys={['title', 'ref']}
        exportName="documents"
        exportMapper={(d) => ({ Title: d.title, Type: d.type, Date: formatDate(d.date), Reference: d.ref, 'Size (KB)': d.sizeKb })}
        emptyTitle="No documents"
        emptyDescription="Your paperwork will appear here."
        toolbar={
          <div className="w-48">
            <SelectField value={type} onChange={setType} options={types.map((t) => ({ value: t, label: t === 'all' ? 'All Types' : t }))} />
          </div>
        }
      />

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent size="md">
          <DialogTitle>{preview?.title}</DialogTitle>
          <DialogBody>
            <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-line bg-muted/40 text-center">
              <FileText className="size-10 text-content-muted" />
              <div className="text-sm text-content-secondary">PDF document</div>
              <div className="text-xs text-content-muted">
                {preview?.type} · {preview?.ref} · {preview?.sizeKb} KB
              </div>
              <Button size="sm" loading={!!preview && busyId === preview.id} onClick={() => preview && download(preview)}>
                {(!preview || busyId !== preview.id) && <Download className="size-4" />} Download PDF
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

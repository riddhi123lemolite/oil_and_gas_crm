import { useMemo, useState } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { FolderOpen, Download, Eye, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { SelectField } from '@/components/forms/SelectField';
import { Dialog, DialogContent, DialogBody, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { formatDate } from '@/lib/format';
import type { BadgeTone } from '@/lib/constants';

interface Doc {
  id: string;
  title: string;
  type: string;
  date: string;
  ref: string;
  sizeKb: number;
}

const TYPE_TONE: Record<string, BadgeTone> = {
  'Tax Invoice': 'info',
  'E-Invoice': 'brand',
  'Delivery Challan': 'cold',
  'LR Copy': 'followup',
  'Weight Slip': 'warm',
  Certificate: 'success',
  'Credit Note': 'neutral',
};

export default function DocumentCenter() {
  const invoices = useDataStore((s) => s.invoices);
  const dispatches = useDataStore((s) => s.dispatches);
  const customers = useDataStore((s) => s.customers);
  const me = customers[0];
  const [type, setType] = useState('all');
  const [preview, setPreview] = useState<Doc | null>(null);

  const docs = useMemo<Doc[]>(() => {
    if (!me) return [];
    const out: Doc[] = [];
    invoices
      .filter((i) => i.customerId === me.id)
      .forEach((i) => {
        out.push({ id: `tax-${i.id}`, title: `Tax Invoice ${i.number}`, type: 'Tax Invoice', date: i.invoiceDate, ref: i.number, sizeKb: 180 + (i.number.length % 7) * 24 });
        out.push({ id: `e-${i.id}`, title: `E-Invoice ${i.number}`, type: 'E-Invoice', date: i.invoiceDate, ref: i.number, sizeKb: 96 + (i.number.length % 5) * 18 });
      });
    dispatches
      .filter((d) => d.customerId === me.id)
      .forEach((d) => {
        out.push({ id: `dc-${d.id}`, title: `Delivery Challan ${d.number}`, type: 'Delivery Challan', date: d.scheduledAt, ref: d.number, sizeKb: 120 });
        out.push({ id: `lr-${d.id}`, title: `LR Copy ${d.number}`, type: 'LR Copy', date: d.scheduledAt, ref: d.number, sizeKb: 88 });
        out.push({ id: `ws-${d.id}`, title: `Weight Slip ${d.number}`, type: 'Weight Slip', date: d.scheduledAt, ref: d.number, sizeKb: 64 });
      });
    out.push({ id: 'cert-1', title: 'ISO 9001 Quality Certificate', type: 'Certificate', date: '2026-01-15', ref: 'CERT-ISO-9001', sizeKb: 340 });
    return out.sort((a, b) => b.date.localeCompare(a.date));
  }, [me, invoices, dispatches]);

  const types = useMemo(() => ['all', ...Array.from(new Set(docs.map((d) => d.type)))], [docs]);
  const filtered = type === 'all' ? docs : docs.filter((d) => d.type === type);

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
            <Button variant="outline" size="icon-sm" aria-label="Download" onClick={() => toast.success(`Downloading ${row.original.title}.pdf`)}>
              <Download className="size-4" />
            </Button>
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <PageHeader title="Document Center" description="Invoices, e-invoices, challans, LR copies, certificates and more." icon={<FolderOpen />} />

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
              <div className="text-sm text-content-secondary">PDF preview</div>
              <div className="text-xs text-content-muted">
                {preview?.type} · {preview?.ref} · {preview?.sizeKb} KB
              </div>
              <Button size="sm" onClick={() => preview && toast.success(`Downloading ${preview.title}.pdf`)}>
                <Download className="size-4" /> Download
              </Button>
            </div>
          </DialogBody>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One entry point for downloading a business document from the portal/app.
// Tries a real PDF (via the lazy @react-pdf renderer); if that ever fails
// (chunk load, renderer error), it falls back to a printable HTML file so a
// document ALWAYS lands on the user's device.
// ---------------------------------------------------------------------------
import toast from 'react-hot-toast';
import { downloadBlob } from '@/lib/utils';
import { formatDate } from '@/lib/format';
import type { BusinessDocData } from '@/components/pdf/BusinessDocPdf';
import type { Invoice, Customer, CompanySettings } from '@/types';

/** Build the PDF/print data for a tax invoice (shared by staff + portal). */
export function invoiceDocData(inv: Invoice, party: Customer | undefined, company: CompanySettings): BusinessDocData {
  const a = party?.billingAddress;
  return {
    docLabel: 'TAX INVOICE',
    number: inv.number,
    date: formatDate(inv.invoiceDate),
    validLabel: 'Due Date',
    validValue: formatDate(inv.dueDate),
    company,
    partyName: party?.companyName ?? 'Customer',
    partyAddress: a ? `${a.line1}${a.line2 ? ', ' + a.line2 : ''}, ${a.city}, ${a.state} ${a.pincode}` : '',
    partyGstin: party?.gstin,
    items: inv.items,
    subtotal: inv.subtotal,
    cgst: inv.cgst,
    sgst: inv.sgst,
    igst: inv.igst,
    transportCharge: inv.transportCharge,
    total: inv.total,
    terms: company.terms,
  };
}

const inr = (n: number | undefined) => '₹' + (n ?? 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });

const esc = (s?: string) =>
  (s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] ?? c));

function companyAddress(d: BusinessDocData): string {
  const a = d.company?.address;
  if (!a) return '';
  return `${a.line1}${a.line2 ? ', ' + a.line2 : ''}, ${a.city}, ${a.state} ${a.pincode}`;
}

/** Printable HTML fallback — self-contained, opens the print dialog on load. */
function docHtml(d: BusinessDocData): string {
  const rows = d.items
    .map(
      (it) =>
        `<tr><td>${esc(it.description)}</td><td style="text-align:right">${it.quantity} ${esc(it.unit)}</td><td style="text-align:right">${inr(it.rate)}</td><td style="text-align:right">${inr(it.amount)}</td></tr>`,
    )
    .join('');
  const totals = [
    d.subtotal ? `<div>Subtotal: ${inr(d.subtotal)}</div>` : '',
    d.cgst ? `<div>CGST: ${inr(d.cgst)}</div>` : '',
    d.sgst ? `<div>SGST: ${inr(d.sgst)}</div>` : '',
    d.igst ? `<div>IGST: ${inr(d.igst)}</div>` : '',
    d.transportCharge ? `<div>Transport: ${inr(d.transportCharge)}</div>` : '',
    `<div style="font-weight:bold;font-size:15px;margin-top:6px">Total: ${inr(d.total)}</div>`,
  ].join('');
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(d.docLabel)} ${esc(d.number)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;color:#0f172a;max-width:820px;margin:24px auto;padding:0 16px}
h1{color:#e87722;margin:0;font-size:22px}.muted{color:#64748b;font-size:12px}
table{width:100%;border-collapse:collapse;margin-top:16px}th,td{border-bottom:1px solid #e5e9ef;padding:6px;font-size:13px}
th{background:#0f3d5c;color:#fff;text-align:left}.hdr{display:flex;justify-content:space-between;border-bottom:2px solid #0f3d5c;padding-bottom:8px}
.tot{margin-top:12px;text-align:right}</style></head>
<body onload="setTimeout(function(){window.print()},250)">
<div class="hdr"><div><div style="font-size:18px;font-weight:bold;color:#0f3d5c">${esc(d.company?.name ?? 'Company')}</div>
<div class="muted">${esc(companyAddress(d))}</div><div class="muted">GSTIN: ${esc(d.company?.gstin)}</div></div>
<div style="text-align:right"><h1>${esc(d.docLabel)}</h1><div class="muted">${esc(d.number)} · ${esc(d.date)}</div>
${d.validLabel ? `<div class="muted">${esc(d.validLabel)}: ${esc(d.validValue)}</div>` : ''}</div></div>
<div style="margin-top:14px"><div class="muted">BILL TO</div><b>${esc(d.partyName)}</b>
<div class="muted">${esc(d.partyAddress)}</div>${d.partyGstin ? `<div class="muted">GSTIN: ${esc(d.partyGstin)}</div>` : ''}</div>
${d.subject ? `<div class="muted" style="margin-top:8px">${esc(d.subject)}</div>` : ''}
${d.items.length ? `<table><thead><tr><th>Description</th><th style="text-align:right">Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount</th></tr></thead><tbody>${rows}</tbody></table>` : ''}
<div class="tot">${totals}</div>
${d.terms ? `<div class="muted" style="margin-top:16px">${esc(d.terms)}</div>` : ''}
</body></html>`;
}

/** Download a business document. Resolves once a file has been triggered. */
export async function downloadBusinessDoc(data: BusinessDocData, filenameBase: string): Promise<void> {
  const base = filenameBase.replace(/[\\/]+/g, '-').replace(/\s+/g, '').slice(0, 80) || 'document';
  try {
    const { renderBusinessDoc } = await import('@/components/pdf/renderPdf');
    const blob = await renderBusinessDoc(data);
    downloadBlob(blob, `${base}.pdf`);
    toast.success('Downloaded');
  } catch {
    try {
      const blob = new Blob([docHtml(data)], { type: 'text/html;charset=utf-8' });
      downloadBlob(blob, `${base}.html`);
      toast.success('Downloaded');
    } catch {
      toast.error('Could not download the document.');
    }
  }
}

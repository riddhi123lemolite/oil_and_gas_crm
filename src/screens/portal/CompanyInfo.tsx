import { Building2, MapPin, FileText, Users } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { EmptyState } from '@/components/shared/EmptyState';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';
import { formatINR } from '@/lib/format';
import type { Address } from '@/types';

export default function CompanyInfo() {
  const me = usePortalCustomer();

  if (!me) {
    return (
      <div className="space-y-5">
        <PageHeader title="Company Information" icon={<Building2 />} />
        <div className="card"><EmptyState title="No company on file" description="Your company profile will appear here." /></div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <PageHeader title="Company Information" description="Your registered company profile and commercial terms." icon={<Building2 />} />

      <div className="card p-5">
        <div className="text-xs font-semibold uppercase tracking-wide text-content-muted">Registered Entity</div>
        <div className="mt-1 font-display text-xl font-bold">{me.companyName}</div>
        <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 text-sm md:grid-cols-3">
          <Field label="GSTIN" value={me.gstin} mono />
          <Field label="PAN" value={me.pan} mono />
          <Field label="CIN" value={me.cin} mono />
          <Field label="Industry" value={me.industry} />
          <Field label="Segment" value={me.segment} />
          <Field label="Customer Code" value={me.code} mono />
        </dl>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TermCard label="Credit Limit" value={formatINR(me.creditLimit)} />
        <TermCard label="Payment Terms" value={`NET ${me.paymentTermsDays} days`} />
        <TermCard label="Outstanding" value={formatINR(me.outstanding)} tone="danger" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <AddressCard title="Billing Address" addr={me.billingAddress} />
        <AddressCard title="Shipping Address" addr={me.shippingAddress} />
      </div>

      <div className="card">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3 font-display font-semibold">
          <Users className="size-4 text-brand-secondary" /> Contacts
        </div>
        {me.contacts.length === 0 ? (
          <EmptyState title="No contacts" description="Add contacts to your account." />
        ) : (
          <ul className="divide-y divide-line">
            {me.contacts.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-xs text-content-muted">{c.designation}</div>
                </div>
                <div className="text-right text-sm text-content-secondary">
                  <div className="num">{c.phone}</div>
                  {c.email && <div className="text-xs">{c.email}</div>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div>
      <dt className="flex items-center gap-1 text-[11px] uppercase tracking-wide text-content-muted">
        <FileText className="size-3" /> {label}
      </dt>
      <dd className={`mt-0.5 font-medium text-content ${mono ? 'num' : ''}`}>{value || '—'}</dd>
    </div>
  );
}

function TermCard({ label, value, tone }: { label: string; value: string; tone?: 'danger' }) {
  return (
    <div className="card p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-content-muted">{label}</div>
      <div className={`num mt-1 text-lg font-semibold ${tone === 'danger' ? 'text-danger' : 'text-content'}`}>{value}</div>
    </div>
  );
}

function AddressCard({ title, addr }: { title: string; addr: Address }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-content-muted">
        <MapPin className="size-3.5" /> {title}
      </div>
      <div className="mt-2 text-sm leading-relaxed text-content-secondary">
        {addr.line1 || '—'}
        {addr.line2 && <>, {addr.line2}</>}
        <br />
        {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
      </div>
    </div>
  );
}

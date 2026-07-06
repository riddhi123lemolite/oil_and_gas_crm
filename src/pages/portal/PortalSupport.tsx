import { useState, type FormEvent } from 'react';
import { LifeBuoy, Ticket, Phone, Mail, HelpCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { usePortalCustomer } from '@/hooks/usePortalCustomer';

const FAQ = [
  { q: 'How do I track my order?', a: 'Open Orders → Product Tracking and select a dispatch to see its live milestone timeline.' },
  { q: 'Where can I download my invoices?', a: 'Go to Documents or Bills & Invoices and use the PDF button on any row.' },
  { q: 'What payment methods are accepted?', a: 'NEFT, RTGS, UPI, Cheque and Cash — see Payments for terms and your credit limit.' },
  { q: 'How are prices calculated per kg?', a: 'Use the ERP Calculator: Kg = (Litre × Density) ÷ 1000, with blended average price and density.' },
];

export default function PortalSupport() {
  const users = useDataStore((s) => s.users);
  const me = usePortalCustomer();
  const manager = users.find((u) => u.id === me?.ownerId) ?? users[0];

  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order');
  const [message, setMessage] = useState('');

  const submit = (e: FormEvent) => {
    e.preventDefault();
    toast.success('Support ticket raised — our team will get back to you shortly.');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Find answers, raise a ticket, or reach your account manager." icon={<LifeBuoy />} />

      {/* Help center */}
      <section id="help">
        <SectionLabel icon={<HelpCircle className="size-4" />} title="Help Center" />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {FAQ.map((f) => (
            <div key={f.q} className="card p-4">
              <div className="font-medium text-content">{f.q}</div>
              <p className="mt-1 text-sm text-content-secondary">{f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Raise ticket */}
        <section id="ticket">
          <SectionLabel icon={<Ticket className="size-4" />} title="Raise a Support Ticket" />
          <form onSubmit={submit} className="card space-y-4 p-4">
            <FormField label="Subject" htmlFor="subject">
              <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary" required />
            </FormField>
            <FormField label="Category">
              <SelectField
                value={category}
                onChange={setCategory}
                options={['Order', 'Payment', 'Documents', 'Delivery', 'Other'].map((c) => ({ value: c, label: c }))}
              />
            </FormField>
            <FormField label="Message" htmlFor="message">
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={4}
                required
                className="input-base h-auto py-2"
                placeholder="Describe your issue…"
              />
            </FormField>
            <Button type="submit">
              <Send className="size-4" /> Submit Ticket
            </Button>
          </form>
        </section>

        {/* Contact account manager */}
        <section id="contact">
          <SectionLabel icon={<Phone className="size-4" />} title="Contact Account Manager" />
          <div className="card p-5">
            <div className="flex items-center gap-3">
              <EntityAvatar name={manager?.name ?? 'Account Manager'} size="lg" />
              <div>
                <div className="font-display text-lg font-bold">{manager?.name ?? '—'}</div>
                <div className="text-sm text-content-muted">Your dedicated account manager</div>
              </div>
            </div>
            <div className="mt-4 space-y-2 text-sm">
              <a href={`mailto:${manager?.email ?? ''}`} className="flex items-center gap-2 text-content-secondary hover:text-brand-secondary">
                <Mail className="size-4" /> {manager?.email ?? '—'}
              </a>
              <a href={`tel:${manager?.phone ?? ''}`} className="flex items-center gap-2 text-content-secondary hover:text-brand-secondary">
                <Phone className="size-4" /> {manager?.phone ?? '—'}
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-brand-secondary">{icon}</span>
      <h3 className="font-display text-sm font-semibold">{title}</h3>
    </div>
  );
}

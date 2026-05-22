import { useState } from 'react';
import { LifeBuoy, Search, ChevronDown } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    q: 'How do I add a new lead?',
    a: 'Go to Leads → Add Lead, or use the quick-add (+) button in the top bar. Fill in the contact details and save — the lead appears in your list immediately.',
  },
  {
    q: 'How is GST calculated on proposals?',
    a: 'GST is automatic. If the customer is in the same state as your company (Gujarat), CGST 9% + SGST 9% is applied. For other states, IGST 18% is used.',
  },
  {
    q: 'How do I convert a lead into a customer?',
    a: 'Open the lead and click "Convert to Customer". A short wizard pre-fills a customer record; the lead is marked Won and linked to the new customer.',
  },
  {
    q: 'Where is my data stored?',
    a: 'This is a prototype — all data lives in your browser\'s local storage. Nothing is sent to a server, and each device keeps its own copy.',
  },
  {
    q: 'How do I reset the demo?',
    a: 'Go to Settings → System → Reset Demo Data. This restores the original sample data and discards your changes.',
  },
  {
    q: 'Can I switch between roles?',
    a: 'Yes — click your avatar in the top-right and choose "Switch Role". The sidebar and dashboard update to match the selected role.',
  },
  {
    q: 'How do I export data to Excel?',
    a: 'Every list has an Export button that downloads the current filtered view as an .xlsx file.',
  },
  {
    q: 'How do I generate an invoice PDF?',
    a: 'Open any invoice or proposal and click "Download PDF" — a GST-compliant document is generated in your browser.',
  },
];

export default function HelpCentre() {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (f) =>
      f.q.toLowerCase().includes(search.toLowerCase()) ||
      f.a.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Help Centre"
        description="Answers to common questions about OilGas CRM"
        icon={<LifeBuoy />}
      />

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search help articles…"
          className="h-11 pl-9"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((faq, i) => (
          <Card key={i} className="overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex-1 text-sm font-medium text-content">
                {faq.q}
              </span>
              <ChevronDown
                className={cn(
                  'size-4 shrink-0 text-content-muted transition-transform',
                  open === i && 'rotate-180',
                )}
              />
            </button>
            {open === i && (
              <p className="border-t border-line px-4 py-3 text-sm text-content-secondary">
                {faq.a}
              </p>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-content-muted">
            No articles match "{search}".
          </p>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Settings, Globe, IndianRupee, Moon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';

const PREFS = [
  { key: 'email', label: 'Email notifications', desc: 'Invoices, dispatch and payment updates by email' },
  { key: 'sms', label: 'SMS alerts', desc: 'Delivery and payment-due alerts by SMS' },
  { key: 'whatsapp', label: 'WhatsApp updates', desc: 'Order and dispatch updates on WhatsApp' },
  { key: 'announcements', label: 'Product announcements', desc: 'Stock, price and policy announcements' },
];

export default function CustomerSettings() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({ email: true, sms: true, whatsapp: false, announcements: true });

  return (
    <div className="space-y-5">
      <PageHeader title="Settings" description="Notification preferences and account options." icon={<Settings />} />

      <div className="card">
        <div className="border-b border-line px-4 py-3 font-display font-semibold">Notifications</div>
        <ul className="divide-y divide-line">
          {PREFS.map((p) => (
            <li key={p.key} className="flex items-center justify-between px-4 py-3">
              <div>
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-content-muted">{p.desc}</div>
              </div>
              <Switch checked={!!prefs[p.key]} onCheckedChange={(v) => setPrefs((s) => ({ ...s, [p.key]: !!v }))} />
            </li>
          ))}
        </ul>
      </div>

      <div className="card">
        <div className="border-b border-line px-4 py-3 font-display font-semibold">Display</div>
        <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
          <Hint icon={<Globe className="size-4" />} label="Language" value="Switch from the top bar" />
          <Hint icon={<IndianRupee className="size-4" />} label="Currency" value="Switch from the top bar" />
          <Hint icon={<Moon className="size-4" />} label="Theme" value="Toggle from the top bar" />
        </div>
      </div>

      <Button onClick={() => toast.success('Preferences saved')}>Save Preferences</Button>
    </div>
  );
}

function Hint({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 bg-surface p-4">
      <span className="flex size-9 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">{icon}</span>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-content-muted">{value}</div>
      </div>
    </div>
  );
}

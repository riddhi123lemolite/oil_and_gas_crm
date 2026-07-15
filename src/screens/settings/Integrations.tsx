import { useState } from 'react';
import { Plug } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';

interface Integration {
  key: string;
  name: string;
  description: string;
  category: string;
}

const INTEGRATIONS: Integration[] = [
  { key: 'tally', name: 'Tally Prime', description: 'Sync invoices and ledgers with Tally accounting.', category: 'Accounting' },
  { key: 'whatsapp', name: 'WhatsApp Business', description: 'Send quotes and updates over WhatsApp.', category: 'Messaging' },
  { key: 'smtp', name: 'SMTP Email', description: 'Send emails through your own mail server.', category: 'Email' },
  { key: 'sms', name: 'SMS Gateway', description: 'Send transactional SMS alerts to customers.', category: 'Messaging' },
  { key: 'razorpay', name: 'Razorpay', description: 'Collect online payments against invoices.', category: 'Payments' },
  { key: 'indiamart', name: 'IndiaMART', description: 'Auto-import enquiries from IndiaMART.', category: 'Leads' },
];

export default function Integrations() {
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState<Integration | null>(null);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Integrations"
        description="Connect OilGas CRM with the tools you already use"
        icon={<Plug />}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {INTEGRATIONS.map((it) => (
          <Card key={it.key}>
            <CardContent className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <div className="flex size-10 items-center justify-center rounded-lg bg-brand-primary/8 font-display text-base font-bold text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
                  {it.name.charAt(0)}
                </div>
                {connected[it.key] && <Badge tone="success">Connected</Badge>}
              </div>
              <h3 className="mt-3 font-display text-base font-semibold text-content">
                {it.name}
              </h3>
              <p className="mt-0.5 flex-1 text-sm text-content-muted">
                {it.description}
              </p>
              <Badge tone="outline" className="mt-2 w-fit">
                {it.category}
              </Badge>
              <Button
                variant={connected[it.key] ? 'outline' : 'primary'}
                size="sm"
                className="mt-3"
                onClick={() => {
                  if (connected[it.key]) {
                    setConnected((c) => ({ ...c, [it.key]: false }));
                    toast.success(`${it.name} disconnected`);
                  } else {
                    setActive(it);
                  }
                }}
              >
                {connected[it.key] ? 'Disconnect' : 'Connect'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Connect {active?.name}</DialogTitle>
            <DialogDescription>
              Enter your {active?.name} credentials to enable this integration.
            </DialogDescription>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <FormField label="API Key / Account ID">
              <Input placeholder="Enter key" />
            </FormField>
            <FormField label="Secret">
              <Input type="password" placeholder="••••••••" />
            </FormField>
            <p className="text-xs text-content-muted">
              This is a demo — no real connection is made.
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActive(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (active) {
                  setConnected((c) => ({ ...c, [active.key]: true }));
                  toast.success(`${active.name} connected`);
                }
                setActive(null);
              }}
            >
              Connect
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

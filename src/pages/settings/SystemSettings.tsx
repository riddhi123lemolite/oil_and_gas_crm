import { useState } from 'react';
import { SlidersHorizontal, RotateCcw, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { Input } from '@/components/ui/input';
import { reseed } from '@/lib/seedLoader';
import { useDataStore } from '@/stores/dataStore';

export default function SystemSettings() {
  const hydrate = useDataStore((s) => s.hydrate);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [gstDefault, setGstDefault] = useState('18');

  const handleReset = async () => {
    setResetting(true);
    await reseed();
    await hydrate();
    setResetting(false);
    toast.success('Demo data has been reset to its original state');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="System Settings"
        description="Global preferences for the CRM"
        icon={<SlidersHorizontal />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Regional & Financial</CardTitle>
        </CardHeader>
        <CardContent>
          <FormGrid>
            <FormField label="Currency" hint="Locked to Indian Rupee">
              <Input value="INR (₹) — Indian Rupee" disabled />
            </FormField>
            <FormField label="Timezone">
              <Input value="Asia/Kolkata (IST, UTC+5:30)" disabled />
            </FormField>
            <FormField label="Fiscal Year">
              <SelectField
                value="apr-mar"
                onChange={() => undefined}
                options={[{ value: 'apr-mar', label: 'April – March' }]}
              />
            </FormField>
            <FormField label="Default GST Rate">
              <SelectField
                value={gstDefault}
                onChange={setGstDefault}
                options={[5, 12, 18, 28].map((g) => ({
                  value: String(g),
                  label: `${g}%`,
                }))}
              />
            </FormField>
          </FormGrid>
          <div className="mt-3">
            <Button onClick={() => toast.success('System settings saved')}>
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-danger/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-danger">
            <AlertTriangle className="size-4" /> Reset Demo Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-content-secondary">
            This clears every change you've made in this browser — leads,
            customers, proposals, tasks and more — and restores the original
            sample data. This cannot be undone.
          </p>
          <Button
            variant="danger"
            className="mt-3"
            loading={resetting}
            onClick={() => setResetOpen(true)}
          >
            <RotateCcw className="size-4" /> Reset Demo Data
          </Button>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={resetOpen}
        onOpenChange={setResetOpen}
        title="Reset all demo data?"
        description="Every change you've made will be discarded and the original sample data restored. This cannot be undone."
        destructive
        confirmLabel="Reset Everything"
        onConfirm={handleReset}
      />
    </div>
  );
}

import { useState } from 'react';
import { Building } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { useDataStore } from '@/stores/dataStore';
import type { CompanySettings as CompanySettingsType } from '@/types';

export default function CompanySettings() {
  const company = useDataStore((s) => s.company);
  const setCompany = useDataStore((s) => s.setCompany);
  const [form, setForm] = useState<CompanySettingsType>(company);

  const set = (patch: Partial<CompanySettingsType>) =>
    setForm((f) => ({ ...f, ...patch }));

  const save = () => {
    setCompany(form);
    toast.success('Company settings saved');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title="Company Settings"
        description="Details used on invoices, proposals and PDFs"
        icon={<Building />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Business Identity</CardTitle>
        </CardHeader>
        <CardContent>
          <FormGrid>
            <FormField label="Display Name">
              <Input
                value={form.name}
                onChange={(e) => set({ name: e.target.value })}
              />
            </FormField>
            <FormField label="Legal Name">
              <Input
                value={form.legalName}
                onChange={(e) => set({ legalName: e.target.value })}
              />
            </FormField>
            <FormField label="GSTIN">
              <Input
                value={form.gstin}
                onChange={(e) => set({ gstin: e.target.value.toUpperCase() })}
                className="num"
              />
            </FormField>
            <FormField label="PAN">
              <Input
                value={form.pan}
                onChange={(e) => set({ pan: e.target.value.toUpperCase() })}
                className="num"
              />
            </FormField>
            <FormField label="Email">
              <Input
                value={form.email}
                onChange={(e) => set({ email: e.target.value })}
              />
            </FormField>
            <FormField label="Phone">
              <Input
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
              />
            </FormField>
          </FormGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registered Address</CardTitle>
        </CardHeader>
        <CardContent>
          <FormGrid>
            <FormField label="Address Line" className="sm:col-span-2">
              <Input
                value={form.address.line1}
                onChange={(e) =>
                  set({ address: { ...form.address, line1: e.target.value } })
                }
              />
            </FormField>
            <FormField label="City">
              <Input
                value={form.address.city}
                onChange={(e) =>
                  set({ address: { ...form.address, city: e.target.value } })
                }
              />
            </FormField>
            <FormField label="State">
              <Input
                value={form.address.state}
                onChange={(e) =>
                  set({ address: { ...form.address, state: e.target.value } })
                }
              />
            </FormField>
            <FormField label="PIN Code">
              <Input
                value={form.address.pincode}
                onChange={(e) =>
                  set({
                    address: { ...form.address, pincode: e.target.value },
                  })
                }
              />
            </FormField>
          </FormGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Banking & Numbering</CardTitle>
        </CardHeader>
        <CardContent>
          <FormGrid>
            <FormField label="Bank Name">
              <Input
                value={form.bankName}
                onChange={(e) => set({ bankName: e.target.value })}
              />
            </FormField>
            <FormField label="Account Number">
              <Input
                value={form.bankAccount}
                onChange={(e) => set({ bankAccount: e.target.value })}
                className="num"
              />
            </FormField>
            <FormField label="IFSC Code">
              <Input
                value={form.bankIfsc}
                onChange={(e) => set({ bankIfsc: e.target.value.toUpperCase() })}
                className="num"
              />
            </FormField>
            <FormField label="Invoice Prefix">
              <Input
                value={form.invoicePrefix}
                onChange={(e) => set({ invoicePrefix: e.target.value })}
                className="num"
              />
            </FormField>
            <FormField label="Proposal Prefix">
              <Input
                value={form.proposalPrefix}
                onChange={(e) => set({ proposalPrefix: e.target.value })}
                className="num"
              />
            </FormField>
          </FormGrid>
          <FormField label="Default Terms & Conditions" className="mt-4">
            <Textarea
              rows={4}
              value={form.terms}
              onChange={(e) => set({ terms: e.target.value })}
            />
          </FormField>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={save}>Save Company Settings</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

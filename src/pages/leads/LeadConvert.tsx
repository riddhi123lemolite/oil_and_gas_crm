import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowRight, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/shared/EmptyState';
import { FormField, FormGrid, FormSection } from '@/components/forms/FormField';
import { SelectField, optionsFromLabels } from '@/components/forms/SelectField';
import { GstinInput, PanInput, CurrencyInput } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { CUSTOMER_SEGMENT } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import type { Customer, CustomerSegment } from '@/types';

export default function LeadConvert() {
  const { id } = useParams();
  const navigate = useNavigate();
  const leads = useDataStore((s) => s.leads);
  const customers = useDataStore((s) => s.customers);
  const addCustomer = useDataStore((s) => s.add);
  const updateLead = useDataStore((s) => s.update);
  const logActivity = useDataStore((s) => s.logActivity);
  const currentUser = useAuthStore((s) => s.currentUser);

  const lead = leads.find((l) => l.id === id);

  const [form, setForm] = useState({
    companyName: lead?.companyName ?? lead?.name ?? '',
    contactPerson: lead?.name ?? '',
    gstin: '',
    pan: '',
    segment: 'NEW' as CustomerSegment,
    creditLimit: 1000000,
    paymentTermsDays: 30,
  });

  if (!lead) {
    return (
      <EmptyState
        title="Lead not found"
        description="This lead may have been deleted."
        actionLabel="Back to Leads"
        onAction={() => navigate('/leads')}
      />
    );
  }

  const set = (key: keyof typeof form, value: string | number) =>
    setForm((f) => ({ ...f, [key]: value }));

  const convert = () => {
    const seq = String(customers.length + 1).padStart(5, '0');
    const address = {
      line1: 'As per KYC',
      city: lead.city,
      state: lead.state,
      pincode: '000000',
    };
    const customer: Customer = {
      id: generateId('cust'),
      code: `CUST-${seq}`,
      companyName: form.companyName,
      contactPerson: form.contactPerson,
      email: lead.email,
      phone: lead.phone,
      gstin: form.gstin || undefined,
      pan: form.pan || undefined,
      segment: form.segment,
      creditLimit: form.creditLimit,
      paymentTermsDays: form.paymentTermsDays,
      outstanding: 0,
      totalRevenue: 0,
      billingAddress: address,
      shippingAddress: address,
      contacts: [
        {
          id: generateId('con'),
          name: form.contactPerson,
          designation: 'Primary Contact',
          phone: lead.phone,
          email: lead.email,
          type: 'DECISION_MAKER',
        },
      ],
      state: lead.state,
      city: lead.city,
      pincode: '000000',
      ownerId: lead.assignedToId,
      active: true,
      createdAt: new Date().toISOString(),
    };
    addCustomer('customers', customer);
    updateLead('leads', lead.id, {
      status: 'WON',
      convertedCustomerId: customer.id,
      updatedAt: new Date().toISOString(),
    });
    if (currentUser) {
      logActivity(
        'lead',
        lead.id,
        'STATUS_CHANGE',
        'converted this lead to a customer',
        currentUser.id,
      );
    }
    toast.success('Lead converted to customer');
    navigate(`/customers/${customer.id}`);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Convert Lead to Customer"
        description={`Creating a customer record from ${lead.code}`}
        icon={<UserPlus />}
      />

      <Card>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/10 p-3">
            <CheckCircle2 className="size-5 text-success" />
            <p className="text-sm text-content-secondary">
              This lead will be marked <strong>Won</strong> and linked to the
              new customer record.
            </p>
          </div>

          <FormSection title="Customer Details">
            <FormGrid>
              <FormField label="Company Name" required>
                <Input
                  value={form.companyName}
                  onChange={(e) => set('companyName', e.target.value)}
                />
              </FormField>
              <FormField label="Contact Person" required>
                <Input
                  value={form.contactPerson}
                  onChange={(e) => set('contactPerson', e.target.value)}
                />
              </FormField>
              <FormField label="GSTIN">
                <GstinInput
                  value={form.gstin}
                  onChange={(e) => set('gstin', e.target.value)}
                />
              </FormField>
              <FormField label="PAN">
                <PanInput
                  value={form.pan}
                  onChange={(e) => set('pan', e.target.value)}
                />
              </FormField>
              <FormField label="Segment">
                <SelectField
                  value={form.segment}
                  onChange={(v) => set('segment', v)}
                  options={optionsFromLabels(CUSTOMER_SEGMENT)}
                />
              </FormField>
              <FormField label="Credit Limit">
                <CurrencyInput
                  value={form.creditLimit}
                  onChange={(v) => set('creditLimit', v)}
                />
              </FormField>
              <FormField label="Payment Terms (days)">
                <Input
                  type="number"
                  value={form.paymentTermsDays}
                  onChange={(e) =>
                    set('paymentTermsDays', Number(e.target.value))
                  }
                />
              </FormField>
            </FormGrid>
          </FormSection>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" onClick={() => navigate(`/leads/${lead.id}`)}>
            Cancel
          </Button>
          <Button onClick={convert} disabled={!form.companyName}>
            Convert <ArrowRight className="size-4" />
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

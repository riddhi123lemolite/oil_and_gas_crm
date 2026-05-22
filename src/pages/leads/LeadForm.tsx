import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Target, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { FormField, FormGrid, FormSection } from '@/components/forms/FormField';
import { SelectField, optionsFromLabels, optionsFromStrings } from '@/components/forms/SelectField';
import { MultiSelect } from '@/components/forms/MultiSelect';
import { CurrencyInput, PhoneInput } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { leadFormSchema, type LeadFormValues } from '@/lib/validation';
import { LEAD_STATUS, LEAD_TEMPERATURE, LEAD_SOURCE, INDIAN_STATES } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import type { Lead, LeadSource, LeadStatus, LeadTemperature } from '@/types';

export default function LeadForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const leads = useDataStore((s) => s.leads);
  const users = useDataStore((s) => s.users);
  const items = useDataStore((s) => s.items);
  const addLead = useDataStore((s) => s.add);
  const updateLead = useDataStore((s) => s.update);
  const logActivity = useDataStore((s) => s.logActivity);
  const currentUser = useAuthStore((s) => s.currentUser);

  const existing = leads.find((l) => l.id === id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: existing
      ? {
          name: existing.name,
          companyName: existing.companyName ?? '',
          phone: existing.phone,
          altPhone: existing.altPhone ?? '',
          email: existing.email ?? '',
          city: existing.city,
          state: existing.state,
          source: existing.source,
          status: existing.status,
          temperature: existing.temperature,
          estimatedValue: existing.estimatedValue ?? 0,
          assignedToId: existing.assignedToId,
          notes: existing.notes ?? '',
        }
      : {
          name: '',
          companyName: '',
          phone: '',
          city: '',
          state: 'Gujarat',
          source: 'WEBSITE',
          status: 'NEW',
          temperature: 'WARM',
          estimatedValue: 0,
          assignedToId: currentUser?.id ?? '',
        },
  });

  const phone = watch('phone');
  const duplicate = useMemo(() => {
    const digits = phone?.replace(/\D/g, '').slice(-10);
    if (!digits || digits.length < 10) return null;
    return leads.find(
      (l) =>
        l.id !== id && l.phone.replace(/\D/g, '').slice(-10) === digits,
    );
  }, [phone, leads, id]);

  const [interest, setInterest] = useState<string[]>(
    existing?.productInterest ?? [],
  );

  const onSubmit = (values: LeadFormValues) => {
    if (isEdit && existing) {
      updateLead('leads', existing.id, {
        ...values,
        source: values.source as LeadSource,
        status: values.status as LeadStatus,
        temperature: values.temperature as LeadTemperature,
        productInterest: interest,
        updatedAt: new Date().toISOString(),
      });
      toast.success('Lead updated');
      navigate(`/leads/${existing.id}`);
    } else {
      const now = new Date().toISOString();
      const seq = String(leads.length + 1).padStart(5, '0');
      const lead: Lead = {
        id: generateId('lead'),
        code: `LD-2026-${seq}`,
        name: values.name,
        companyName: values.companyName || undefined,
        phone: values.phone,
        altPhone: values.altPhone || undefined,
        email: values.email || undefined,
        city: values.city,
        state: values.state,
        source: values.source as LeadSource,
        status: values.status as LeadStatus,
        temperature: values.temperature as LeadTemperature,
        productInterest: interest,
        estimatedValue: values.estimatedValue,
        assignedToId: values.assignedToId,
        createdById: currentUser?.id ?? values.assignedToId,
        notes: values.notes || undefined,
        lastActivityAt: now,
        createdAt: now,
        updatedAt: now,
      };
      addLead('leads', lead);
      if (currentUser) {
        logActivity('lead', lead.id, 'SYSTEM', 'created this lead', currentUser.id);
      }
      toast.success('Lead created');
      navigate(`/leads/${lead.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit Lead' : 'Add New Lead'}
        description={
          isEdit
            ? `Updating ${existing?.code}`
            : 'Capture a new sales enquiry'
        }
        icon={<Target />}
      />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6">
            {duplicate && (
              <div className="flex items-start gap-2.5 rounded-md border border-warning/40 bg-warning/10 p-3">
                <AlertTriangle className="size-4 shrink-0 text-warning" />
                <div className="text-xs text-content-secondary">
                  <span className="font-semibold text-content">
                    Possible duplicate.
                  </span>{' '}
                  A lead with this mobile number already exists —{' '}
                  <span className="font-medium">
                    {duplicate.companyName ?? duplicate.name}
                  </span>{' '}
                  ({duplicate.code}). You can still save this lead.
                </div>
              </div>
            )}

            <FormSection title="Contact Details">
              <FormGrid>
                <FormField label="Contact Name" required error={errors.name?.message}>
                  <Input {...register('name')} placeholder="e.g. Rajesh Patel" />
                </FormField>
                <FormField label="Company Name" error={errors.companyName?.message}>
                  <Input
                    {...register('companyName')}
                    placeholder="e.g. Shree Krishna Petroleum"
                  />
                </FormField>
                <FormField label="Mobile Number" required error={errors.phone?.message}>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Alternate Mobile" error={errors.altPhone?.message}>
                  <Controller
                    control={control}
                    name="altPhone"
                    render={({ field }) => (
                      <PhoneInput
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Email" error={errors.email?.message}>
                  <Input {...register('email')} placeholder="name@company.in" />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Location">
              <FormGrid>
                <FormField label="City" required error={errors.city?.message}>
                  <Input {...register('city')} placeholder="e.g. Ahmedabad" />
                </FormField>
                <FormField label="State" required error={errors.state?.message}>
                  <Controller
                    control={control}
                    name="state"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={optionsFromStrings(INDIAN_STATES)}
                      />
                    )}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Lead Qualification">
              <FormGrid cols={3}>
                <FormField label="Source" required>
                  <Controller
                    control={control}
                    name="source"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={Object.entries(LEAD_SOURCE).map(([v, l]) => ({
                          value: v,
                          label: l,
                        }))}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Stage" required>
                  <Controller
                    control={control}
                    name="status"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={optionsFromLabels(LEAD_STATUS)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Temperature" required>
                  <Controller
                    control={control}
                    name="temperature"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={optionsFromLabels(LEAD_TEMPERATURE)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Estimated Value">
                  <Controller
                    control={control}
                    name="estimatedValue"
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                </FormField>
                <FormField
                  label="Assigned To"
                  required
                  error={errors.assignedToId?.message}
                >
                  <Controller
                    control={control}
                    name="assignedToId"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={users
                          .filter(
                            (u) =>
                              u.role === 'SALES_EXECUTIVE' ||
                              u.role === 'SALES_MANAGER',
                          )
                          .map((u) => ({ value: u.id, label: u.name }))}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Product Interest" className="sm:col-span-2 lg:col-span-3">
                  <MultiSelect
                    options={items.slice(0, 40).map((i) => i.name)}
                    value={interest}
                    onChange={setInterest}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Notes">
              <Textarea
                {...register('notes')}
                placeholder="Any context about this lead — requirements, timeline, objections…"
                rows={3}
              />
            </FormSection>
          </CardContent>
          <CardFooter className="justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Lead'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

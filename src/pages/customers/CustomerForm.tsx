import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid, FormSection } from '@/components/forms/FormField';
import { SelectField, optionsFromLabels, optionsFromStrings } from '@/components/forms/SelectField';
import { GstinInput, PanInput, PhoneInput, CurrencyInput } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { customerFormSchema, type CustomerFormValues } from '@/lib/validation';
import { CUSTOMER_SEGMENT, INDIAN_STATES } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import type { Customer, CustomerSegment } from '@/types';

export default function CustomerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const customers = useDataStore((s) => s.customers);
  const definitions = useDataStore((s) => s.definitions);
  const addCustomer = useDataStore((s) => s.add);
  const updateCustomer = useDataStore((s) => s.update);
  const currentUser = useAuthStore((s) => s.currentUser);

  const existing = customers.find((c) => c.id === id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: existing
      ? {
          companyName: existing.companyName,
          contactPerson: existing.contactPerson,
          email: existing.email ?? '',
          phone: existing.phone,
          altPhone: existing.altPhone ?? '',
          gstin: existing.gstin ?? '',
          pan: existing.pan ?? '',
          industry: existing.industry ?? '',
          segment: existing.segment,
          creditLimit: existing.creditLimit,
          paymentTermsDays: existing.paymentTermsDays,
          billingLine1: existing.billingAddress.line1,
          city: existing.city,
          state: existing.state,
          pincode: existing.pincode,
        }
      : {
          companyName: '',
          contactPerson: '',
          segment: 'NEW',
          creditLimit: 1000000,
          paymentTermsDays: 30,
          state: 'Gujarat',
          city: '',
          billingLine1: '',
        },
  });

  const onSubmit = (v: CustomerFormValues) => {
    const address = {
      line1: v.billingLine1,
      city: v.city,
      state: v.state,
      pincode: v.pincode ?? '',
    };
    if (isEdit && existing) {
      updateCustomer('customers', existing.id, {
        companyName: v.companyName,
        contactPerson: v.contactPerson,
        email: v.email || undefined,
        phone: v.phone,
        altPhone: v.altPhone || undefined,
        gstin: v.gstin || undefined,
        pan: v.pan || undefined,
        industry: v.industry || undefined,
        segment: v.segment as CustomerSegment,
        creditLimit: v.creditLimit,
        paymentTermsDays: v.paymentTermsDays,
        billingAddress: address,
        shippingAddress: address,
        city: v.city,
        state: v.state,
        pincode: v.pincode ?? '',
      });
      toast.success('Customer updated');
      navigate(`/customers/${existing.id}`);
    } else {
      const seq = String(customers.length + 1).padStart(5, '0');
      const customer: Customer = {
        id: generateId('cust'),
        code: `CUST-${seq}`,
        companyName: v.companyName,
        contactPerson: v.contactPerson,
        email: v.email || undefined,
        phone: v.phone,
        altPhone: v.altPhone || undefined,
        gstin: v.gstin || undefined,
        pan: v.pan || undefined,
        industry: v.industry || undefined,
        segment: v.segment as CustomerSegment,
        creditLimit: v.creditLimit,
        paymentTermsDays: v.paymentTermsDays,
        outstanding: 0,
        totalRevenue: 0,
        billingAddress: address,
        shippingAddress: address,
        contacts: [
          {
            id: generateId('con'),
            name: v.contactPerson,
            designation: 'Primary Contact',
            phone: v.phone,
            email: v.email,
            type: 'DECISION_MAKER',
          },
        ],
        city: v.city,
        state: v.state,
        pincode: v.pincode ?? '',
        ownerId: currentUser?.id ?? 'user_03',
        active: true,
        createdAt: new Date().toISOString(),
      };
      addCustomer('customers', customer);
      toast.success('Customer created');
      navigate(`/customers/${customer.id}`);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit Customer' : 'Add New Customer'}
        description={isEdit ? `Updating ${existing?.code}` : 'Create a new customer account'}
        icon={<Building2 />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-6">
            <FormSection title="Company Information">
              <FormGrid>
                <FormField label="Company Name" required error={errors.companyName?.message}>
                  <Input {...register('companyName')} placeholder="Shree Krishna Petroleum Pvt Ltd" />
                </FormField>
                <FormField label="Contact Person" required error={errors.contactPerson?.message}>
                  <Input {...register('contactPerson')} placeholder="Rajesh Patel" />
                </FormField>
                <FormField label="Mobile Number" required error={errors.phone?.message}>
                  <Controller
                    control={control}
                    name="phone"
                    render={({ field }) => (
                      <PhoneInput value={field.value} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField label="Alternate Mobile" error={errors.altPhone?.message}>
                  <Controller
                    control={control}
                    name="altPhone"
                    render={({ field }) => (
                      <PhoneInput value={field.value ?? ''} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField label="Email" error={errors.email?.message}>
                  <Input {...register('email')} placeholder="name@company.in" />
                </FormField>
                <FormField label="Industry">
                  <Controller
                    control={control}
                    name="industry"
                    render={({ field }) => (
                      <SelectField
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        options={optionsFromStrings(
                          definitions.industries.map((i) => i.label),
                        )}
                      />
                    )}
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Statutory (KYC)">
              <FormGrid>
                <FormField label="GSTIN" error={errors.gstin?.message}>
                  <GstinInput {...register('gstin')} />
                </FormField>
                <FormField label="PAN" error={errors.pan?.message}>
                  <PanInput {...register('pan')} />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Billing Address">
              <FormGrid cols={1}>
                <FormField label="Address Line" required error={errors.billingLine1?.message}>
                  <Input {...register('billingLine1')} placeholder="GIDC Estate, Phase II" />
                </FormField>
              </FormGrid>
              <FormGrid cols={3}>
                <FormField label="City" required error={errors.city?.message}>
                  <Input {...register('city')} placeholder="Ahmedabad" />
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
                <FormField label="PIN Code" error={errors.pincode?.message}>
                  <Input {...register('pincode')} placeholder="380015" maxLength={6} />
                </FormField>
              </FormGrid>
            </FormSection>

            <FormSection title="Commercial Terms">
              <FormGrid cols={3}>
                <FormField label="Segment">
                  <Controller
                    control={control}
                    name="segment"
                    render={({ field }) => (
                      <SelectField
                        value={field.value}
                        onChange={field.onChange}
                        options={optionsFromLabels(CUSTOMER_SEGMENT)}
                      />
                    )}
                  />
                </FormField>
                <FormField label="Credit Limit" error={errors.creditLimit?.message}>
                  <Controller
                    control={control}
                    name="creditLimit"
                    render={({ field }) => (
                      <CurrencyInput value={field.value} onChange={field.onChange} />
                    )}
                  />
                </FormField>
                <FormField label="Payment Terms (days)" error={errors.paymentTermsDays?.message}>
                  <Input type="number" {...register('paymentTermsDays')} />
                </FormField>
              </FormGrid>
            </FormSection>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Save Changes' : 'Create Customer'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Bus } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { vehicleFormSchema, type VehicleFormValues } from '@/lib/validation';
import { generateId } from '@/lib/utils';
import type { Vehicle } from '@/types';

const yearFromNow = (): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString();
};

export default function VehicleForm() {
  const navigate = useNavigate();
  const addVehicle = useDataStore((s) => s.add);
  const drivers = useDataStore((s) => s.drivers);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      registrationNo: '',
      type: '',
      capacityKL: 0,
      ownerType: 'OWNED',
      contractMonths: undefined,
      rcExpiry: '',
      fitnessExpiry: '',
      insuranceExpiry: '',
      currentDriverId: 'none',
    },
  });
  const ownerType = watch('ownerType');

  const onSubmit = (v: VehicleFormValues) => {
    const vehicle: Vehicle = {
      id: generateId('veh'),
      registrationNo: v.registrationNo.toUpperCase(),
      type: v.type,
      capacityKL: v.capacityKL,
      ownerType: v.ownerType,
      contractMonths: v.ownerType === 'CONTRACT' ? Number(v.contractMonths) : undefined,
      rcExpiry: v.rcExpiry ? new Date(v.rcExpiry).toISOString() : yearFromNow(),
      fitnessExpiry: v.fitnessExpiry ? new Date(v.fitnessExpiry).toISOString() : yearFromNow(),
      insuranceExpiry: v.insuranceExpiry ? new Date(v.insuranceExpiry).toISOString() : yearFromNow(),
      currentDriverId: v.currentDriverId && v.currentDriverId !== 'none' ? v.currentDriverId : undefined,
      active: true,
    };
    addVehicle('vehicles', vehicle);
    toast.success('Vehicle added');
    navigate('/vehicles');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Add Vehicle"
        description="Register a tanker with its ownership and document details"
        icon={<Bus />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            <FormGrid>
              <FormField label="Registration No." required error={errors.registrationNo?.message}>
                <Input {...register('registrationNo')} placeholder="e.g. GJ05 AB 1234" className="num" />
              </FormField>
              <FormField label="Vehicle Type" required error={errors.type?.message}>
                <Input {...register('type')} placeholder="e.g. Tanker" />
              </FormField>
              <FormField label="Capacity (KL)" required error={errors.capacityKL?.message}>
                <Input type="number" step="any" {...register('capacityKL')} className="num" />
              </FormField>
              <FormField label="Ownership" required error={errors.ownerType?.message}>
                <Controller
                  control={control}
                  name="ownerType"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={[
                        { value: 'OWNED', label: 'Owned' },
                        { value: 'CONTRACT', label: 'On Contract' },
                      ]}
                    />
                  )}
                />
              </FormField>
              {ownerType === 'CONTRACT' && (
                <FormField label="Contract Duration" required error={errors.contractMonths?.message}>
                  <Controller
                    control={control}
                    name="contractMonths"
                    render={({ field }) => (
                      <SelectField
                        value={field.value != null ? String(field.value) : undefined}
                        onChange={field.onChange}
                        placeholder="Select duration"
                        options={[
                          { value: '3', label: '3 months' },
                          { value: '6', label: '6 months' },
                          { value: '12', label: '12 months' },
                        ]}
                      />
                    )}
                  />
                </FormField>
              )}
              <FormField label="Assign Driver">
                <Controller
                  control={control}
                  name="currentDriverId"
                  render={({ field }) => (
                    <SelectField
                      value={field.value ?? 'none'}
                      onChange={field.onChange}
                      options={[
                        { value: 'none', label: 'Unassigned' },
                        ...drivers.map((d) => ({ value: d.id, label: d.name })),
                      ]}
                    />
                  )}
                />
              </FormField>
              <FormField label="RC Expiry" error={errors.rcExpiry?.message}>
                <Input type="date" {...register('rcExpiry')} />
              </FormField>
              <FormField label="Fitness Expiry" error={errors.fitnessExpiry?.message}>
                <Input type="date" {...register('fitnessExpiry')} />
              </FormField>
              <FormField label="Insurance Expiry" error={errors.insuranceExpiry?.message}>
                <Input type="date" {...register('insuranceExpiry')} />
              </FormField>
            </FormGrid>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/vehicles')}>
              Cancel
            </Button>
            <Button type="submit">Add Vehicle</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

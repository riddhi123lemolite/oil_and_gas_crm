import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IdCard } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { driverFormSchema, type DriverFormValues } from '@/lib/validation';
import { generateId } from '@/lib/utils';
import type { Driver } from '@/types';

export default function DriverForm() {
  const navigate = useNavigate();
  const addDriver = useDataStore((s) => s.add);
  const updateVehicle = useDataStore((s) => s.update);
  const vehicles = useDataStore((s) => s.vehicles);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DriverFormValues>({
    resolver: zodResolver(driverFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      licenseNo: '',
      licenseExpiry: '',
      experienceYears: 0,
      currentVehicleId: '',
    },
  });

  const onSubmit = (v: DriverFormValues) => {
    const id = generateId('drv');
    const driver: Driver = {
      id,
      name: v.name,
      phone: v.phone,
      licenseNo: v.licenseNo.toUpperCase(),
      licenseExpiry: new Date(v.licenseExpiry).toISOString(),
      experienceYears: v.experienceYears,
      currentVehicleId: v.currentVehicleId || undefined,
      active: true,
    };
    addDriver('drivers', driver);
    // Keep the chosen vehicle's driver in sync with this assignment.
    if (v.currentVehicleId) updateVehicle('vehicles', v.currentVehicleId, { currentDriverId: id });
    toast.success('Driver added');
    navigate('/drivers');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Add Driver"
        description="Add a driver with licence and vehicle-assignment details"
        icon={<IdCard />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            <FormGrid>
              <FormField label="Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Ramesh Yadav" />
              </FormField>
              <FormField label="Mobile Number" required error={errors.phone?.message}>
                <Input {...register('phone')} placeholder="10-digit mobile" className="num" />
              </FormField>
              <FormField label="License No." required error={errors.licenseNo?.message}>
                <Input {...register('licenseNo')} placeholder="e.g. GJ0520200001234" className="num" />
              </FormField>
              <FormField label="License Expiry" required error={errors.licenseExpiry?.message}>
                <Input type="date" {...register('licenseExpiry')} />
              </FormField>
              <FormField label="Experience (years)" required error={errors.experienceYears?.message}>
                <Input type="number" step="any" {...register('experienceYears')} className="num" />
              </FormField>
              <FormField label="Current Vehicle Assigned">
                <Controller
                  control={control}
                  name="currentVehicleId"
                  render={({ field }) => (
                    <SelectField
                      value={field.value ?? ''}
                      onChange={field.onChange}
                      options={[
                        { value: '', label: 'None' },
                        ...vehicles.map((veh) => ({
                          value: veh.id,
                          label: `${veh.registrationNo} · ${veh.type}`,
                        })),
                      ]}
                    />
                  )}
                />
              </FormField>
            </FormGrid>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/drivers')}>
              Cancel
            </Button>
            <Button type="submit">Add Driver</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

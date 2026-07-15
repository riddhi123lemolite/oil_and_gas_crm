import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Route as RouteIcon } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { useDataStore } from '@/stores/dataStore';
import { routeFormSchema, type RouteFormValues } from '@/lib/validation';
import { generateId } from '@/lib/utils';
import type { TransportRoute } from '@/types';

export default function RouteForm() {
  const navigate = useNavigate();
  const addRoute = useDataStore((s) => s.add);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RouteFormValues>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: { distanceKm: 0, perKmRate: 45 },
  });

  const onSubmit = (v: RouteFormValues) => {
    const route: TransportRoute = {
      id: generateId('route'),
      fromLocation: v.fromLocation,
      toLocation: v.toLocation,
      distanceKm: v.distanceKm,
      baseRent: v.baseRent || undefined,
      perKmRate: v.perKmRate || undefined,
      carrier: v.carrier || undefined,
      active: true,
    };
    addRoute('routes', route);
    toast.success('Transport route added');
    navigate('/routes');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Add Transport Route"
        description="Define a new lane in your transport network"
        icon={<RouteIcon />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <FormGrid>
              <FormField label="From Location" required error={errors.fromLocation?.message}>
                <Input {...register('fromLocation')} placeholder="e.g. Hazira, Surat" />
              </FormField>
              <FormField label="To Location" required error={errors.toLocation?.message}>
                <Input {...register('toLocation')} placeholder="e.g. Indore" />
              </FormField>
              <FormField label="Distance (km)" required error={errors.distanceKm?.message}>
                <Input type="number" {...register('distanceKm')} className="num" />
              </FormField>
              <FormField label="Per KM Rate (₹)" error={errors.perKmRate?.message}>
                <Input type="number" {...register('perKmRate')} className="num" />
              </FormField>
              <FormField label="Base Rent (₹)" error={errors.baseRent?.message}>
                <Input type="number" {...register('baseRent')} className="num" />
              </FormField>
              <FormField label="Carrier">
                <Input {...register('carrier')} placeholder="e.g. Maruti Transport" />
              </FormField>
            </FormGrid>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/routes')}>
              Cancel
            </Button>
            <Button type="submit">Add Route</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

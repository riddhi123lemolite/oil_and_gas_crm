import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField, optionsFromStrings } from '@/components/forms/SelectField';
import { PhoneInput } from '@/components/forms/inputs';
import { useDataStore } from '@/stores/dataStore';
import { staffFormSchema, type StaffFormValues } from '@/lib/validation';
import { ROLE_LABELS, INDIAN_STATES } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import type { Role, User } from '@/types';

export default function StaffForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const users = useDataStore((s) => s.users);
  const addUser = useDataStore((s) => s.add);
  const updateUser = useDataStore((s) => s.update);
  const existing = users.find((u) => u.id === id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: existing
      ? {
          name: existing.name,
          email: existing.email,
          phone: existing.phone,
          password: existing.password,
          role: existing.role,
          city: existing.city,
          state: existing.state,
        }
      : {
          name: '',
          email: '',
          phone: '',
          password: '',
          role: 'SALES_EXECUTIVE',
          city: '',
          state: 'Gujarat',
        },
  });

  const onSubmit = (v: StaffFormValues) => {
    if (isEdit && existing) {
      updateUser('users', existing.id, {
        name: v.name,
        email: v.email,
        phone: v.phone,
        password: v.password,
        role: v.role as Role,
        city: v.city,
        state: v.state,
      });
      toast.success('User updated');
    } else {
      const seq = users.length + 1;
      const user: User = {
        id: generateId('user'),
        userCode: `USER${String(seq).padStart(2, '0')}`,
        name: v.name,
        email: v.email,
        phone: v.phone,
        password: v.password,
        role: v.role as Role,
        city: v.city,
        state: v.state,
        active: true,
        createdAt: new Date().toISOString(),
      };
      addUser('users', user);
      toast.success('User created');
    }
    navigate('/staff');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit User' : 'Add New User'}
        description="Manage a team member's account and role"
        icon={<UserPlus />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent>
            <FormGrid>
              <FormField label="Full Name" required error={errors.name?.message}>
                <Input {...register('name')} placeholder="e.g. Amit Sharma" />
              </FormField>
              <FormField label="Email" required error={errors.email?.message}>
                <Input {...register('email')} placeholder="name@oilgas.in" />
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
              <FormField label="Password" required error={errors.password?.message}>
                <Input {...register('password')} placeholder="Set a password" />
              </FormField>
              <FormField label="Role" required>
                <Controller
                  control={control}
                  name="role"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={(Object.keys(ROLE_LABELS) as Role[]).map((r) => ({
                        value: r,
                        label: ROLE_LABELS[r],
                      }))}
                    />
                  )}
                />
              </FormField>
              <FormField label="City" required error={errors.city?.message}>
                <Input {...register('city')} placeholder="e.g. Surat" />
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
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate('/staff')}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Create User'}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

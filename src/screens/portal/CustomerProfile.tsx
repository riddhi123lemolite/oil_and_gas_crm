import { useState } from 'react';
import { User, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { useAuthStore } from '@/stores/authStore';

export default function CustomerProfile() {
  const user = useAuthStore((s) => s.currentUser);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  return (
    <div className="space-y-5">
      <PageHeader title="My Profile" description="Your personal contact details." icon={<User />} />

      <div className="card p-5">
        <div className="flex items-center gap-4">
          <EntityAvatar name={name || 'Customer'} size="xl" />
          <div>
            <div className="font-display text-xl font-bold">{name || '—'}</div>
            <div className="text-sm text-content-muted num">{user?.userCode ?? ''} · Customer</div>
          </div>
        </div>

        <form
          className="mt-6"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success('Profile updated');
          }}
        >
          <FormGrid>
            <FormField label="Full Name" htmlFor="name">
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label="Email" htmlFor="email">
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </FormField>
            <FormField label="Phone" htmlFor="phone">
              <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
          </FormGrid>
          <div className="mt-4">
            <Button type="submit">
              <Save className="size-4" /> Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

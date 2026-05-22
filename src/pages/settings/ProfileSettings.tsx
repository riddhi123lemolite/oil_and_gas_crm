import { useState } from 'react';
import { UserCog, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useAuth } from '@/hooks/useAuth';
import { useDataStore } from '@/stores/dataStore';
import { useThemeStore } from '@/stores/themeStore';
import { ROLE_LABELS } from '@/lib/constants';

export default function ProfileSettings() {
  const { user } = useAuth();
  const updateUser = useDataStore((s) => s.update);
  const { theme, toggle } = useThemeStore();

  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [avatar, setAvatar] = useState(user?.avatarUrl);
  const [password, setPassword] = useState('');
  const [emailNotif, setEmailNotif] = useState(true);

  const saveProfile = () => {
    if (!user) return;
    updateUser('users', user.id, {
      name,
      phone,
      avatarUrl: avatar,
      ...(password ? { password } : {}),
    });
    toast.success('Profile updated');
    setPassword('');
  };

  const onAvatar = (file?: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Profile Settings"
        description="Manage your personal account"
        icon={<UserCog />}
      />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <EntityAvatar
              name={user?.name ?? 'User'}
              src={avatar}
              size="xl"
            />
            <div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-line px-3 py-1.5 text-sm font-medium text-content-secondary hover:bg-muted">
                <Upload className="size-4" />
                Upload Photo
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onAvatar(e.target.files?.[0])}
                />
              </label>
              <p className="mt-1 text-xs text-content-muted">
                Stored locally in your browser.
              </p>
            </div>
          </div>
          <FormGrid>
            <FormField label="Full Name">
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </FormField>
            <FormField label="Email">
              <Input value={user?.email ?? ''} disabled />
            </FormField>
            <FormField label="Mobile Number">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </FormField>
            <FormField label="Role">
              <Input value={user ? ROLE_LABELS[user.role] : ''} disabled />
            </FormField>
          </FormGrid>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent>
          <FormField label="New Password" hint="Leave blank to keep current password">
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-content">Dark Mode</div>
              <div className="text-xs text-content-muted">
                Switch between light and dark themes
              </div>
            </div>
            <Switch checked={theme === 'dark'} onCheckedChange={toggle} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-medium text-content">
                Email Notifications
              </div>
              <div className="text-xs text-content-muted">
                Get notified about leads and approvals
              </div>
            </div>
            <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button onClick={saveProfile}>Save Changes</Button>
        </CardFooter>
      </Card>
    </div>
  );
}

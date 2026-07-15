import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { cn } from '@/lib/utils';

function strength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 8) score += 1;
  if (/[A-Z]/.test(pw)) score += 1;
  if (/[0-9]/.test(pw)) score += 1;
  if (/[^A-Za-z0-9]/.test(pw)) score += 1;
  const labels = ['Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#DC2626', '#F59E0B', '#2563EB', '#16A34A'];
  return {
    score,
    label: labels[Math.max(0, score - 1)] ?? 'Weak',
    color: colors[Math.max(0, score - 1)] ?? '#DC2626',
  };
}

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);

  const s = strength(password);
  const mismatch = confirm.length > 0 && confirm !== password;

  return (
    <AuthLayout
      heading="Set a new password"
      subheading="Choose a strong password for your account"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (mismatch || password.length < 4) return;
          toast.success('Password updated successfully');
          navigate('/login');
        }}
        className="space-y-4"
      >
        <FormField label="New Password" htmlFor="pw">
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <Input
              id="pw"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-8"
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted"
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {password.length > 0 && (
            <div className="mt-1.5 flex items-center gap-2">
              <div className="flex flex-1 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor:
                        i < s.score ? s.color : 'var(--border)',
                    }}
                  />
                ))}
              </div>
              <span
                className="text-xs font-medium"
                style={{ color: s.color }}
              >
                {s.label}
              </span>
            </div>
          )}
        </FormField>

        <FormField
          label="Confirm Password"
          htmlFor="confirm"
          error={mismatch ? 'Passwords do not match' : undefined}
        >
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <Input
              id="confirm"
              type={show ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={cn('pl-8', mismatch && 'border-danger')}
              placeholder="••••••••"
              required
            />
          </div>
        </FormField>

        <Button type="submit" className="w-full">
          Update Password
        </Button>
      </form>
    </AuthLayout>
  );
}

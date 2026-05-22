import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { DEMO_ACCOUNTS } from '@/lib/mockAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { Checkbox } from '@/components/ui/checkbox';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState('admin@oilgas.in');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const result = login(email, password);
      setLoading(false);
      if (result.ok) {
        toast.success('Signed in successfully');
        navigate('/');
      } else {
        setError(result.error ?? 'Login failed');
      }
    }, 400);
  };

  const quickFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
    setError('');
  };

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your OilGas CRM workspace"
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Email Address" htmlFor="email">
          <div className="relative">
            <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@oilgas.in"
              className="pl-8"
              autoComplete="email"
            />
          </div>
        </FormField>

        <FormField label="Password" htmlFor="password">
          <div className="relative">
            <Lock className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="px-8"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </FormField>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm text-content-secondary">
            <Checkbox
              checked={remember}
              onCheckedChange={(v) => setRemember(!!v)}
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-medium text-brand-secondary hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          Sign In
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="mt-6">
        <div className="mb-2 text-center text-[11px] font-semibold uppercase tracking-wide text-content-muted">
          Demo accounts — click to fill
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.role}
              type="button"
              onClick={() => quickFill(acc.email, acc.password)}
              className="rounded-md border border-line bg-surface px-2.5 py-2 text-left transition-colors hover:border-brand-secondary/50 hover:bg-muted"
            >
              <div className="text-xs font-semibold text-content">
                {acc.label}
              </div>
              <div className="num truncate text-[10px] text-content-muted">
                {acc.email}
              </div>
            </button>
          ))}
        </div>
      </div>
    </AuthLayout>
  );
}

import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { DEMO_MODE } from '@/lib/config';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';
import { Checkbox } from '@/components/ui/checkbox';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState(DEMO_MODE ? 'demo@oilgas.in' : '');
  const [password, setPassword] = useState(DEMO_MODE ? 'demo1234' : '');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.ok) {
      setLoading(false);
      setError(result.error ?? 'Login failed');
      return;
    }
    // Load the shared workspace before entering the app.
    await useDataStore.getState().hydrate();
    setLoading(false);
    toast.success('Signed in successfully');
    navigate('/');
  };

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Sign in to your OilGas CRM workspace"
    >
      {DEMO_MODE && (
        <div className="mb-4 rounded-md border border-brand-secondary/30 bg-brand-secondary/10 px-3 py-2 text-xs font-medium text-brand-secondary">
          Demo mode — any email &amp; password works. Just click Sign In.
        </div>
      )}

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

      <div className="mt-6 border-t border-line pt-5 text-center text-sm text-content-secondary">
        New to OilGas CRM?{' '}
        <Link
          to="/signup"
          className="font-medium text-brand-secondary hover:underline"
        >
          Create an account
        </Link>
      </div>
    </AuthLayout>
  );
}

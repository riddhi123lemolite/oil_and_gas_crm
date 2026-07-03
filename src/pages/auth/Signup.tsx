import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  MailCheck,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { useAuthStore } from '@/stores/authStore';
import { useDataStore } from '@/stores/dataStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';

export default function Signup() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    const result = await signup(name, email, password);
    if (!result.ok) {
      setLoading(false);
      setError(result.error ?? 'Sign up failed');
      return;
    }
    if (result.needsConfirmation) {
      setLoading(false);
      setCheckEmail(true);
      return;
    }
    await useDataStore.getState().hydrate();
    setLoading(false);
    toast.success('Account created');
    navigate('/');
  };

  if (checkEmail) {
    return (
      <AuthLayout heading="Confirm your email" subheading="One quick step to finish">
        <div className="space-y-4">
          <div className="flex size-11 items-center justify-center rounded-lg bg-brand-secondary/10 text-brand-secondary">
            <MailCheck className="size-5" />
          </div>
          <p className="text-sm text-content-secondary">
            We sent a confirmation link to{' '}
            <span className="font-medium text-content">{email}</span>. Click it,
            then come back and sign in.
          </p>
          <Button className="w-full" onClick={() => navigate('/login')}>
            Go to sign in <ArrowRight className="size-4" />
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      heading="Create your account"
      subheading="Start managing your CRM workspace"
    >
      <form onSubmit={submit} className="space-y-4">
        <FormField label="Full Name" htmlFor="name">
          <div className="relative">
            <UserIcon className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Priya Shah"
              className="pl-8"
              autoComplete="name"
            />
          </div>
        </FormField>

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
              placeholder="At least 6 characters"
              className="px-8"
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-content-muted hover:text-content"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </FormField>

        {error && (
          <div className="rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-xs font-medium text-danger">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" loading={loading}>
          Create Account
          {!loading && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <div className="mt-6 border-t border-line pt-5 text-center text-sm text-content-secondary">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-medium text-brand-secondary hover:underline"
        >
          Sign in
        </Link>
      </div>
    </AuthLayout>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/forms/FormField';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout
      heading="Reset your password"
      subheading="We'll email you a secure reset link"
    >
      {sent ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 p-4">
            <CheckCircle2 className="size-5 shrink-0 text-success" />
            <div>
              <p className="text-sm font-medium text-content">
                Check your inbox
              </p>
              <p className="mt-0.5 text-xs text-content-muted">
                If an account exists for{' '}
                <span className="font-medium">{email || 'that email'}</span>,
                we've sent a password reset link.
              </p>
            </div>
          </div>
          <Button asChild variant="outline" className="w-full">
            <Link to="/login">
              <ArrowLeft className="size-4" /> Back to sign in
            </Link>
          </Button>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
          }}
          className="space-y-4"
        >
          <FormField
            label="Email Address"
            htmlFor="email"
            hint="Enter the email linked to your account"
          >
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@oilgas.in"
                className="pl-8"
                required
              />
            </div>
          </FormField>
          <Button type="submit" className="w-full">
            Send Reset Link
          </Button>
          <Link
            to="/login"
            className="flex items-center justify-center gap-1.5 text-sm font-medium text-content-muted hover:text-content"
          >
            <ArrowLeft className="size-4" /> Back to sign in
          </Link>
        </form>
      )}
    </AuthLayout>
  );
}

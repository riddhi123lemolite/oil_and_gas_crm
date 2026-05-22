import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { AuthLayout } from './AuthLayout';
import { Button } from '@/components/ui/button';

export default function OtpVerification() {
  const navigate = useNavigate();
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [seconds, setSeconds] = useState(30);
  const [error, setError] = useState('');
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds]);

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError('');
    if (clean && index < 5) refs.current[index + 1]?.focus();
  };

  const verify = () => {
    const code = digits.join('');
    if (code === '123456') {
      toast.success('Verified successfully');
      navigate('/');
    } else {
      setError('Invalid code. For this demo, use 123456.');
    }
  };

  return (
    <AuthLayout
      heading="Verify your identity"
      subheading="Enter the 6-digit code sent to your mobile number"
    >
      <div className="space-y-5">
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={digit}
              onChange={(e) => setDigit(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Backspace' && !digit && i > 0) {
                  refs.current[i - 1]?.focus();
                }
              }}
              inputMode="numeric"
              maxLength={1}
              className="num size-12 rounded-md border border-line bg-surface text-center text-lg font-semibold text-content focus:border-brand-secondary focus:outline-none focus:ring-2 focus:ring-brand-secondary/20"
            />
          ))}
        </div>

        {error && (
          <p className="text-center text-xs font-medium text-danger">
            {error}
          </p>
        )}

        <div className="rounded-md bg-muted px-3 py-2 text-center text-xs text-content-muted">
          Demo tip — the verification code is{' '}
          <span className="num font-semibold text-content">123456</span>
        </div>

        <Button
          className="w-full"
          onClick={verify}
          disabled={digits.some((d) => !d)}
        >
          Verify & Continue
        </Button>

        <div className="text-center text-sm text-content-muted">
          {seconds > 0 ? (
            <span>
              Resend code in{' '}
              <span className="num font-medium text-content">{seconds}s</span>
            </span>
          ) : (
            <button
              onClick={() => setSeconds(30)}
              className="font-medium text-brand-secondary hover:underline"
            >
              Resend code
            </button>
          )}
        </div>
      </div>
    </AuthLayout>
  );
}

import type { ReactNode } from 'react';
import { Logo } from '@/components/shared/Logo';
import { Droplets, TrendingUp, Truck, ShieldCheck } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: TrendingUp, text: 'Track leads, proposals & margins per KL' },
  { icon: Truck, text: 'Schedule tanker dispatch end-to-end' },
  { icon: ShieldCheck, text: 'GST-compliant invoicing built in' },
];

/** Split-screen layout shared by every authentication screen. */
export function AuthLayout({
  children,
  heading,
  subheading,
}: {
  children: ReactNode;
  heading: string;
  subheading: string;
}) {
  return (
    <div className="flex min-h-screen bg-base">
      {/* Brand panel */}
      <div className="relative hidden w-1/2 overflow-hidden bg-brand-primary lg:flex lg:flex-col">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-brand-secondary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-16 size-96 rounded-full bg-brand-accent/15 blur-3xl" />

        <div className="relative flex flex-1 flex-col p-12 text-white">
          <div className="flex items-center gap-2.5">
            <Droplets className="size-7 text-brand-secondary" />
            <span className="font-display text-lg font-bold">
              OilGas CRM
            </span>
          </div>

          <div className="my-auto max-w-md">
            <h1 className="font-display text-4xl font-bold leading-tight">
              The CRM built for petroleum & petrochemical trading.
            </h1>
            <p className="mt-3 text-white/70">
              From refinery sourcing to last-mile tanker delivery — manage
              your entire sales pipeline in one place.
            </p>
            <div className="mt-8 space-y-3">
              {HIGHLIGHTS.map((h) => {
                const Icon = h.icon;
                return (
                  <div key={h.text} className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-white/10">
                      <Icon className="size-[18px] text-brand-secondary" />
                    </div>
                    <span className="text-sm text-white/85">{h.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative text-xs text-white/40">
            © 2026 OilGas CRM · Interactive prototype · All data is mocked
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="font-display text-2xl font-bold text-content">
            {heading}
          </h2>
          <p className="mt-1 text-sm text-content-muted">{subheading}</p>
          <div className="mt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}

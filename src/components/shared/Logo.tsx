import { cn } from '@/lib/utils';

interface LogoProps {
  showWordmark?: boolean;
  className?: string;
}

/** Flame + droplet brand mark for the OilGas CRM. */
export function Logo({ showWordmark = true, className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        className="size-8 shrink-0"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="7" fill="#0F3D5C" />
        <path
          d="M16 5.5c3.4 3.1 6.4 6.6 6.4 11.1A6.4 6.4 0 0 1 16 24a6.4 6.4 0 0 1-6.4-7.4C9.6 12.1 12.6 8.6 16 5.5Z"
          fill="#E87722"
        />
        <path
          d="M16 12.3c1.7 1.7 3 3.4 3 5.4A3 3 0 0 1 16 20.6a3 3 0 0 1-3-2.9c0-2 1.3-3.7 3-5.4Z"
          fill="#FFD9B8"
        />
      </svg>
      {showWordmark && (
        <div className="leading-tight">
          <div className="font-display text-base font-bold text-content">
            OilGas <span className="text-brand-secondary">CRM</span>
          </div>
          <div className="text-[10px] font-medium uppercase tracking-wider text-content-muted">
            Petro Trading Suite
          </div>
        </div>
      )}
    </div>
  );
}

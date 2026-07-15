import { forwardRef, type HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Frosted-glass surface used across the admin dashboard's premium sections.
 * Layers a translucent surface + blur over a soft gradient wash, all built
 * from theme tokens so it adapts to light/dark automatically.
 */
export const GlassCard = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-xl border border-line/70 bg-surface/70 shadow-pop backdrop-blur-xl',
        'before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px',
        'before:bg-gradient-to-r before:from-transparent before:via-brand-secondary/40 before:to-transparent',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassCard.displayName = 'GlassCard';

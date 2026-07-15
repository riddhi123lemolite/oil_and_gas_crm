import { useCountUp } from '@/hooks/useCountUp';
import { cn } from '@/lib/utils';

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  className?: string;
}

/** A number that counts up to its value on mount. */
export function AnimatedCounter({
  value,
  format = (n) => String(Math.round(n)),
  duration,
  className,
}: AnimatedCounterProps) {
  const display = useCountUp(value, duration);
  return <span className={cn('num tabular-nums', className)}>{format(display)}</span>;
}

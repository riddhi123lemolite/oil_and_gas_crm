import { useEffect, useId, useState } from 'react';
import { cn } from '@/lib/utils';

interface PerformanceRingProps {
  /** Completion percentage (0–100+, clamped for the arc). */
  pct: number;
  color: string;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}

/**
 * Circular completion ring with a gradient stroke. Animates from empty to the
 * target arc via a CSS transition, so it still lands on the correct value when
 * animations are unavailable (reduced motion / backgrounded tab).
 */
export function PerformanceRing({
  pct,
  color,
  size = 96,
  stroke = 9,
  label,
  className,
}: PerformanceRingProps) {
  const gradientId = useId();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = mounted
    ? circumference * (1 - clamped / 100)
    : circumference;

  return (
    <div
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.65} />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--bg-muted)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="num text-lg font-bold text-content">
          {Math.round(pct)}%
        </span>
        {label && (
          <span className="text-[10px] uppercase tracking-wide text-content-muted">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

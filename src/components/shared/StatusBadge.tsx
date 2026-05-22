import { Badge } from '@/components/ui/badge';
import type { BadgeTone, LabelDef } from '@/lib/constants';

interface StatusBadgeProps {
  def?: LabelDef;
  label?: string;
  tone?: BadgeTone;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

const DOT_COLOR: Record<BadgeTone, string> = {
  hot: 'bg-hot',
  warm: 'bg-warm',
  cold: 'bg-cold',
  followup: 'bg-followup',
  neutral: 'bg-content-muted',
  success: 'bg-success',
  danger: 'bg-danger',
  info: 'bg-info',
  brand: 'bg-brand-primary',
};

export function StatusBadge({
  def,
  label,
  tone,
  size = 'md',
  dot,
  className,
}: StatusBadgeProps) {
  const resolvedTone = (tone ?? def?.tone ?? 'neutral') as BadgeTone;
  const resolvedLabel = label ?? def?.label ?? '—';
  return (
    <Badge tone={resolvedTone} size={size} uppercase className={className}>
      {dot && (
        <span
          className={`size-1.5 rounded-full ${DOT_COLOR[resolvedTone]}`}
        />
      )}
      {resolvedLabel}
    </Badge>
  );
}

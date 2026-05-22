import type { LucideIcon } from 'lucide-react';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  delta?: number;
  deltaLabel?: string;
  spark?: number[];
  accent?: string;
  onClick?: () => void;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  delta,
  deltaLabel = 'vs last period',
  spark,
  accent = '#0F3D5C',
  onClick,
}: KpiCardProps) {
  const positive = (delta ?? 0) >= 0;
  const sparkData = (spark ?? []).map((v, i) => ({ i, v }));
  const gradId = `kpi-${label.replace(/\W/g, '')}`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={cn(
        'card group relative flex flex-col overflow-hidden p-4 text-left transition-all',
        onClick && 'cursor-pointer hover:border-brand-secondary/40 hover:shadow-pop',
      )}
    >
      <div className="flex items-start justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-content-muted">
          {label}
        </span>
        <span
          className="flex size-7 items-center justify-center rounded-md"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          <Icon className="size-4" strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-2 num text-3xl font-semibold text-content">
        {value}
      </div>

      <div className="mt-1.5 flex items-center gap-1.5">
        {delta !== undefined && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-xs font-semibold',
              positive ? 'text-success' : 'text-danger',
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3.5" />
            ) : (
              <ArrowDownRight className="size-3.5" />
            )}
            {Math.abs(delta).toFixed(1)}%
          </span>
        )}
        <span className="text-xs text-content-muted">{deltaLabel}</span>
      </div>

      {sparkData.length > 1 && (
        <div className="-mx-4 -mb-4 mt-3 h-10 opacity-90">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkData}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="v"
                stroke={accent}
                strokeWidth={1.75}
                fill={`url(#${gradId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </button>
  );
}

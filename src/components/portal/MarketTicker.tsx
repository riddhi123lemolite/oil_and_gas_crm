import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { formatMarket } from '@/lib/market';
import { formatTime } from '@/lib/format';
import type { LiveTicker } from '@/hooks/useLiveMarket';

/** A single live price card — value, daily change, trend arrow and mini chart. */
export function MarketTicker({ t, highlight }: { t: LiveTicker; highlight?: boolean }) {
  const up = t.change >= 0;
  const color = up ? '#16A34A' : '#DC2626';
  const spark = t.history.map((v, i) => ({ i, v }));
  const gradId = `spark-${t.name.replace(/\W/g, '')}`;

  return (
    <div className={`card p-3.5 ${highlight ? 'ring-1 ring-brand-secondary/40' : ''}`}>
      <div className="flex items-center justify-between">
        <span className="truncate text-xs font-medium text-content-secondary">{t.name}</span>
        {highlight && (
          <span className="rounded bg-brand-secondary/12 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-brand-secondary">
            Key
          </span>
        )}
      </div>
      <div className="num mt-1.5 text-lg font-semibold text-content">{formatMarket(t)}</div>
      <div className="flex items-center justify-between">
        <span
          className="inline-flex items-center gap-0.5 text-xs font-semibold"
          style={{ color }}
        >
          {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
          {Math.abs(t.change).toFixed(2)}%
        </span>
        {spark.length > 1 && (
          <div className="h-7 w-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} fill={`url(#${gradId})`} isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <div className="mt-1 text-[10px] text-content-muted">Updated {formatTime(new Date(t.lastUpdated))}</div>
    </div>
  );
}

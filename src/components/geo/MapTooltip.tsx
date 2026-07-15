import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatINRCompact, formatKL, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { StateAnalytics } from '@/lib/geo/types';

interface MapTooltipProps {
  data: StateAnalytics | null;
  /** Viewport coordinates of the pointer. */
  x: number;
  y: number;
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-content-muted">{label}</span>
      <span className="num font-medium text-content">{value}</span>
    </div>
  );
}

/**
 * Custom floating tooltip for the choropleth — no native title attributes.
 * Fades/rises in with framer-motion and follows the pointer.
 */
export function MapTooltip({ data, x, y }: MapTooltipProps) {
  return (
    <AnimatePresence>
      {data && (
        <motion.div
          key={data.state}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          style={{ left: x + 16, top: y + 16 }}
          className="pointer-events-none fixed z-50 w-56 rounded-lg border border-line bg-surface/95 p-3 text-xs shadow-pop backdrop-blur"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-display text-sm font-semibold text-content">
              {data.state}
            </span>
            {data.region && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-content-secondary">
                {data.region}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <Line label="Revenue" value={formatINRCompact(data.revenue)} />
            <Line label="Projects" value={formatNumber(data.projects)} />
            <Line label="Clients" value={formatNumber(data.clients)} />
            <Line label="Consumption" value={formatKL(data.consumption)} />
            <div className="flex items-center justify-between gap-6 pt-0.5">
              <span className="text-content-muted">Growth</span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold',
                  data.growth >= 0 ? 'text-success' : 'text-danger',
                )}
              >
                {data.growth >= 0 ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {Math.abs(data.growth).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

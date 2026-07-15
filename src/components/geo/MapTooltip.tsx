import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { formatINRCompact, formatKL, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { StateAnalytics } from '@/lib/geo/types';

/** Pointer position + the size of the map container it must stay within. */
export interface TooltipAnchor {
  data: StateAnalytics;
  /** Pointer coordinates relative to the map container. */
  x: number;
  y: number;
  /** Map container dimensions, used to keep the tooltip inside the map. */
  cw: number;
  ch: number;
}

interface MapTooltipProps {
  hovered: TooltipAnchor | null;
}

// Approximate tooltip footprint (w-56 + ~6 rows) used to clamp/flip.
const TIP_W = 224;
const TIP_H = 176;
const GAP = 14;
const EDGE = 8;

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-6">
      <span className="text-content-muted">{label}</span>
      <span className="num font-medium text-content">{value}</span>
    </div>
  );
}

/**
 * Custom floating tooltip for the choropleth — positioned absolutely within
 * the map container and flipped/clamped so it never spills outside the map.
 */
export function MapTooltip({ hovered }: MapTooltipProps) {
  let left = 0;
  let top = 0;
  if (hovered) {
    // Prefer bottom-right of the pointer; flip when it would overflow.
    left = hovered.x + GAP;
    if (left + TIP_W > hovered.cw - EDGE) left = hovered.x - TIP_W - GAP;
    left = Math.max(EDGE, Math.min(left, hovered.cw - TIP_W - EDGE));

    top = hovered.y + GAP;
    if (top + TIP_H > hovered.ch - EDGE) top = hovered.y - TIP_H - GAP;
    top = Math.max(EDGE, Math.min(top, Math.max(EDGE, hovered.ch - TIP_H - EDGE)));
  }

  return (
    <AnimatePresence>
      {hovered && (
        <motion.div
          key={hovered.data.state}
          initial={{ opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 4, scale: 0.98 }}
          transition={{ duration: 0.14, ease: 'easeOut' }}
          style={{ left, top }}
          className="pointer-events-none absolute z-30 w-56 rounded-lg border border-line bg-surface/95 p-3 text-xs shadow-pop backdrop-blur"
        >
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="font-display text-sm font-semibold text-content">
              {hovered.data.state}
            </span>
            {hovered.data.region && (
              <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-content-secondary">
                {hovered.data.region}
              </span>
            )}
          </div>
          <div className="space-y-1">
            <Line label="Revenue" value={formatINRCompact(hovered.data.revenue)} />
            <Line label="Projects" value={formatNumber(hovered.data.projects)} />
            <Line label="Clients" value={formatNumber(hovered.data.clients)} />
            <Line label="Consumption" value={formatKL(hovered.data.consumption)} />
            <div className="flex items-center justify-between gap-6 pt-0.5">
              <span className="text-content-muted">Growth</span>
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold',
                  hovered.data.growth >= 0 ? 'text-success' : 'text-danger',
                )}
              >
                {hovered.data.growth >= 0 ? (
                  <ArrowUpRight className="size-3" />
                ) : (
                  <ArrowDownRight className="size-3" />
                )}
                {Math.abs(hovered.data.growth).toFixed(1)}%
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

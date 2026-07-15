import { motion } from 'framer-motion';
import { gradientStops } from '@/lib/geo/color';
import type { GeoMetric } from '@/lib/geo/metrics';

interface MapLegendProps {
  metric: GeoMetric;
  low: string;
  max: number;
}

/**
 * Gradient legend that re-labels and re-colours itself for the active metric.
 * The bar animates on every metric switch.
 */
export function MapLegend({ metric, low, max }: MapLegendProps) {
  const stops = gradientStops(low, metric.hue);
  const mid = metric.format(max / 2);

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-medium uppercase tracking-wide text-content-muted">
        {metric.label}
      </span>
      <motion.div
        key={metric.key}
        initial={{ opacity: 0.4, scaleX: 0.96 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="h-2.5 w-full origin-left rounded-full"
        style={{
          background: `linear-gradient(to right, ${stops.join(', ')})`,
        }}
      />
      <div className="flex items-center justify-between text-[10px] text-content-muted">
        <span>Low</span>
        <span className="num">{mid}</span>
        <span>{metric.format(max)}</span>
      </div>
    </div>
  );
}

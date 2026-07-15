import { motion } from 'framer-motion';
import { GEO_METRICS, GEO_METRIC_ORDER } from '@/lib/geo/metrics';
import { cn } from '@/lib/utils';
import type { GeoMetricKey } from '@/lib/geo/types';

interface MetricPickerProps {
  value: GeoMetricKey;
  onChange: (key: GeoMetricKey) => void;
}

/** Segmented control for the colour metric, with a sliding active pill. */
export function MetricPicker({ value, onChange }: MetricPickerProps) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {GEO_METRIC_ORDER.map((key) => {
        const m = GEO_METRICS[key];
        const active = key === value;
        const Icon = m.icon;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-ring',
              active
                ? 'text-white'
                : 'text-content-secondary hover:bg-muted',
            )}
          >
            {active && (
              <motion.span
                layoutId="metric-pill"
                className="absolute inset-0 rounded-full"
                style={{ backgroundColor: m.hue }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="relative size-3.5" strokeWidth={1.75} />
            <span className="relative">{m.short}</span>
          </button>
        );
      })}
    </div>
  );
}

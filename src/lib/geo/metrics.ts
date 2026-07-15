// ============================================================================
// Metric catalogue for the choropleth.
//
// Each metric owns its label, a value formatter, and a single "hue" used to
// build the colour ramp. Every hue is a token from the CRM palette (see
// tailwind.config brand/cat/semantic colours) — kept here as hex because SVG
// fills are interpolated numerically and can't use Tailwind classes.
// ============================================================================

import {
  Banknote,
  Droplets,
  Flame,
  Users,
  Briefcase,
  ClipboardList,
  Gauge,
  type LucideIcon,
} from 'lucide-react';
import { formatINRCompact, formatKL, formatNumber } from '@/lib/format';
import type { GeoMetricKey } from './types';

export interface GeoMetric {
  key: GeoMetricKey;
  label: string;
  /** Short label for compact chips / legend. */
  short: string;
  icon: LucideIcon;
  /** Palette hue that anchors the high end of the colour ramp. */
  hue: string;
  format: (value: number) => string;
  /** One-line description shown under the metric picker. */
  description: string;
}

export const GEO_METRICS: Record<GeoMetricKey, GeoMetric> = {
  revenue: {
    key: 'revenue',
    label: 'Revenue',
    short: 'Revenue',
    icon: Banknote,
    hue: '#E87722', // brand.secondary
    format: formatINRCompact,
    description: 'Billed revenue by state',
  },
  oil: {
    key: 'oil',
    label: 'Oil Distribution',
    short: 'Oil',
    icon: Droplets,
    hue: '#B45309', // cat.oil
    format: formatKL,
    description: 'Oil & lubricant volume distributed',
  },
  gas: {
    key: 'gas',
    label: 'Gas Distribution',
    short: 'Gas',
    icon: Flame,
    hue: '#0891B2', // cat.glycol
    format: formatKL,
    description: 'Gas & petrochemical volume distributed',
  },
  clients: {
    key: 'clients',
    label: 'Active Clients',
    short: 'Clients',
    icon: Users,
    hue: '#0F3D5C', // brand.primary
    format: (v) => formatNumber(v),
    description: 'Active customers by state',
  },
  projects: {
    key: 'projects',
    label: 'Active Projects',
    short: 'Projects',
    icon: Briefcase,
    hue: '#2563EB', // info
    format: (v) => formatNumber(v),
    description: 'Open proposals in play',
  },
  pendingOrders: {
    key: 'pendingOrders',
    label: 'Pending Orders',
    short: 'Pending',
    icon: ClipboardList,
    hue: '#D97706', // warning
    format: (v) => formatNumber(v),
    description: 'Orders awaiting dispatch',
  },
  consumption: {
    key: 'consumption',
    label: 'Total Consumption',
    short: 'Consumption',
    icon: Gauge,
    hue: '#00A878', // brand.accent
    format: formatKL,
    description: 'Total distributed volume',
  },
};

export const GEO_METRIC_ORDER: GeoMetricKey[] = [
  'revenue',
  'oil',
  'gas',
  'clients',
  'projects',
  'pendingOrders',
  'consumption',
];

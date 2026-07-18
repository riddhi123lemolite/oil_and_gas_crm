import { Briefcase, LayoutGrid, Rocket, TrendingUp, type LucideIcon } from 'lucide-react';
import type { WidgetId } from './widgets';

// ---------------------------------------------------------------------------
// Starting points.
//
// Eighteen toggles is a lot to face from scratch, so a preset gets you 90% of
// the way in one click; the widget lists then fine-tune. A preset only ever
// sets *visibility* — never order — so someone who has arranged their layout
// keeps that arrangement when they switch preset.
// ---------------------------------------------------------------------------

export interface DashboardPreset {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  /** Widgets switched on. Everything else available is switched off. */
  widgets: WidgetId[];
}

export const PRESETS: DashboardPreset[] = [
  {
    id: 'essentials',
    label: 'Essentials',
    description: 'Headline numbers and the sales trend. Nothing else.',
    icon: Rocket,
    accent: '#0891B2',
    widgets: [
      'totalSales',
      'quantitySold',
      'activeLeads',
      'wonDeals',
      'salesTrend',
      'myTasks',
    ],
  },
  {
    id: 'sales',
    label: 'Sales focus',
    description: 'Pipeline, product mix and the customers driving revenue.',
    icon: TrendingUp,
    accent: '#E87722',
    widgets: [
      'totalSales',
      'quantitySold',
      'avgRate',
      'activeLeads',
      'wonDeals',
      'salesTrend',
      'pipelineFunnel',
      'productMix',
      'topCustomers',
      'myTasks',
    ],
  },
  {
    id: 'leadership',
    label: 'Leadership',
    description: 'Geography, team performance and the leaderboard.',
    icon: Briefcase,
    accent: '#7C3AED',
    widgets: [
      'totalSales',
      'quantitySold',
      'margin',
      'wonDeals',
      'geoAnalytics',
      'employeePerformance',
      'performanceAnalytics',
      'leaderboard',
      'salesTrend',
      'recentActivity',
    ],
  },
  {
    id: 'everything',
    label: 'Everything',
    description: 'Every widget available to your role, switched on.',
    icon: LayoutGrid,
    accent: '#16A34A',
    widgets: [],
  },
];

/** `everything` is expressed as "all available", resolved per role at runtime. */
export function presetWidgets(
  preset: DashboardPreset,
  availableIds: WidgetId[],
): WidgetId[] {
  if (preset.id === 'everything') return availableIds;
  return preset.widgets.filter((id) => availableIds.includes(id));
}

/**
 * Which preset (if any) the current selection matches exactly — so the gallery
 * can show an active state rather than leaving every card looking unselected.
 */
export function matchPreset(
  visibleIds: WidgetId[],
  availableIds: WidgetId[],
): string | null {
  const current = [...visibleIds].sort().join(',');
  for (const p of PRESETS) {
    const target = [...presetWidgets(p, availableIds)].sort().join(',');
    if (target === current) return p.id;
  }
  return null;
}

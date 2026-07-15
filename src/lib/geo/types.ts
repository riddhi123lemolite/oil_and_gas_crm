// ============================================================================
// Shared types for the Geographic Analytics module.
//
// These describe the shape returned by the analytics service. The mock
// service (analyticsService.ts) derives them from the local data store, but a
// real backend can return the exact same structures so the UI never changes.
// ============================================================================

import type { CustomerSegment, InvoiceStatus, ItemCategory } from '@/types';
import type { Region } from './regions';

/** The seven CRM measures the map can colour by. */
export type GeoMetricKey =
  | 'revenue'
  | 'oil'
  | 'gas'
  | 'clients'
  | 'projects'
  | 'pendingOrders'
  | 'consumption';

export type DateRangeKey = 'all' | '30d' | 'quarter' | 'fy' | '12m';

export interface GeoFilters {
  dateRange: DateRangeKey;
  region: Region | 'all';
  salesExecId: string | 'all';
  businessUnit: string | 'all';
  productType: ItemCategory | 'all';
  customerType: CustomerSegment | 'all';
}

export const DEFAULT_GEO_FILTERS: GeoFilters = {
  dateRange: 'all',
  region: 'all',
  salesExecId: 'all',
  businessUnit: 'all',
  productType: 'all',
  customerType: 'all',
};

/** Headline numbers for a single state — one row of the choropleth. */
export interface StateAnalytics {
  state: string;
  region: Region | undefined;
  revenue: number;
  /** Oil-stream distribution, in litres. */
  oil: number;
  /** Gas / petrochemical-stream distribution, in litres. */
  gas: number;
  clients: number;
  projects: number;
  pendingOrders: number;
  /** Total distributed volume, in litres. */
  consumption: number;
  /** Period-over-period revenue growth, as a percentage. */
  growth: number;
}

export interface GeoTransaction {
  id: string;
  number: string;
  customer: string;
  amount: number;
  date: string;
  status: InvoiceStatus;
}

export interface GeoTopCustomer {
  id: string;
  name: string;
  revenue: number;
  segment: CustomerSegment;
}

export interface GeoTrendPoint {
  month: string;
  revenue: number;
}

export interface GeoCategorySlice {
  category: ItemCategory;
  value: number;
}

/** Everything the slide-in panel needs for one state. */
export interface StateDetail extends StateAnalytics {
  topCustomers: GeoTopCustomer[];
  recentTransactions: GeoTransaction[];
  salesTrend: GeoTrendPoint[];
  categoryBreakdown: GeoCategorySlice[];
}

export interface GeoAnalyticsResponse {
  states: Record<string, StateAnalytics>;
  generatedAt: string;
}

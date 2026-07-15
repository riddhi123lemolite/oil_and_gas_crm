// ============================================================================
// Types + status thresholds for the Employee Performance module.
// ============================================================================

import type { BadgeTone } from '@/lib/constants';
import type { Role } from '@/types';

export type PerformanceStatus =
  | 'EXCELLENT'
  | 'ON_TRACK'
  | 'NEEDS_ATTENTION'
  | 'CRITICAL';

export interface StatusMeta {
  label: string;
  tone: BadgeTone;
  /** Palette hue used for rings / gradients. */
  color: string;
  emoji: string;
  min: number;
}

/** Ordered high→low so `statusFor` can pick the first threshold met. */
export const STATUS_META: Record<PerformanceStatus, StatusMeta> = {
  EXCELLENT: { label: 'Excellent', tone: 'success', color: '#16A34A', emoji: '🟢', min: 100 },
  ON_TRACK: { label: 'On Track', tone: 'info', color: '#2563EB', emoji: '🟢', min: 80 },
  NEEDS_ATTENTION: { label: 'Needs Attention', tone: 'warm', color: '#D97706', emoji: '🟡', min: 50 },
  CRITICAL: { label: 'Critical', tone: 'danger', color: '#DC2626', emoji: '🔴', min: 0 },
};

export function statusFor(pct: number): PerformanceStatus {
  if (pct >= 100) return 'EXCELLENT';
  if (pct >= 80) return 'ON_TRACK';
  if (pct >= 50) return 'NEEDS_ATTENTION';
  return 'CRITICAL';
}

export interface EmployeePerformance {
  id: string;
  name: string;
  role: Role;
  roleLabel: string;
  /** Dynamic monthly target (₹). */
  target: number;
  /** Achieved this month (₹). */
  achieved: number;
  /** target − achieved, floored at 0. */
  remaining: number;
  /** achieved / target, as a percentage. */
  pct: number;
  status: PerformanceStatus;
  rank: number;
}

export interface DepartmentPerformance {
  role: Role;
  roleLabel: string;
  headcount: number;
  target: number;
  achieved: number;
  pct: number;
}

export interface MonthlyPoint {
  month: string;
  achieved: number;
  target: number;
}

export interface TeamPerformance {
  employees: EmployeePerformance[];
  departments: DepartmentPerformance[];
  monthly: MonthlyPoint[];
  totalTarget: number;
  totalAchieved: number;
  teamPct: number;
  topPerformer?: EmployeePerformance;
}

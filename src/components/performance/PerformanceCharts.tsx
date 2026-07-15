import { useMemo, useState } from 'react';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarChart } from '@/components/charts/BarChart';
import { SelectField } from '@/components/forms/SelectField';
import { PerformanceRing } from './PerformanceRing';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { formatKL } from '@/lib/format';
import { statusFor, STATUS_META, type TeamPerformance } from '@/lib/performance/types';
import {
  buildPerformanceTrend,
  performanceMonths,
  GRANULARITY_OPTIONS,
  type Granularity,
  type PerformanceInput,
} from '@/lib/performance/service';

interface PerformanceChartsProps {
  team: TeamPerformance;
  input: PerformanceInput;
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div>
      <h3 className="font-display text-sm font-semibold text-content">{title}</h3>
      {subtitle && <p className="text-xs text-content-muted">{subtitle}</p>}
    </div>
  );
}

export function PerformanceCharts({ team, input }: PerformanceChartsProps) {
  const teamMeta = STATUS_META[statusFor(team.teamPct)];
  const deptData = team.departments.map((d) => ({
    role: d.roleLabel,
    achieved: d.achieved,
  }));

  const months = useMemo(() => performanceMonths(), []);
  const [granularity, setGranularity] = useState<Granularity>('monthly');
  const [monthKey, setMonthKey] = useState(
    () => months[months.length - 1]?.value ?? '',
  );
  const monthPickerDisabled = granularity === 'monthly' || granularity === 'annually';
  const monthLabel = months.find((m) => m.value === monthKey)?.label ?? '';

  const trend = useMemo(
    () =>
      buildPerformanceTrend(input, {
        granularity,
        monthKey,
        monthlyTarget: team.totalTarget,
      }),
    [input, granularity, monthKey, team.totalTarget],
  );

  const granularityLabel =
    GRANULARITY_OPTIONS.find((g) => g.value === granularity)?.label ?? 'Monthly';
  const scopeLabel = monthPickerDisabled
    ? granularity === 'annually'
      ? 'all years'
      : 'trailing 12 months'
    : monthLabel;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard className="p-4 lg:col-span-2">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <CardTitle
            title={`${granularityLabel} Target vs Achievement`}
            subtitle={`Team volume (KL) vs target · ${scopeLabel}`}
          />
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-32">
              <SelectField
                value={granularity}
                onChange={(v) => setGranularity(v as Granularity)}
                options={GRANULARITY_OPTIONS}
              />
            </div>
            <div className="w-32">
              <SelectField
                value={monthKey}
                onChange={setMonthKey}
                options={months}
                disabled={monthPickerDisabled}
                placeholder="Month"
              />
            </div>
          </div>
        </div>
        <TrendChart
          height={240}
          data={trend as unknown as Record<string, string | number>[]}
          xKey="label"
          valueFormatter={formatKL}
          series={[
            { key: 'achieved', name: 'Achieved', color: '#16A34A' },
            { key: 'target', name: 'Target', color: '#E87722' },
          ]}
        />
      </GlassCard>

      <GlassCard className="flex flex-col items-center justify-center gap-3 p-4">
        <CardTitle title="Team Achievement" />
        <PerformanceRing pct={team.teamPct} color={teamMeta.color} size={150} stroke={12} label="of target" />
        <div className="w-full space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-content-muted">Achieved</span>
            <AnimatedCounter
              value={team.totalAchieved}
              format={formatKL}
              className="font-semibold text-content"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-content-muted">Target</span>
            <span className="num font-semibold text-content">
              {formatKL(team.totalTarget)}
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 lg:col-span-3">
        <CardTitle title="Department Performance" subtitle="Monthly achievement by team" />
        <div className="mt-3">
          <BarChart
            height={220}
            data={deptData}
            xKey="role"
            barKey="achieved"
            barName="Achieved"
            color="#0F3D5C"
            valueFormatter={formatKL}
          />
        </div>
      </GlassCard>
    </div>
  );
}

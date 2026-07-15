import { GlassCard } from '@/components/dashboard/GlassCard';
import { TrendChart } from '@/components/charts/TrendChart';
import { BarChart } from '@/components/charts/BarChart';
import { PerformanceRing } from './PerformanceRing';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { formatINRCompact } from '@/lib/format';
import { statusFor, STATUS_META, type TeamPerformance } from '@/lib/performance/types';

interface PerformanceChartsProps {
  team: TeamPerformance;
}

function CardTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-3">
      <h3 className="font-display text-sm font-semibold text-content">{title}</h3>
      {subtitle && <p className="text-xs text-content-muted">{subtitle}</p>}
    </div>
  );
}

export function PerformanceCharts({ team }: PerformanceChartsProps) {
  const teamMeta = STATUS_META[statusFor(team.teamPct)];
  const deptData = team.departments.map((d) => ({
    role: d.roleLabel,
    achieved: d.achieved,
  }));

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <GlassCard className="p-4 lg:col-span-2">
        <CardTitle
          title="Monthly Target vs Achievement"
          subtitle="Team revenue by month against the combined monthly target"
        />
        <TrendChart
          height={240}
          data={team.monthly as unknown as Record<string, string | number>[]}
          xKey="month"
          valueFormatter={formatINRCompact}
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
              format={formatINRCompact}
              className="font-semibold text-content"
            />
          </div>
          <div className="flex justify-between">
            <span className="text-content-muted">Target</span>
            <span className="num font-semibold text-content">
              {formatINRCompact(team.totalTarget)}
            </span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-4 lg:col-span-3">
        <CardTitle title="Department Performance" subtitle="Monthly achievement by team" />
        <BarChart
          height={220}
          data={deptData}
          xKey="role"
          barKey="achieved"
          barName="Achieved"
          color="#0F3D5C"
          valueFormatter={formatINRCompact}
        />
      </GlassCard>
    </div>
  );
}

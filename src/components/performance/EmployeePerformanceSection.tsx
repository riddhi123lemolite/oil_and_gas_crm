import { motion } from 'framer-motion';
import { Trophy, Target, Users, Gauge } from 'lucide-react';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { EmployeePerformanceCard } from './EmployeePerformanceCard';
import { formatINRCompact } from '@/lib/format';
import { statusFor, STATUS_META, type TeamPerformance } from '@/lib/performance/types';

interface EmployeePerformanceSectionProps {
  team: TeamPerformance;
}

function HeadStat({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Users;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-2.5 rounded-lg border border-line/60 bg-base/50 p-3">
      <span
        className="flex size-9 items-center justify-center rounded-lg"
        style={{ backgroundColor: `${accent}1f`, color: accent }}
      >
        <Icon className="size-4" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-medium uppercase tracking-wide text-content-muted">
          {label}
        </div>
        <div className="num truncate text-lg font-bold text-content">{value}</div>
      </div>
    </div>
  );
}

export function EmployeePerformanceSection({ team }: EmployeePerformanceSectionProps) {
  const teamMeta = STATUS_META[statusFor(team.teamPct)];

  return (
    <div className="space-y-4">
      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <HeadStat
          icon={Gauge}
          label="Team Achievement"
          value={<AnimatedCounter value={team.teamPct} format={(n) => `${n.toFixed(1)}%`} />}
          accent={teamMeta.color}
        />
        <HeadStat
          icon={Target}
          label="Achieved (Monthly)"
          value={<AnimatedCounter value={team.totalAchieved} format={formatINRCompact} />}
          accent="#16A34A"
        />
        <HeadStat
          icon={Trophy}
          label="Top Performer"
          value={team.topPerformer?.name ?? '—'}
          accent="#F59E0B"
        />
        <HeadStat
          icon={Users}
          label="Employees Tracked"
          value={<AnimatedCounter value={team.employees.length} />}
          accent="#0F3D5C"
        />
      </div>

      {/* Employee cards */}
      {team.employees.length > 0 ? (
        <motion.div
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
          variants={{ show: { transition: { staggerChildren: 0.04 } } }}
          initial="hidden"
          animate="show"
        >
          {team.employees.map((e) => (
            <EmployeePerformanceCard key={e.id} employee={e} />
          ))}
        </motion.div>
      ) : (
        <GlassCard className="p-8 text-center text-sm text-content-muted">
          No employee performance data available.
        </GlassCard>
      )}
    </div>
  );
}

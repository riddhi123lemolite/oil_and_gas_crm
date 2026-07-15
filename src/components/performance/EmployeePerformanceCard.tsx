import { motion } from 'framer-motion';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { GlassCard } from '@/components/dashboard/GlassCard';
import { PerformanceRing } from './PerformanceRing';
import { AnimatedCounter } from '@/components/dashboard/AnimatedCounter';
import { formatKL } from '@/lib/format';
import { STATUS_META, type EmployeePerformance } from '@/lib/performance/types';

interface EmployeePerformanceCardProps {
  employee: EmployeePerformance;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-content-muted">{label}</span>
      <span className="num font-semibold text-content">{value}</span>
    </div>
  );
}

export function EmployeePerformanceCard({ employee }: EmployeePerformanceCardProps) {
  const meta = STATUS_META[employee.status];
  const barWidth = Math.max(3, Math.min(100, employee.pct));

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0 },
      }}
      whileHover={{ y: -3 }}
      transition={{ type: 'spring', stiffness: 300, damping: 26 }}
    >
      <GlassCard className="h-full p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2.5">
            <EntityAvatar name={employee.name} size="sm" />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold text-content">
                {employee.name}
              </div>
              <div className="text-xs text-content-muted">{employee.roleLabel}</div>
            </div>
          </div>
          <StatusBadge def={{ label: meta.label, tone: meta.tone }} size="sm" />
        </div>

        <div className="mt-3 flex items-center gap-4">
          <PerformanceRing pct={employee.pct} color={meta.color} size={88} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <Stat label="Target" value={formatKL(employee.target)} />
            <Stat label="Achieved" value={formatKL(employee.achieved)} />
            <Stat label="Remaining" value={formatKL(employee.remaining)} />
          </div>
        </div>

        {/* Gradient progress bar */}
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: `linear-gradient(90deg, ${meta.color}99, ${meta.color})`,
              }}
              initial={{ width: 0 }}
              animate={{ width: `${barWidth}%` }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-content-muted">Completion</span>
            <AnimatedCounter
              value={employee.pct}
              format={(n) => `${n.toFixed(1)}%`}
              className="font-semibold text-content"
            />
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

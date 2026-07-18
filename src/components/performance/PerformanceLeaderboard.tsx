import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatKL } from '@/lib/format';
import { cn } from '@/lib/utils';
import { STATUS_META, type EmployeePerformance } from '@/lib/performance/types';

interface PerformanceLeaderboardProps {
  employees: EmployeePerformance[];
}

const MEDAL = ['#F59E0B', '#94A3B8', '#B45309']; // gold, silver, bronze

export function PerformanceLeaderboard({ employees }: PerformanceLeaderboardProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-content-muted">
            <th className="py-2 pl-1 pr-2">Rank</th>
            <th className="py-2 pr-2">Employee</th>
            <th className="py-2 pr-2">Role</th>
            <th className="py-2 pr-2 text-right">Achievement %</th>
            <th className="py-2 pr-2 text-right">Target</th>
            <th className="py-2 pr-1 text-right">Achieved</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((e, i) => {
            const meta = STATUS_META[e.status];
            const medal = MEDAL[e.rank - 1];
            return (
              <motion.tr
                key={e.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3), duration: 0.25 }}
                className="glass-line border-b last:border-0 hover:bg-muted"
              >
                <td className="py-2 pl-1 pr-2">
                  <span
                    className={cn(
                      'num inline-flex size-6 items-center justify-center rounded-full text-xs font-bold',
                      medal ? 'text-white' : 'text-content-muted',
                    )}
                    style={medal ? { backgroundColor: medal } : undefined}
                  >
                    {e.rank <= 3 ? <Trophy className="size-3.5" /> : e.rank}
                  </span>
                </td>
                <td className="py-2 pr-2">
                  <div className="flex items-center gap-2">
                    <EntityAvatar name={e.name} size="xs" />
                    <span className="truncate font-medium text-content">{e.name}</span>
                  </div>
                </td>
                <td className="py-2 pr-2 text-content-secondary">{e.roleLabel}</td>
                <td className="py-2 pr-2 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="hidden h-1.5 w-20 overflow-hidden rounded-full bg-muted sm:block">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, e.pct)}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                    <span className="num w-14 font-semibold text-content">
                      {e.pct.toFixed(1)}%
                    </span>
                    <StatusBadge def={{ label: meta.label, tone: meta.tone }} size="sm" />
                  </div>
                </td>
                <td className="num py-2 pr-2 text-right text-content-secondary">
                  {formatKL(e.target)}
                </td>
                <td className="num py-2 pr-1 text-right font-semibold text-content">
                  {formatKL(e.achieved)}
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

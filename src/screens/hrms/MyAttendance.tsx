import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, Clock, LogIn, LogOut, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { generateId } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import {
  ATTENDANCE_STATUS_LABEL,
  ATTENDANCE_STATUS_TONE,
  FULL_DAY_HOURS,
  dayKey,
  dayLabel,
  findRecord,
  formatClock,
  formatDuration,
  isOnClock,
  recentDayKeys,
  statusForHours,
  workedMs,
} from '@/lib/attendance';
import type { AttendanceRecord } from '@/types';

export default function MyAttendance() {
  const { user, can } = useAuth();
  const attendance = useDataStore((s) => s.attendance);
  const add = useDataStore((s) => s.add);
  const update = useDataStore((s) => s.update);

  const today = dayKey();
  const mine = useMemo(
    () => attendance.filter((r) => r.userId === user?.id),
    [attendance, user?.id],
  );
  const todayRec = user ? findRecord(mine, user.id, today) : undefined;
  const onClock = isOnClock(todayRec);

  // Ticks the live timer while checked in. Stopped otherwise, so an idle
  // screen isn't re-rendering once a second for nothing.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!onClock) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [onClock]);

  const worked = workedMs(todayRec, now);

  function handleCheckIn() {
    if (!user || todayRec) return;
    const stamp = new Date().toISOString();
    const rec: AttendanceRecord = {
      id: generateId('att'),
      userId: user.id,
      date: today,
      checkInAt: stamp,
      status: 'PRESENT',
      createdAt: stamp,
      updatedAt: stamp,
    };
    // The record itself is the audit trail (stamped, immutable in practice).
    // Deliberately not written to `activities` — a check-in per person per day
    // would swamp the dashboard's Recent Activity feed.
    add('attendance', rec);
    toast.success(`Checked in at ${formatClock(stamp)}`);
  }

  function handleCheckOut() {
    if (!user || !todayRec?.checkInAt || todayRec.checkOutAt) return;
    const stamp = new Date().toISOString();
    const total = workedMs({ ...todayRec, checkOutAt: stamp });
    update('attendance', todayRec.id, {
      checkOutAt: stamp,
      status: statusForHours(total),
      updatedAt: stamp,
    });
    toast.success(`Checked out · ${formatDuration(total)} today`);
  }

  // Last 14 days, so the employee can see their own recent pattern.
  const history = useMemo(() => {
    const keys = recentDayKeys(14);
    return keys.map((k) => ({
      key: k,
      rec: user ? findRecord(mine, user.id, k) : undefined,
    }));
  }, [mine, user]);

  const monthPrefix = today.slice(0, 7);
  const monthRecs = mine.filter((r) => r.date.startsWith(monthPrefix));
  const daysPresent = monthRecs.filter(
    (r) => r.status === 'PRESENT' || r.status === 'HALF_DAY',
  ).length;
  const monthMs = monthRecs.reduce((s, r) => s + workedMs(r, now), 0);
  const avgMs = monthRecs.length > 0 ? monthMs / monthRecs.length : 0;

  if (!user) return null;

  // Routes in this app aren't role-gated, so the screen enforces its own
  // permission — otherwise a customer could reach it by typing the URL.
  if (!can('hrms', 'view')) {
    return (
      <EmptyState
        icon={CalendarClock}
        title="Not available for your account"
        description="Attendance check-in is for staff accounts only."
      />
    );
  }

  const pct = Math.min(100, (worked / (FULL_DAY_HOURS * 3_600_000)) * 100);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Attendance"
        description="Check in when you start, check out when you finish. Your admin sees this live."
        icon={<CalendarClock />}
      />

      {/* ── Today ─────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Today · {dayLabel(today)}</CardTitle>
          <span className="text-xs text-content-muted">
            {user.name} · {ROLE_LABELS[user.role]}
          </span>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={
                    onClock
                      ? 'relative flex size-2.5 items-center justify-center'
                      : 'hidden'
                  }
                >
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2.5 rounded-full bg-success" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-content-muted">
                  {onClock
                    ? 'On the clock'
                    : todayRec?.checkOutAt
                      ? 'Day complete'
                      : 'Not checked in'}
                </span>
              </div>
              <p className="num mt-1 text-4xl font-bold tabular-nums text-content">
                {formatDuration(worked)}
              </p>
              <div className="mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary transition-[width] duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1.5 text-xs text-content-muted">
                of a {FULL_DAY_HOURS}-hour day
              </p>
            </div>

            <div className="flex gap-2">
              {!todayRec && (
                <Button size="lg" onClick={handleCheckIn}>
                  <LogIn /> Check in
                </Button>
              )}
              {onClock && (
                <Button size="lg" variant="danger" onClick={handleCheckOut}>
                  <LogOut /> Check out
                </Button>
              )}
              {todayRec?.checkOutAt && (
                <Badge tone={ATTENDANCE_STATUS_TONE[todayRec.status]}>
                  {ATTENDANCE_STATUS_LABEL[todayRec.status]}
                </Badge>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 border-t border-line pt-4">
            <TimeBox
              icon={<LogIn className="size-4 text-success" />}
              label="Check in"
              value={formatClock(todayRec?.checkInAt)}
            />
            <TimeBox
              icon={<LogOut className="size-4 text-content-muted" />}
              label="Check out"
              value={formatClock(todayRec?.checkOutAt)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ── This month ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Stat
          icon={<CalendarClock className="size-4" />}
          label="Days marked"
          value={String(daysPresent)}
        />
        <Stat
          icon={<Clock className="size-4" />}
          label="Hours this month"
          value={formatDuration(monthMs)}
        />
        <Stat
          icon={<TrendingUp className="size-4" />}
          label="Average per day"
          value={monthRecs.length ? formatDuration(avgMs) : '—'}
        />
      </div>

      {/* ── History ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Last 14 days</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {mine.length === 0 ? (
            <EmptyState
              icon={CalendarClock}
              title="No attendance yet"
              description="Check in above and your history starts building here."
              compact
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr className="text-left text-[11px] uppercase text-content-muted">
                    <th className="px-4 py-2.5">Day</th>
                    <th className="px-4 py-2.5">In</th>
                    <th className="px-4 py-2.5">Out</th>
                    <th className="px-4 py-2.5">Hours</th>
                    <th className="px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(({ key, rec }) => (
                    <tr key={key} className="border-b border-line last:border-0">
                      <td className="px-4 py-2.5 font-medium text-content">
                        {dayLabel(key)}
                      </td>
                      <td className="num px-4 py-2.5 text-content-secondary">
                        {formatClock(rec?.checkInAt)}
                      </td>
                      <td className="num px-4 py-2.5 text-content-secondary">
                        {formatClock(rec?.checkOutAt)}
                      </td>
                      <td className="num px-4 py-2.5 text-content-secondary">
                        {rec ? formatDuration(workedMs(rec, now)) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        {rec ? (
                          <Badge tone={ATTENDANCE_STATUS_TONE[rec.status]}>
                            {ATTENDANCE_STATUS_LABEL[rec.status]}
                          </Badge>
                        ) : (
                          <span className="text-xs text-content-muted">
                            No record
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TimeBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-line p-3">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-content-muted">
        {icon}
        {label}
      </div>
      <div className="num mt-1 text-lg font-semibold text-content">{value}</div>
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="card p-3.5">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-content-muted">
        {icon}
        {label}
      </div>
      <div className="num mt-1 text-2xl font-bold text-content">{value}</div>
    </div>
  );
}

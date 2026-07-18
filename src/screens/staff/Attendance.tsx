import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, LogIn, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { hashString } from '@/lib/utils';
import { ROLE_LABELS } from '@/lib/constants';
import {
  ATTENDANCE_STATUS_LABEL,
  ATTENDANCE_STATUS_TONE,
  dayKey,
  findRecord,
  formatClock,
  formatDuration,
  isOnClock,
  workedMs,
} from '@/lib/attendance';

// Demo baseline for staff who have never used the check-in screen, so the log
// still reads as a full team rather than a near-empty table. Anyone who has
// actually checked in overrides this with their real times.
const STATUSES = ['Present', 'Present', 'Present', 'On Leave', 'Half Day'];
const CHECK_INS = ['09:05 AM', '09:12 AM', '08:58 AM', '09:25 AM', '09:40 AM'];
const CHECK_OUTS = ['06:15 PM', '06:30 PM', '07:05 PM', '—', '02:00 PM'];

export default function Attendance() {
  const users = useDataStore((s) => s.users);
  const attendance = useDataStore((s) => s.attendance);
  const today = dayKey();

  // Keeps the live "on the clock" durations moving without a refresh.
  const [now, setNow] = useState(() => Date.now());
  const anyOnClock = attendance.some(
    (r) => r.date === today && isOnClock(r),
  );
  useEffect(() => {
    if (!anyOnClock) return;
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, [anyOnClock]);

  const rows = useMemo(
    () =>
      users.map((u) => {
        const rec = findRecord(attendance, u.id, today);
        if (rec) {
          return {
            user: u,
            live: isOnClock(rec),
            real: true,
            status: ATTENDANCE_STATUS_LABEL[rec.status],
            tone: ATTENDANCE_STATUS_TONE[rec.status],
            checkIn: formatClock(rec.checkInAt),
            checkOut: formatClock(rec.checkOutAt),
            hours: formatDuration(workedMs(rec, now)),
          };
        }
        const h = hashString(u.id);
        const status = STATUSES[h % STATUSES.length] ?? 'Present';
        return {
          user: u,
          live: false,
          real: false,
          status,
          tone:
            status === 'Present'
              ? ('success' as const)
              : status === 'On Leave'
                ? ('warm' as const)
                : ('info' as const),
          checkIn: CHECK_INS[h % CHECK_INS.length] ?? '09:00 AM',
          checkOut: CHECK_OUTS[h % CHECK_OUTS.length] ?? '06:00 PM',
          hours: '—',
        };
      }),
    [users, attendance, today, now],
  );

  // Real check-ins first — the people actually working today lead the list.
  const sorted = useMemo(
    () =>
      [...rows].sort((a, b) => {
        if (a.live !== b.live) return a.live ? -1 : 1;
        if (a.real !== b.real) return a.real ? -1 : 1;
        return a.user.name.localeCompare(b.user.name);
      }),
    [rows],
  );

  const present = rows.filter((r) => r.status === 'Present').length;
  const onLeave = rows.filter((r) => r.status === 'On Leave').length;
  const liveCount = rows.filter((r) => r.live).length;
  const checkedInToday = rows.filter((r) => r.real).length;

  const leaveRequests = rows
    .filter((r) => r.status === 'On Leave')
    .slice(0, 5);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Attendance & Leaves"
        description="Today's attendance across the team"
        icon={<CalendarClock />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="On the clock" value={liveCount} good live={liveCount > 0} />
        <Stat label="Present" value={present} good />
        <Stat label="On Leave" value={onLeave} />
        <Stat label="Total Staff" value={rows.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance Log</CardTitle>
          <span className="text-xs text-content-muted">
            {checkedInToday > 0
              ? `${checkedInToday} checked in via My Attendance`
              : 'No live check-ins yet today'}
          </span>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left text-[11px] uppercase text-content-muted">
                <th className="px-4 py-2.5">Employee</th>
                <th className="px-4 py-2.5">Check In</th>
                <th className="px-4 py-2.5">Check Out</th>
                <th className="px-4 py-2.5">Hours</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.user.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <EntityAvatar name={r.user.name} size="xs" />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate font-medium text-content">
                            {r.user.name}
                          </span>
                          {r.live && (
                            <span
                              className="relative flex size-2 shrink-0 items-center justify-center"
                              title="Currently checked in"
                            >
                              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                              <span className="relative inline-flex size-2 rounded-full bg-success" />
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-content-muted">
                          {ROLE_LABELS[r.user.role]}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="num px-4 py-2.5 text-content-secondary">
                    <span className="flex items-center gap-1.5">
                      <LogIn className="size-3.5 text-success" />
                      {r.checkIn}
                    </span>
                  </td>
                  <td className="num px-4 py-2.5 text-content-secondary">
                    <span className="flex items-center gap-1.5">
                      <LogOut className="size-3.5 text-content-muted" />
                      {r.checkOut}
                    </span>
                  </td>
                  <td className="num px-4 py-2.5 text-content-secondary">
                    {r.hours}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge tone={r.tone}>{r.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Leave Requests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {leaveRequests.length === 0 ? (
            <p className="py-3 text-center text-sm text-content-muted">
              No pending leave requests.
            </p>
          ) : (
            leaveRequests.map((r) => (
              <div
                key={r.user.id}
                className="flex items-center gap-3 rounded-md border border-line p-2.5"
              >
                <EntityAvatar name={r.user.name} size="sm" />
                <div>
                  <div className="text-sm font-medium text-content">
                    {r.user.name}
                  </div>
                  <div className="text-xs text-content-muted">
                    Casual Leave · 1 day
                  </div>
                </div>
                <Badge tone="warm" className="ml-auto">
                  Pending
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  good,
  live,
}: {
  label: string;
  value: number;
  good?: boolean;
  live?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-content-muted">
        {live && (
          <span className="relative flex size-2 items-center justify-center">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-success" />
          </span>
        )}
        {label}
      </div>
      <div
        className={`num mt-1 text-2xl font-bold ${good ? 'text-success' : 'text-content'}`}
      >
        {value}
      </div>
    </div>
  );
}

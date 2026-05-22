import { useMemo } from 'react';
import { CalendarClock, LogIn, LogOut } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { hashString } from '@/lib/utils';

const STATUSES = ['Present', 'Present', 'Present', 'On Leave', 'Half Day'];
const CHECK_INS = ['09:05 AM', '09:12 AM', '08:58 AM', '09:25 AM', '09:40 AM'];
const CHECK_OUTS = ['06:15 PM', '06:30 PM', '07:05 PM', '—', '02:00 PM'];

export default function Attendance() {
  const users = useDataStore((s) => s.users);

  const rows = useMemo(
    () =>
      users.map((u) => {
        const h = hashString(u.id);
        return {
          user: u,
          status: STATUSES[h % STATUSES.length] ?? 'Present',
          checkIn: CHECK_INS[h % CHECK_INS.length] ?? '09:00 AM',
          checkOut: CHECK_OUTS[h % CHECK_OUTS.length] ?? '06:00 PM',
        };
      }),
    [users],
  );

  const present = rows.filter((r) => r.status === 'Present').length;
  const onLeave = rows.filter((r) => r.status === 'On Leave').length;

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

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Present" value={present} good />
        <Stat label="On Leave" value={onLeave} />
        <Stat label="Total Staff" value={rows.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance Log</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr className="text-left text-[11px] uppercase text-content-muted">
                <th className="px-4 py-2.5">Employee</th>
                <th className="px-4 py-2.5">Check In</th>
                <th className="px-4 py-2.5">Check Out</th>
                <th className="px-4 py-2.5">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.user.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <EntityAvatar name={r.user.name} size="xs" />
                      <span className="font-medium text-content">
                        {r.user.name}
                      </span>
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
                  <td className="px-4 py-2.5">
                    <Badge
                      tone={
                        r.status === 'Present'
                          ? 'success'
                          : r.status === 'On Leave'
                            ? 'warm'
                            : 'info'
                      }
                    >
                      {r.status}
                    </Badge>
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
}: {
  label: string;
  value: number;
  good?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="text-xs uppercase tracking-wide text-content-muted">
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

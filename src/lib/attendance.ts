import type { AttendanceRecord, AttendanceStatus } from '@/types';

// ---------------------------------------------------------------------------
// Attendance rules. Kept here rather than in the screens so the employee's
// check-in view and the admin's Attendance log always agree on what a day
// means, how long it lasted, and what to call it.
// ---------------------------------------------------------------------------

/** A full day's work, in hours — anything less is a half day. */
export const FULL_DAY_HOURS = 8;
export const HALF_DAY_HOURS = 4;

/**
 * Local calendar day as YYYY-MM-DD. Built from the local date parts rather
 * than toISOString(), which would shift the day across the UTC boundary — a
 * 9am check-in in IST would otherwise land on the previous date.
 */
export function dayKey(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** The record for one user on one day, if any. */
export function findRecord(
  records: AttendanceRecord[],
  userId: string,
  date: string,
): AttendanceRecord | undefined {
  return records.find((r) => r.userId === userId && r.date === date);
}

/** Milliseconds worked. Counts up live while still checked in. */
export function workedMs(rec: AttendanceRecord | undefined, now = Date.now()): number {
  if (!rec?.checkInAt) return 0;
  const start = new Date(rec.checkInAt).getTime();
  const end = rec.checkOutAt ? new Date(rec.checkOutAt).getTime() : now;
  return Math.max(0, end - start);
}

/** "7h 24m" / "48m". */
export function formatDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${String(m).padStart(2, '0')}m`;
}

/** "09:14 AM" — the format the attendance log already used. */
export function formatClock(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Status from hours worked. Applied on check-out; a day still in progress
 * stays PRESENT so the live log doesn't flicker between half and full day.
 */
export function statusForHours(ms: number): AttendanceStatus {
  const hours = ms / 3_600_000;
  if (hours >= HALF_DAY_HOURS) return 'PRESENT';
  return 'HALF_DAY';
}

export const ATTENDANCE_STATUS_LABEL: Record<AttendanceStatus, string> = {
  PRESENT: 'Present',
  HALF_DAY: 'Half Day',
  ON_LEAVE: 'On Leave',
  ABSENT: 'Absent',
};

export const ATTENDANCE_STATUS_TONE: Record<
  AttendanceStatus,
  'success' | 'info' | 'warm' | 'neutral'
> = {
  PRESENT: 'success',
  HALF_DAY: 'info',
  ON_LEAVE: 'warm',
  ABSENT: 'neutral',
};

/** Currently checked in — has an in-time and no out-time. */
export function isOnClock(rec: AttendanceRecord | undefined): boolean {
  return Boolean(rec?.checkInAt && !rec.checkOutAt);
}

/** The last `days` calendar keys, newest first. */
export function recentDayKeys(days: number, from: Date = new Date()): string[] {
  const out: string[] = [];
  for (let i = 0; i < days; i += 1) {
    const d = new Date(from);
    d.setDate(d.getDate() - i);
    out.push(dayKey(d));
  }
  return out;
}

/** Friendly day label: "Today", "Yesterday", else "Mon, 12 Aug". */
export function dayLabel(key: string, from: Date = new Date()): string {
  if (key === dayKey(from)) return 'Today';
  const y = new Date(from);
  y.setDate(y.getDate() - 1);
  if (key === dayKey(y)) return 'Yesterday';
  const parts = key.split('-').map(Number);
  const [yy, mm, dd] = parts;
  if (yy === undefined || mm === undefined || dd === undefined) return key;
  return new Date(yy, mm - 1, dd).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

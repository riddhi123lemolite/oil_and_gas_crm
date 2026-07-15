import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Calendar() {
  const navigate = useNavigate();
  const tasks = useDataStore((s) => s.tasks);
  const dispatches = useDataStore((s) => s.dispatches);
  const [month, setMonth] = useState(new Date('2026-06-01'));

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const eventsForDay = (day: Date) => {
    const taskEvents = tasks
      .filter((t) => t.dueDate && isSameDay(parseISO(t.dueDate), day))
      .map((t) => ({
        id: t.id,
        label: t.title,
        color: '#2563EB',
        kind: 'task' as const,
      }));
    const dispatchEvents = dispatches
      .filter((d) => isSameDay(parseISO(d.scheduledAt), day))
      .map((d) => ({
        id: d.id,
        label: `Dispatch ${d.number}`,
        color: '#E87722',
        kind: 'dispatch' as const,
      }));
    return [...taskEvents, ...dispatchEvents];
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Calendar"
        description="Tasks, dispatches and meetings at a glance"
        icon={<CalendarDays />}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth((m) => addMonths(m, -1))}
            >
              <ChevronLeft />
            </Button>
            <span className="w-36 text-center font-display text-sm font-semibold">
              {format(month, 'MMMM yyyy')}
            </span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight />
            </Button>
          </div>
        }
      />

      <div className="flex items-center gap-4 text-xs text-content-muted">
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-info" /> Tasks
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm bg-brand-secondary" /> Dispatches
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-7 border-b border-line">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="px-2 py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-content-muted"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const events = eventsForDay(day);
              const inMonth = isSameMonth(day, month);
              const isToday = isSameDay(day, new Date('2026-06-30'));
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    'min-h-[96px] border-b border-r border-line p-1.5',
                    !inMonth && 'bg-muted',
                  )}
                >
                  <div
                    className={cn(
                      'mb-1 flex size-6 items-center justify-center rounded-full text-xs font-medium',
                      isToday
                        ? 'bg-brand-secondary text-white'
                        : inMonth
                          ? 'text-content-secondary'
                          : 'text-content-muted',
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map((e) => (
                      <button
                        key={e.id}
                        onClick={() =>
                          navigate(
                            e.kind === 'task'
                              ? `/tasks/${e.id}/edit`
                              : '/dispatch',
                          )
                        }
                        className="block w-full truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium text-white"
                        style={{ backgroundColor: e.color }}
                      >
                        {e.label}
                      </button>
                    ))}
                    {events.length > 3 && (
                      <div className="px-1 text-[10px] text-content-muted">
                        +{events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

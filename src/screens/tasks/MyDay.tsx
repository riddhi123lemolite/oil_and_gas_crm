import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Phone, Users, Mail, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { PRIORITY } from '@/lib/constants';
import { formatDateLong } from '@/lib/format';
import type { Task } from '@/types';

const TYPE_ICON: Record<string, typeof Phone> = {
  CALL: Phone,
  MEETING: Users,
  EMAIL: Mail,
  FOLLOW_UP: Clock,
  OTHER: Clock,
};

export default function MyDay() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const tasks = useDataStore((s) => s.tasks);
  const updateTask = useDataStore((s) => s.update);

  const myTasks = useMemo(
    () => tasks.filter((t) => t.assignedToId === user?.id),
    [tasks, user],
  );

  const pending = myTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
  );
  const completed = myTasks.filter((t) => t.status === 'COMPLETED');

  const byType = (type: string) => pending.filter((t) => t.type === type);

  const groups = [
    { type: 'CALL', label: 'Calls' },
    { type: 'MEETING', label: 'Meetings' },
    { type: 'FOLLOW_UP', label: 'Follow-ups' },
    { type: 'EMAIL', label: 'Emails' },
  ];

  const complete = (task: Task) => {
    updateTask('tasks', task.id, {
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
    });
    toast.success('Task completed');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Day"
        description={formatDateLong(new Date())}
        icon={<Sun />}
      />

      <div className="grid grid-cols-3 gap-3">
        <Stat label="Pending" value={pending.length} />
        <Stat label="Completed" value={completed.length} good />
        <Stat
          label="Urgent"
          value={pending.filter((t) => t.priority === 'URGENT').length}
          danger
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {groups.map((g) => {
          const list = byType(g.type);
          const Icon = TYPE_ICON[g.type] ?? Clock;
          return (
            <Card key={g.type}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon className="size-4 text-content-muted" />
                  {g.label}
                  <span className="num rounded-full bg-muted px-1.5 text-xs text-content-muted">
                    {list.length}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {list.length === 0 ? (
                  <p className="py-3 text-center text-xs text-content-muted">
                    Nothing scheduled.
                  </p>
                ) : (
                  list.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center gap-2 rounded-md border border-line p-2"
                    >
                      <button onClick={() => complete(t)}>
                        <CheckCircle2 className="size-5 text-content-muted hover:text-success" />
                      </button>
                      <span
                        className="flex-1 cursor-pointer truncate text-sm text-content-secondary"
                        onClick={() => navigate(`/tasks/${t.id}/edit`)}
                      >
                        {t.title}
                      </span>
                      <StatusBadge def={PRIORITY[t.priority]} size="sm" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {pending.length === 0 && (
        <EmptyState
          icon={CheckCircle2}
          title="You're all caught up!"
          description="No pending tasks for today. Time for a chai break."
          actionLabel="Add a Task"
          onAction={() => navigate('/tasks/new')}
        />
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  good,
  danger,
}: {
  label: string;
  value: number;
  good?: boolean;
  danger?: boolean;
}) {
  return (
    <div className="card p-3.5">
      <div className="text-xs uppercase tracking-wide text-content-muted">
        {label}
      </div>
      <div
        className={`num mt-1 text-2xl font-bold ${
          good ? 'text-success' : danger ? 'text-danger' : 'text-content'
        }`}
      >
        {value}
      </div>
    </div>
  );
}

import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Target,
  FileText,
  ReceiptIndianRupee,
  Truck,
  CheckSquare,
  Settings,
  CheckCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/shared/EmptyState';
import { useDataStore } from '@/stores/dataStore';
import { formatRelative } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { NotificationKind } from '@/types';

const ICONS: Record<NotificationKind, typeof Bell> = {
  LEAD: Target,
  PROPOSAL: FileText,
  INVOICE: ReceiptIndianRupee,
  DISPATCH: Truck,
  TASK: CheckSquare,
  SYSTEM: Settings,
};

export default function Notifications() {
  const navigate = useNavigate();
  const notifications = useDataStore((s) => s.notifications);
  const update = useDataStore((s) => s.update);

  const unread = notifications.filter((n) => !n.read).length;
  const sorted = [...notifications].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title="Notifications"
        description={`${unread} unread of ${notifications.length}`}
        icon={<Bell />}
        actions={
          unread > 0 && (
            <Button
              variant="outline"
              onClick={() =>
                notifications
                  .filter((n) => !n.read)
                  .forEach((n) =>
                    update('notifications', n.id, { read: true }),
                  )
              }
            >
              <CheckCheck className="size-4" /> Mark all read
            </Button>
          )
        }
      />

      {sorted.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" />
      ) : (
        <Card className="divide-y divide-line">
          {sorted.map((n) => {
            const Icon = ICONS[n.kind];
            return (
              <button
                key={n.id}
                onClick={() => {
                  update('notifications', n.id, { read: true });
                  if (n.link) navigate(n.link);
                }}
                className={cn(
                  'flex w-full items-start gap-3 p-4 text-left transition-colors hover:bg-muted',
                  !n.read && 'bg-brand-primary/[0.03]',
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
                  <Icon className="size-[18px]" strokeWidth={1.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-content">
                      {n.title}
                    </span>
                    {!n.read && (
                      <span className="size-2 rounded-full bg-brand-secondary" />
                    )}
                  </div>
                  <p className="text-sm text-content-secondary">{n.body}</p>
                  <p className="mt-0.5 text-xs text-content-muted">
                    {formatRelative(n.createdAt)}
                  </p>
                </div>
              </button>
            );
          })}
        </Card>
      )}
    </div>
  );
}

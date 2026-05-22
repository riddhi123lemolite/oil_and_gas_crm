import {
  Phone,
  Mail,
  Users,
  StickyNote,
  MessageCircle,
  RefreshCw,
  FileText,
  Wallet,
  Settings,
} from 'lucide-react';
import type { Activity, ActivityType } from '@/types';
import { useLookups } from '@/hooks/useLookups';
import { formatRelative } from '@/lib/format';
import { EmptyState } from './EmptyState';

const ICONS: Record<ActivityType, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: StickyNote,
  WHATSAPP: MessageCircle,
  STATUS_CHANGE: RefreshCw,
  PROPOSAL: FileText,
  PAYMENT: Wallet,
  SYSTEM: Settings,
};

const TONES: Record<ActivityType, string> = {
  CALL: 'text-info bg-info/10',
  EMAIL: 'text-brand-primary bg-brand-primary/10',
  MEETING: 'text-cat-glycol bg-cat-glycol/10',
  NOTE: 'text-warning bg-warning/10',
  WHATSAPP: 'text-success bg-success/10',
  STATUS_CHANGE: 'text-brand-secondary bg-brand-secondary/10',
  PROPOSAL: 'text-cat-solvent bg-cat-solvent/10',
  PAYMENT: 'text-success bg-success/10',
  SYSTEM: 'text-content-muted bg-muted',
};

export function ActivityTimeline({ activities }: { activities: Activity[] }) {
  const { userName } = useLookups();
  const sorted = [...activities].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );

  if (sorted.length === 0) {
    return (
      <EmptyState
        compact
        icon={StickyNote}
        title="No activity yet"
        description="Calls, emails and notes will appear here."
      />
    );
  }

  return (
    <div className="space-y-0">
      {sorted.map((activity, i) => {
        const Icon = ICONS[activity.type];
        return (
          <div key={activity.id} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${TONES[activity.type]}`}
              >
                <Icon className="size-4" strokeWidth={1.5} />
              </div>
              {i < sorted.length - 1 && (
                <div className="w-px flex-1 bg-line" />
              )}
            </div>
            <div className="pb-5">
              <p className="text-sm text-content">
                <span className="font-medium">
                  {userName(activity.userId)}
                </span>{' '}
                <span className="text-content-secondary">
                  {activity.title}
                </span>
              </p>
              {activity.description && (
                <p className="mt-0.5 text-xs text-content-muted">
                  {activity.description}
                </p>
              )}
              <p className="mt-0.5 text-[11px] text-content-muted">
                {formatRelative(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

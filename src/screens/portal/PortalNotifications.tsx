import { useState } from 'react';
import { Bell, Megaphone, PackagePlus, PackageMinus, Info, CheckCheck, X, Circle } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { formatRelative } from '@/lib/format';

const ANNOUNCEMENTS = [
  { id: 'a1', icon: PackagePlus, tone: '#00A878', title: 'New stock added — HSD (High Speed Diesel)', body: '2,00,000 L of HSD added at Kandla depot. Available for dispatch from tomorrow.', when: 'about 2 hours ago' },
  { id: 'a2', icon: PackageMinus, tone: '#DC2626', title: 'Low stock — Base Oil SN-500', body: 'Base Oil SN-500 is running low. Place orders early to avoid delays.', when: 'about 6 hours ago' },
  { id: 'a3', icon: Megaphone, tone: '#E87722', title: 'Revised price list effective Monday', body: 'Updated per-litre rates for MS & HSD take effect from Monday. Contact your account manager for the new slab.', when: 'about 1 day ago' },
  { id: 'a4', icon: Info, tone: '#2563EB', title: 'Holiday dispatch schedule', body: 'Dispatch will be limited on the upcoming public holiday. Plan pickups accordingly.', when: 'about 2 days ago' },
];

export default function PortalNotifications() {
  const notifications = useDataStore((s) => s.notifications);
  const update = useDataStore((s) => s.update);
  const remove = useDataStore((s) => s.remove);
  const [tab, setTab] = useState<'all' | 'unread'>('all');

  const feed = notifications.slice(0, 40);
  const shown = tab === 'unread' ? feed.filter((n) => !n.read) : feed;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => notifications.filter((n) => !n.read).forEach((n) => update('notifications', n.id, { read: true }));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Product, price and schedule updates — plus your account activity."
        icon={<Bell />}
      />

      {/* Announcements */}
      <div className="space-y-2.5">
        {ANNOUNCEMENTS.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="card flex items-start gap-3 p-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg" style={{ backgroundColor: `${a.tone}1a`, color: a.tone }}>
                <Icon className="size-4" />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-medium">{a.title}</span>
                  <span className="text-xs text-content-muted">{a.when}</span>
                </div>
                <p className="mt-0.5 text-sm text-content-secondary">{a.body}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Account activity feed */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <h3 className="font-display font-semibold">Account Activity</h3>
          <div className="ml-2 flex items-center gap-1">
            {(['all', 'unread'] as const).map((tk) => (
              <button
                key={tk}
                onClick={() => setTab(tk)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors ${
                  tab === tk ? 'bg-brand-secondary/10 text-brand-secondary' : 'text-content-secondary hover:bg-muted'
                }`}
              >
                {tk}
                {tk === 'unread' && unreadCount > 0 && <span className="ml-1 num">({unreadCount})</span>}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={markAllRead} disabled={unreadCount === 0}>
            <CheckCheck className="size-4" /> Mark all read
          </Button>
        </div>

        {shown.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-content-muted">You're all caught up.</div>
        ) : (
          <ul className="divide-y divide-line">
            {shown.map((n) => (
              <li key={n.id} className="group flex items-start gap-3 px-4 py-3">
                <button
                  onClick={() => update('notifications', n.id, { read: !n.read })}
                  className="mt-1 text-brand-secondary"
                  aria-label={n.read ? 'Mark unread' : 'Mark read'}
                >
                  {n.read ? <Circle className="size-2.5 text-content-muted" /> : <span className="block size-2.5 rounded-full bg-brand-secondary" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm ${n.read ? 'text-content-secondary' : 'font-medium text-content'}`}>{n.title}</div>
                  {n.body && <div className="text-xs text-content-muted">{n.body}</div>}
                  <div className="mt-0.5 text-[11px] text-content-muted">{formatRelative(n.createdAt)}</div>
                </div>
                <button
                  onClick={() => remove('notifications', n.id)}
                  className="rounded-md p-1.5 text-content-muted opacity-0 transition-opacity hover:bg-muted hover:text-danger group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <X className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import { Bell, Megaphone, PackagePlus, PackageMinus, Info } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { useDataStore } from '@/stores/dataStore';
import { formatRelative } from '@/lib/format';

// Customer-facing announcements (product add/subtract, price & schedule notices).
const ANNOUNCEMENTS = [
  { id: 'a1', icon: PackagePlus, tone: '#00A878', title: 'New stock added — HSD (High Speed Diesel)', body: '2,00,000 L of HSD added at Kandla depot. Available for dispatch from tomorrow.', when: 'about 2 hours ago' },
  { id: 'a2', icon: PackageMinus, tone: '#DC2626', title: 'Low stock — Base Oil SN-500', body: 'Base Oil SN-500 is running low. Place orders early to avoid delays.', when: 'about 6 hours ago' },
  { id: 'a3', icon: Megaphone, tone: '#E87722', title: 'Revised price list effective Monday', body: 'Updated per-litre rates for MS & HSD take effect from Monday. See your account manager for the new slab.', when: 'about 1 day ago' },
  { id: 'a4', icon: Info, tone: '#2563EB', title: 'Holiday dispatch schedule', body: 'Dispatch will be limited on the upcoming public holiday. Plan pickups accordingly.', when: 'about 2 days ago' },
];

export default function PortalNotifications() {
  const notifications = useDataStore((s) => s.notifications);
  const recent = notifications.slice(0, 12);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Announcements"
        description="Product, price and schedule updates you need to know about."
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

      {/* System notifications feed */}
      {recent.length > 0 && (
        <div className="card">
          <div className="border-b border-line px-4 py-3 font-display font-semibold">Account Activity</div>
          <ul className="divide-y divide-line">
            {recent.map((n) => (
              <li key={n.id} className="flex items-start gap-3 px-4 py-3">
                {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand-secondary" />}
                <div className={n.read ? 'pl-[14px]' : ''}>
                  <div className="text-sm font-medium">{n.title}</div>
                  {n.body && <div className="text-xs text-content-muted">{n.body}</div>}
                  <div className="mt-0.5 text-[11px] text-content-muted">{formatRelative(n.createdAt)}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

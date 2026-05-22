import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserCircle, Target, CheckSquare, Trophy, IndianRupee } from 'lucide-react';
import { PageHeader } from '@/components/shared/PageHeader';
import { KpiCard } from '@/components/shared/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EmptyState } from '@/components/shared/EmptyState';
import { FunnelChart } from '@/components/charts/FunnelChart';
import { useDataStore } from '@/stores/dataStore';
import { useAuth } from '@/hooks/useAuth';
import { pipelineCounts } from '@/lib/analytics';
import { LEAD_STATUS, LEAD_TEMPERATURE, PRIORITY } from '@/lib/constants';
import { formatINRCompact, formatDate } from '@/lib/format';

export default function MyDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { leads, tasks, proposals } = useDataStore();

  const mine = useMemo(() => {
    const myLeads = leads.filter((l) => l.assignedToId === user?.id);
    const myTasks = tasks.filter((t) => t.assignedToId === user?.id);
    const myProposals = proposals.filter((p) => p.createdById === user?.id);
    return { myLeads, myTasks, myProposals };
  }, [leads, tasks, proposals, user]);

  const activeLeads = mine.myLeads.filter(
    (l) => l.status !== 'WON' && l.status !== 'LOST',
  );
  const pendingTasks = mine.myTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED',
  );
  const wonProposals = mine.myProposals.filter((p) => p.status === 'WON');
  const wonValue = wonProposals.reduce((s, p) => s + p.total, 0);

  const target = 5000000;
  const achieved = Math.min((wonValue / target) * 100, 100);

  const funnel = useMemo(() => {
    const c = pipelineCounts(mine.myLeads);
    return [
      { label: 'New', value: c.NEW + c.CONTACTED, color: '#2563EB' },
      { label: 'Qualified', value: c.QUALIFIED, color: '#3B82F6' },
      { label: 'Proposal', value: c.PROPOSAL_SENT, color: '#0F3D5C' },
      { label: 'Negotiation', value: c.NEGOTIATION, color: '#E87722' },
      { label: 'Won', value: c.WON, color: '#16A34A' },
    ];
  }, [mine.myLeads]);

  return (
    <div className="space-y-5">
      <PageHeader
        title="My Dashboard"
        description={`Your personal performance, ${user?.name.split(' ')[0]}`}
        icon={<UserCircle />}
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiCard label="My Active Leads" value={String(activeLeads.length)} icon={Target} accent="#7C3AED" onClick={() => navigate('/leads')} />
        <KpiCard label="Pending Tasks" value={String(pendingTasks.length)} icon={CheckSquare} accent="#2563EB" onClick={() => navigate('/my-day')} />
        <KpiCard label="Deals Won" value={String(wonProposals.length)} icon={Trophy} accent="#16A34A" />
        <KpiCard label="Won Value" value={formatINRCompact(wonValue)} icon={IndianRupee} accent="#0F3D5C" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Sales Target</CardTitle>
          <span className="num text-sm text-content-muted">
            {formatINRCompact(wonValue)} / {formatINRCompact(target)}
          </span>
        </CardHeader>
        <CardContent>
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-brand-accent transition-all"
              style={{ width: `${achieved}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-content-muted">
            {achieved.toFixed(0)}% of this quarter's target achieved.
          </p>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>My Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelChart stages={funnel} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>My Hot Leads</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {activeLeads
              .filter((l) => l.temperature === 'HOT')
              .slice(0, 6)
              .map((l) => (
                <button
                  key={l.id}
                  onClick={() => navigate(`/leads/${l.id}`)}
                  className="flex w-full items-center gap-2 rounded-md border border-line p-2 text-left hover:bg-muted"
                >
                  <span className="truncate text-sm text-content-secondary">
                    {l.companyName ?? l.name}
                  </span>
                  <StatusBadge def={LEAD_STATUS[l.status]} size="sm" className="ml-auto" />
                  <StatusBadge def={LEAD_TEMPERATURE[l.temperature]} size="sm" dot />
                </button>
              ))}
            {activeLeads.filter((l) => l.temperature === 'HOT').length === 0 && (
              <EmptyState compact title="No hot leads right now" />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Upcoming Tasks</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {pendingTasks.slice(0, 8).map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-md border border-line p-2"
            >
              <span className="flex-1 truncate text-sm text-content-secondary">
                {t.title}
              </span>
              <StatusBadge def={PRIORITY[t.priority]} size="sm" />
              <span className="text-xs text-content-muted">
                {formatDate(t.dueDate)}
              </span>
            </div>
          ))}
          {pendingTasks.length === 0 && (
            <EmptyState compact title="No pending tasks" />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

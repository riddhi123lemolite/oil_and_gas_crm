import { useNavigate } from 'react-router-dom';
import { KanbanSquare, Table2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { KanbanBoard, type KanbanColumn } from '@/components/shared/KanbanBoard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { Button } from '@/components/ui/button';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { useLookups } from '@/hooks/useLookups';
import { LEAD_STATUS, LEAD_TEMPERATURE } from '@/lib/constants';
import { formatINRCompact } from '@/lib/format';
import { sum } from '@/lib/utils';
import type { Lead, LeadStatus } from '@/types';

const COLUMNS: KanbanColumn[] = [
  { id: 'NEW', label: 'New', color: '#2563EB' },
  { id: 'CONTACTED', label: 'Contacted', color: '#3B82F6' },
  { id: 'QUALIFIED', label: 'Qualified', color: '#F59E0B' },
  { id: 'PROPOSAL_SENT', label: 'Proposal', color: '#0F3D5C' },
  { id: 'NEGOTIATION', label: 'Negotiation', color: '#E87722' },
  { id: 'WON', label: 'Won', color: '#16A34A' },
  { id: 'LOST', label: 'Lost', color: '#DC2626' },
];

export default function LeadPipeline() {
  const navigate = useNavigate();
  const leads = useDataStore((s) => s.leads);
  const updateLead = useDataStore((s) => s.update);
  const logActivity = useDataStore((s) => s.logActivity);
  const currentUser = useAuthStore((s) => s.currentUser);
  const { userName } = useLookups();

  const handleMove = (leadId: string, toColumn: string) => {
    const status = toColumn as LeadStatus;
    updateLead('leads', leadId, {
      status,
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    });
    if (currentUser) {
      logActivity(
        'lead',
        leadId,
        'STATUS_CHANGE',
        `moved lead to ${LEAD_STATUS[status].label}`,
        currentUser.id,
      );
    }
    toast.success(`Moved to ${LEAD_STATUS[status].label}`);
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Lead Pipeline"
        description="Drag leads between stages to update their status"
        icon={<KanbanSquare />}
        actions={
          <Button variant="outline" onClick={() => navigate('/leads')}>
            <Table2 className="size-4" /> Table View
          </Button>
        }
      />

      <KanbanBoard<Lead>
        columns={COLUMNS}
        items={leads}
        getItemId={(l) => l.id}
        getColumnId={(l) => l.status}
        onMove={handleMove}
        columnSummary={(items) =>
          formatINRCompact(sum(items.map((l) => l.estimatedValue ?? 0)))
        }
        renderCard={(lead) => (
          <div
            onClick={() => navigate(`/leads/${lead.id}`)}
            className="card p-3 transition-shadow hover:shadow-pop"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-content">
                  {lead.companyName ?? lead.name}
                </div>
                <div className="num text-[11px] text-content-muted">
                  {lead.code}
                </div>
              </div>
              <StatusBadge
                def={LEAD_TEMPERATURE[lead.temperature]}
                size="sm"
                dot
              />
            </div>
            <div className="mt-2 num text-sm font-semibold text-brand-primary dark:text-brand-secondary">
              {formatINRCompact(lead.estimatedValue ?? 0)}
            </div>
            <div className="mt-2 flex items-center gap-1.5 border-t border-line pt-2">
              <EntityAvatar name={userName(lead.assignedToId)} size="xs" />
              <span className="truncate text-[11px] text-content-muted">
                {userName(lead.assignedToId)}
              </span>
              <span className="ml-auto text-[11px] text-content-muted">
                {lead.city}
              </span>
            </div>
          </div>
        )}
      />
    </div>
  );
}

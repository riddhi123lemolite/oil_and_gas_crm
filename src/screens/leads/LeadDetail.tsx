import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Pencil,
  UserPlus,
  Phone,
  Mail,
  MapPin,
  Building2,
  Trash2,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/input';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { EmptyState } from '@/components/shared/EmptyState';
import { ActivityTimeline } from '@/components/shared/ActivityTimeline';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { useLookups } from '@/hooks/useLookups';
import {
  LEAD_STATUS,
  LEAD_TEMPERATURE,
  LEAD_SOURCE,
  TASK_STATUS,
} from '@/lib/constants';
import { formatINR, formatDateLong, formatPhone } from '@/lib/format';
import type { Activity } from '@/types';

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <Icon className="size-4 shrink-0 text-content-muted" />
      <span className="text-xs text-content-muted">{label}</span>
      <span className="ml-auto truncate text-sm font-medium text-content">
        {value}
      </span>
    </div>
  );
}

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userName } = useLookups();
  const currentUser = useAuthStore((s) => s.currentUser);

  const leads = useDataStore((s) => s.leads);
  const activities = useDataStore((s) => s.activities);
  const tasks = useDataStore((s) => s.tasks);
  const documents = useDataStore((s) => s.documents);
  const removeLead = useDataStore((s) => s.remove);
  const logActivity = useDataStore((s) => s.logActivity);

  const [noteText, setNoteText] = useState('');
  const [activityType, setActivityType] = useState('CALL');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const lead = leads.find((l) => l.id === id);

  if (!lead) {
    return (
      <EmptyState
        icon={Building2}
        title="Lead not found"
        description="This lead may have been deleted."
        actionLabel="Back to Leads"
        onAction={() => navigate('/leads')}
      />
    );
  }

  const leadActivities = activities.filter(
    (a) => a.entityType === 'lead' && a.entityId === lead.id,
  );
  const leadTasks = tasks.filter(
    (t) => t.relatedType === 'lead' && t.relatedId === lead.id,
  );
  const leadDocs = documents.filter(
    (d) => d.entityType === 'lead' && d.entityId === lead.id,
  );

  const addNote = () => {
    if (!noteText.trim() || !currentUser) return;
    logActivity(
      'lead',
      lead.id,
      activityType as Activity['type'],
      activityType === 'NOTE'
        ? 'added a note'
        : `logged a ${activityType.toLowerCase()}`,
      currentUser.id,
      noteText.trim(),
    );
    setNoteText('');
    toast.success('Activity logged');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title={lead.companyName ?? lead.name}
        description={`${lead.code} · ${LEAD_SOURCE[lead.source]}`}
        icon={<Building2 />}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`/leads/${lead.id}/edit`)}>
              <Pencil className="size-4" /> Edit
            </Button>
            {lead.status !== 'WON' && (
              <Button onClick={() => navigate(`/leads/${lead.id}/convert`)}>
                <UserPlus className="size-4" /> Convert to Customer
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Left rail */}
        <div className="space-y-4">
          <Card>
            <CardContent className="flex flex-col items-center pt-6 text-center">
              <EntityAvatar
                name={lead.companyName ?? lead.name}
                size="xl"
              />
              <h3 className="mt-3 font-display text-base font-semibold text-content">
                {lead.companyName ?? lead.name}
              </h3>
              <p className="text-sm text-content-muted">{lead.name}</p>
              <div className="mt-3 flex gap-1.5">
                <StatusBadge def={LEAD_STATUS[lead.status]} />
                <StatusBadge def={LEAD_TEMPERATURE[lead.temperature]} dot />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              <InfoRow icon={Phone} label="Mobile" value={formatPhone(lead.phone)} />
              {lead.email && (
                <InfoRow icon={Mail} label="Email" value={lead.email} />
              )}
              <InfoRow
                icon={MapPin}
                label="Location"
                value={`${lead.city}, ${lead.state}`}
              />
              <InfoRow
                icon={Building2}
                label="Est. Value"
                value={formatINR(lead.estimatedValue ?? 0)}
              />
              <div className="border-t border-line pt-2.5 text-xs text-content-muted">
                Owner: <span className="font-medium text-content">{userName(lead.assignedToId)}</span>
                <br />
                Created {formatDateLong(lead.createdAt)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-danger"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="size-4" /> Delete Lead
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs defaultValue="overview">
              <div className="px-2 pt-1">
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="activity">
                    Activity ({leadActivities.length})
                  </TabsTrigger>
                  <TabsTrigger value="notes">Log Activity</TabsTrigger>
                  <TabsTrigger value="tasks">
                    Tasks ({leadTasks.length})
                  </TabsTrigger>
                  <TabsTrigger value="files">
                    Files ({leadDocs.length})
                  </TabsTrigger>
                </TabsList>
              </div>

              <CardContent>
                <TabsContent value="overview">
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                    <Field label="Contact Person" value={lead.name} />
                    <Field label="Company" value={lead.companyName ?? '—'} />
                    <Field label="Source" value={LEAD_SOURCE[lead.source]} />
                    <Field label="Stage" value={LEAD_STATUS[lead.status].label} />
                    <Field
                      label="Temperature"
                      value={LEAD_TEMPERATURE[lead.temperature].label}
                    />
                    <Field
                      label="Next Follow-up"
                      value={formatDateLong(lead.nextFollowUpAt)}
                    />
                    <Field
                      label="Products of Interest"
                      value={lead.productInterest.join(', ') || '—'}
                      full
                    />
                    <Field label="Notes" value={lead.notes ?? '—'} full />
                  </dl>
                </TabsContent>

                <TabsContent value="activity">
                  <ActivityTimeline activities={leadActivities} />
                </TabsContent>

                <TabsContent value="notes">
                  <div className="space-y-3">
                    <div className="w-44">
                      <SelectField
                        value={activityType}
                        onChange={setActivityType}
                        options={[
                          { value: 'CALL', label: 'Call' },
                          { value: 'EMAIL', label: 'Email' },
                          { value: 'MEETING', label: 'Meeting' },
                          { value: 'WHATSAPP', label: 'WhatsApp' },
                          { value: 'NOTE', label: 'Note' },
                        ]}
                      />
                    </div>
                    <Textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="What happened? Add a note, call summary or next step…"
                      rows={3}
                    />
                    <Button size="sm" onClick={addNote} disabled={!noteText.trim()}>
                      <Plus className="size-4" /> Log Activity
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="tasks">
                  {leadTasks.length === 0 ? (
                    <EmptyState
                      compact
                      title="No tasks linked"
                      description="Tasks linked to this lead appear here."
                    />
                  ) : (
                    <div className="space-y-2">
                      {leadTasks.map((t) => (
                        <div
                          key={t.id}
                          className="flex items-center gap-2 rounded-md border border-line p-2.5"
                        >
                          <span className="text-sm text-content-secondary">
                            {t.title}
                          </span>
                          <StatusBadge
                            def={TASK_STATUS[t.status]}
                            size="sm"
                            className="ml-auto"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="files">
                  {leadDocs.length === 0 ? (
                    <EmptyState
                      compact
                      title="No files uploaded"
                      description="Documents attached to this lead appear here."
                    />
                  ) : (
                    <div className="space-y-2">
                      {leadDocs.map((d) => (
                        <div
                          key={d.id}
                          className="flex items-center gap-2 rounded-md border border-line p-2.5 text-sm"
                        >
                          <span className="text-content-secondary">
                            {d.name}
                          </span>
                          <span className="num ml-auto text-xs text-content-muted">
                            {d.sizeKb} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title="Delete this lead?"
        description="This removes the lead from your demo data."
        destructive
        confirmLabel="Delete"
        onConfirm={() => {
          removeLead('leads', lead.id);
          toast.success('Lead deleted');
          navigate('/leads');
        }}
      />

      <p className="text-center text-xs text-content-muted">
        Need the full pipeline?{' '}
        <Link to="/leads/pipeline" className="text-brand-secondary hover:underline">
          Open Kanban view
        </Link>
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  full,
}: {
  label: string;
  value: string;
  full?: boolean;
}) {
  return (
    <div className={full ? 'col-span-2' : ''}>
      <dt className="text-xs text-content-muted">{label}</dt>
      <dd className="mt-0.5 font-medium text-content">{value}</dd>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { PhoneCall, PhoneIncoming, PhoneOutgoing, PhoneMissed, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { FormField } from '@/components/forms/FormField';
import { SelectField } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { formatDateTime } from '@/lib/format';
import { generateId } from '@/lib/utils';
import type { CallLog } from '@/types';

const DIRECTION_ICON = {
  INBOUND: PhoneIncoming,
  OUTBOUND: PhoneOutgoing,
  MISSED: PhoneMissed,
};
const DIRECTION_COLOR = {
  INBOUND: 'text-info',
  OUTBOUND: 'text-success',
  MISSED: 'text-danger',
};

export default function CallLogs() {
  const callLogs = useDataStore((s) => s.callLogs);
  const addCall = useDataStore((s) => s.add);
  const currentUser = useAuthStore((s) => s.currentUser);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    contactName: '',
    phone: '',
    direction: 'OUTBOUND',
    outcome: 'Discussed requirement',
  });

  const columns = useMemo<ColumnDef<CallLog, unknown>[]>(
    () => [
      {
        accessorKey: 'direction',
        header: 'Type',
        cell: ({ row }) => {
          const Icon = DIRECTION_ICON[row.original.direction];
          return (
            <span
              className={`flex items-center gap-1.5 ${DIRECTION_COLOR[row.original.direction]}`}
            >
              <Icon className="size-4" />
              <span className="text-xs capitalize text-content-secondary">
                {row.original.direction.toLowerCase()}
              </span>
            </span>
          );
        },
      },
      {
        accessorKey: 'contactName',
        header: 'Contact',
        cell: ({ row }) => (
          <span className="font-medium text-content">
            {row.original.contactName}
          </span>
        ),
      },
      {
        accessorKey: 'phone',
        header: 'Number',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.phone}
          </span>
        ),
      },
      {
        accessorKey: 'durationSec',
        header: 'Duration',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {Math.floor(row.original.durationSec / 60)}m{' '}
            {row.original.durationSec % 60}s
          </span>
        ),
      },
      {
        accessorKey: 'outcome',
        header: 'Outcome',
        cell: ({ row }) => (
          <span className="text-content-secondary">{row.original.outcome}</span>
        ),
      },
      {
        accessorKey: 'loggedAt',
        header: 'Logged',
        cell: ({ row }) => (
          <span className="text-xs text-content-muted">
            {formatDateTime(row.original.loggedAt)}
          </span>
        ),
      },
    ],
    [],
  );

  const logCall = () => {
    if (!form.contactName || !form.phone) {
      toast.error('Enter contact name and number.');
      return;
    }
    const call: CallLog = {
      id: generateId('call'),
      contactName: form.contactName,
      phone: form.phone,
      direction: form.direction as CallLog['direction'],
      durationSec: 0,
      outcome: form.outcome,
      userId: currentUser?.id ?? 'user_03',
      loggedAt: new Date().toISOString(),
    };
    addCall('callLogs', call);
    setOpen(false);
    setForm({
      contactName: '',
      phone: '',
      direction: 'OUTBOUND',
      outcome: 'Discussed requirement',
    });
    toast.success('Call logged');
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Call Logs"
        description={`${callLogs.length} calls logged`}
        icon={<PhoneCall />}
        actions={
          <Button onClick={() => setOpen(true)}>
            <Plus className="size-4" /> Log Call
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={callLogs}
        getRowId={(c) => c.id}
        searchPlaceholder="Search calls…"
        searchKeys={['contactName', 'phone']}
        exportName="call-logs"
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Log a Call</DialogTitle>
          </DialogHeader>
          <DialogBody className="space-y-3">
            <FormField label="Contact Name">
              <Input
                value={form.contactName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactName: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Phone Number">
              <Input
                value={form.phone}
                onChange={(e) =>
                  setForm((f) => ({ ...f, phone: e.target.value }))
                }
              />
            </FormField>
            <FormField label="Direction">
              <SelectField
                value={form.direction}
                onChange={(v) => setForm((f) => ({ ...f, direction: v }))}
                options={[
                  { value: 'OUTBOUND', label: 'Outbound' },
                  { value: 'INBOUND', label: 'Inbound' },
                  { value: 'MISSED', label: 'Missed' },
                ]}
              />
            </FormField>
            <FormField label="Outcome">
              <Input
                value={form.outcome}
                onChange={(e) =>
                  setForm((f) => ({ ...f, outcome: e.target.value }))
                }
              />
            </FormField>
          </DialogBody>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={logCall}>Log Call</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

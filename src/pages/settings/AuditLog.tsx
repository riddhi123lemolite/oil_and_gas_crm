import { useMemo } from 'react';
import { ScrollText } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { formatDateTime } from '@/lib/format';
import type { AuditLogEntry } from '@/types';
import type { BadgeTone } from '@/lib/constants';

const ACTION_TONE: Record<string, BadgeTone> = {
  CREATE: 'success',
  UPDATE: 'info',
  DELETE: 'danger',
  LOGIN: 'neutral',
  EXPORT: 'warm',
};

export default function AuditLog() {
  const auditLog = useDataStore((s) => s.auditLog);
  const { userName } = useLookups();

  const columns = useMemo<ColumnDef<AuditLogEntry, unknown>[]>(
    () => [
      {
        accessorKey: 'createdAt',
        header: 'Timestamp',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDateTime(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: 'userId',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <EntityAvatar name={userName(row.original.userId)} size="xs" />
            <span className="text-content-secondary">
              {userName(row.original.userId)}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ row }) => (
          <Badge tone={ACTION_TONE[row.original.action] ?? 'neutral'}>
            {row.original.action}
          </Badge>
        ),
      },
      {
        accessorKey: 'entity',
        header: 'Entity',
        cell: ({ row }) => (
          <span className="text-content-secondary">{row.original.entity}</span>
        ),
      },
      {
        accessorKey: 'detail',
        header: 'Detail',
        cell: ({ row }) => (
          <span className="text-content-secondary">{row.original.detail}</span>
        ),
      },
    ],
    [userName],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Audit Log"
        description={`${auditLog.length} system events recorded`}
        icon={<ScrollText />}
      />
      <DataTable
        columns={columns}
        data={auditLog}
        getRowId={(a) => a.id}
        searchPlaceholder="Search audit log…"
        searchKeys={['action', 'entity', 'detail']}
        exportName="audit-log"
      />
    </div>
  );
}

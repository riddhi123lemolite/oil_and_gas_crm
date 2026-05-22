import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, Eye, EyeOff, Pencil } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { useDataStore } from '@/stores/dataStore';
import { ROLE_LABELS } from '@/lib/constants';
import { formatPhone } from '@/lib/format';
import type { User } from '@/types';

function PasswordCell({ password }: { password: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex items-center gap-1.5">
      <span className="num text-content-secondary">
        {show ? password : '••••••••'}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShow((v) => !v);
        }}
        className="text-content-muted hover:text-content"
      >
        {show ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
      </button>
    </div>
  );
}

export default function StaffList() {
  const navigate = useNavigate();
  const users = useDataStore((s) => s.users);

  const columns = useMemo<ColumnDef<User, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-2.5">
            <EntityAvatar name={row.original.name} size="sm" />
            <span className="font-medium text-content">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'userCode',
        header: 'User ID',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {row.original.userCode}
          </span>
        ),
      },
      {
        accessorKey: 'password',
        header: 'Password',
        cell: ({ row }) => <PasswordCell password={row.original.password} />,
      },
      {
        accessorKey: 'phone',
        header: 'Mobile',
        cell: ({ row }) => (
          <span className="num text-content-secondary">
            {formatPhone(row.original.phone)}
          </span>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge tone="brand">{ROLE_LABELS[row.original.role]}</Badge>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
        cell: ({ row }) => (
          <span className="text-content-secondary">{row.original.city}</span>
        ),
      },
      {
        accessorKey: 'active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge tone={row.original.active ? 'success' : 'neutral'}>
            {row.original.active ? 'Active' : 'Inactive'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/staff/${row.original.id}/edit`);
            }}
          >
            <Pencil />
          </Button>
        ),
      },
    ],
    [navigate],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Staff Management"
        description={`${users.length} team members`}
        icon={<Users />}
        actions={
          <Button onClick={() => navigate('/staff/new')}>
            <Plus className="size-4" /> Add User
          </Button>
        }
      />
      <DataTable
        columns={columns}
        data={users}
        getRowId={(u) => u.id}
        searchPlaceholder="Search staff…"
        searchKeys={['name', 'userCode', 'phone', 'city']}
        exportName="staff"
        exportMapper={(u) => ({
          Name: u.name,
          'User ID': u.userCode,
          Email: u.email,
          Mobile: u.phone,
          Role: ROLE_LABELS[u.role],
          City: u.city,
          State: u.state,
        })}
      />
    </div>
  );
}

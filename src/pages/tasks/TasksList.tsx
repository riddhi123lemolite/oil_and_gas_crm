import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, KanbanSquare, Table2 } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ColumnDef } from '@tanstack/react-table';
import { PageHeader } from '@/components/shared/PageHeader';
import { DataTable } from '@/components/shared/DataTable';
import { KanbanBoard, type KanbanColumn } from '@/components/shared/KanbanBoard';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { EntityAvatar } from '@/components/shared/EntityAvatar';
import { Button } from '@/components/ui/button';
import {
  SegmentTabs,
  SegmentList,
  SegmentTrigger,
} from '@/components/ui/tabs';
import { TabsContent } from '@/components/ui/tabs';
import { useDataStore } from '@/stores/dataStore';
import { useLookups } from '@/hooks/useLookups';
import { TASK_STATUS, PRIORITY } from '@/lib/constants';
import { formatDate } from '@/lib/format';
import type { Task, TaskStatus } from '@/types';

const COLUMNS: KanbanColumn[] = [
  { id: 'NOT_STARTED', label: 'Not Started', color: '#94A3B8' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: '#2563EB' },
  { id: 'COMPLETED', label: 'Completed', color: '#16A34A' },
  { id: 'CANCELLED', label: 'Cancelled', color: '#DC2626' },
];

export default function TasksList() {
  const navigate = useNavigate();
  const { userName } = useLookups();
  const tasks = useDataStore((s) => s.tasks);
  const updateTask = useDataStore((s) => s.update);

  const [view, setView] = useState('kanban');

  const columns = useMemo<ColumnDef<Task, unknown>[]>(
    () => [
      { accessorKey: 'title', header: 'Task',
        cell: ({ row }) => (
          <span className="font-medium text-content">{row.original.title}</span>
        ),
      },
      { accessorKey: 'type', header: 'Type',
        cell: ({ row }) => (
          <span className="text-content-secondary capitalize">
            {row.original.type.toLowerCase().replace('_', ' ')}
          </span>
        ),
      },
      { accessorKey: 'priority', header: 'Priority',
        cell: ({ row }) => (
          <StatusBadge def={PRIORITY[row.original.priority]} />
        ),
      },
      { accessorKey: 'status', header: 'Status',
        cell: ({ row }) => (
          <StatusBadge def={TASK_STATUS[row.original.status]} />
        ),
      },
      { accessorKey: 'assignedToId', header: 'Assignee',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <EntityAvatar name={userName(row.original.assignedToId)} size="xs" />
            <span className="text-content-secondary">
              {userName(row.original.assignedToId)}
            </span>
          </div>
        ),
      },
      { accessorKey: 'dueDate', header: 'Due',
        cell: ({ row }) => (
          <span className="text-content-secondary">
            {formatDate(row.original.dueDate)}
          </span>
        ),
      },
    ],
    [userName],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Tasks"
        description={`${tasks.length} tasks across your team`}
        icon={<CheckSquare />}
        actions={
          <Button onClick={() => navigate('/tasks/new')}>
            <Plus className="size-4" /> Add Task
          </Button>
        }
      />

      <SegmentTabs value={view} onValueChange={setView}>
        <SegmentList>
          <SegmentTrigger value="kanban">
            <KanbanSquare /> Board
          </SegmentTrigger>
          <SegmentTrigger value="table">
            <Table2 /> Table
          </SegmentTrigger>
        </SegmentList>

        <TabsContent value="kanban" className="mt-4">
          <KanbanBoard<Task>
            columns={COLUMNS}
            items={tasks}
            getItemId={(t) => t.id}
            getColumnId={(t) => t.status}
            columnSummary={(items) => `${items.length} tasks`}
            onMove={(taskId, col) => {
              updateTask('tasks', taskId, {
                status: col as TaskStatus,
                completedAt:
                  col === 'COMPLETED' ? new Date().toISOString() : undefined,
              });
              toast.success(`Moved to ${TASK_STATUS[col as TaskStatus].label}`);
            }}
            renderCard={(task) => (
              <div
                onClick={() => navigate(`/tasks/${task.id}/edit`)}
                className="card p-3 hover:shadow-pop"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-content">
                    {task.title}
                  </span>
                  <StatusBadge
                    def={PRIORITY[task.priority]}
                    size="sm"
                  />
                </div>
                <div className="mt-2 flex items-center gap-1.5 border-t border-line pt-2">
                  <EntityAvatar
                    name={userName(task.assignedToId)}
                    size="xs"
                  />
                  <span className="truncate text-[11px] text-content-muted">
                    {userName(task.assignedToId)}
                  </span>
                  {task.dueDate && (
                    <span className="ml-auto text-[11px] text-content-muted">
                      {formatDate(task.dueDate)}
                    </span>
                  )}
                </div>
              </div>
            )}
          />
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <DataTable
            columns={columns}
            data={tasks}
            getRowId={(t) => t.id}
            onRowClick={(t) => navigate(`/tasks/${t.id}/edit`)}
            searchPlaceholder="Search tasks…"
            searchKeys={['title']}
            exportName="tasks"
            exportMapper={(t) => ({
              Title: t.title,
              Type: t.type,
              Priority: PRIORITY[t.priority].label,
              Status: TASK_STATUS[t.status].label,
              Assignee: userName(t.assignedToId),
              Due: formatDate(t.dueDate),
            })}
          />
        </TabsContent>
      </SegmentTabs>
    </div>
  );
}

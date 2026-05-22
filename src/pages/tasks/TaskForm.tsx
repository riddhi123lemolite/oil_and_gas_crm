import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeader } from '@/components/shared/PageHeader';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { FormField, FormGrid } from '@/components/forms/FormField';
import { SelectField, optionsFromLabels } from '@/components/forms/SelectField';
import { useDataStore } from '@/stores/dataStore';
import { useAuthStore } from '@/stores/authStore';
import { taskFormSchema, type TaskFormValues } from '@/lib/validation';
import { TASK_STATUS, PRIORITY } from '@/lib/constants';
import { generateId } from '@/lib/utils';
import { toInputDate } from '@/lib/format';
import type { Task, Priority, TaskStatus } from '@/types';

const TYPE_OPTIONS = [
  { value: 'CALL', label: 'Call' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'FOLLOW_UP', label: 'Follow-up' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'OTHER', label: 'Other' },
];

export default function TaskForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const tasks = useDataStore((s) => s.tasks);
  const users = useDataStore((s) => s.users);
  const addTask = useDataStore((s) => s.add);
  const updateTask = useDataStore((s) => s.update);
  const currentUser = useAuthStore((s) => s.currentUser);

  const existing = tasks.find((t) => t.id === id);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: existing
      ? {
          title: existing.title,
          description: existing.description ?? '',
          status: existing.status,
          priority: existing.priority,
          type: existing.type,
          assignedToId: existing.assignedToId,
          dueDate: toInputDate(existing.dueDate),
        }
      : {
          title: '',
          status: 'NOT_STARTED',
          priority: 'MEDIUM',
          type: 'FOLLOW_UP',
          assignedToId: currentUser?.id ?? '',
          dueDate: toInputDate(new Date().toISOString()),
        },
  });

  const onSubmit = (v: TaskFormValues) => {
    const due = v.dueDate ? new Date(v.dueDate).toISOString() : undefined;
    if (isEdit && existing) {
      updateTask('tasks', existing.id, {
        title: v.title,
        description: v.description || undefined,
        status: v.status as TaskStatus,
        priority: v.priority as Priority,
        type: v.type as Task['type'],
        assignedToId: v.assignedToId,
        dueDate: due,
        completedAt:
          v.status === 'COMPLETED'
            ? existing.completedAt ?? new Date().toISOString()
            : undefined,
      });
      toast.success('Task updated');
    } else {
      const task: Task = {
        id: generateId('task'),
        title: v.title,
        description: v.description || undefined,
        status: v.status as TaskStatus,
        priority: v.priority as Priority,
        type: v.type as Task['type'],
        assignedToId: v.assignedToId,
        dueDate: due,
        startDate: new Date().toISOString(),
        createdById: currentUser?.id ?? v.assignedToId,
        createdAt: new Date().toISOString(),
      };
      addTask('tasks', task);
      toast.success('Task created');
    }
    navigate('/tasks');
  };

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <PageHeader
        title={isEdit ? 'Edit Task' : 'Add Task'}
        description="Plan a call, meeting or follow-up"
        icon={<CheckSquare />}
      />
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="space-y-4">
            <FormField label="Task Title" required error={errors.title?.message}>
              <Input {...register('title')} placeholder="e.g. Follow up on pending quotation" />
            </FormField>
            <FormField label="Description">
              <Textarea {...register('description')} rows={3} placeholder="Optional details" />
            </FormField>
            <FormGrid cols={3}>
              <FormField label="Type">
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={TYPE_OPTIONS}
                    />
                  )}
                />
              </FormField>
              <FormField label="Priority">
                <Controller
                  control={control}
                  name="priority"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={optionsFromLabels(PRIORITY)}
                    />
                  )}
                />
              </FormField>
              <FormField label="Status">
                <Controller
                  control={control}
                  name="status"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={optionsFromLabels(TASK_STATUS)}
                    />
                  )}
                />
              </FormField>
              <FormField
                label="Assigned To"
                required
                error={errors.assignedToId?.message}
              >
                <Controller
                  control={control}
                  name="assignedToId"
                  render={({ field }) => (
                    <SelectField
                      value={field.value}
                      onChange={field.onChange}
                      options={users.map((u) => ({
                        value: u.id,
                        label: u.name,
                      }))}
                    />
                  )}
                />
              </FormField>
              <FormField label="Due Date">
                <Input type="date" {...register('dueDate')} />
              </FormField>
            </FormGrid>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="button" variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button type="submit">{isEdit ? 'Save Changes' : 'Create Task'}</Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}

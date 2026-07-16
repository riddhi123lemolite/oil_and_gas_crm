import { useMemo } from 'react';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, LayoutGrid, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useDashboardStore } from '@/stores/dashboardStore';
import {
  WIDGET_BY_ID,
  isWidgetAvailable,
  isWidgetVisibleByDefault,
  type WidgetContext,
  type WidgetDef,
  type WidgetGroup,
  type WidgetId,
} from '@/lib/dashboard/widgets';
import { cn } from '@/lib/utils';

interface RowProps {
  widget: WidgetDef;
  visible: boolean;
  onToggle: (visible: boolean) => void;
}

function SortableRow({ widget, visible, onToggle }: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const Icon = widget.icon;

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2.5',
        isDragging && 'relative z-10 shadow-pop',
        !visible && 'opacity-60',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${widget.label}`}
        className="cursor-grab touch-none rounded p-0.5 text-content-muted transition-colors hover:text-content focus-ring active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
        <Icon className="size-3.5" />
      </span>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-content">
          {widget.label}
        </p>
        <p className="truncate text-xs text-content-muted">
          {widget.description}
        </p>
      </div>

      <Switch
        checked={visible}
        onCheckedChange={onToggle}
        aria-label={`Show ${widget.label}`}
      />
    </div>
  );
}

interface GroupProps {
  title: string;
  hint: string;
  group: WidgetGroup;
  widgets: WidgetDef[];
  isVisible: (id: WidgetId) => boolean;
  onToggle: (id: WidgetId, visible: boolean) => void;
  onReorder: (group: WidgetGroup, order: WidgetId[]) => void;
}

function WidgetGroupList({
  title,
  hint,
  group,
  widgets,
  isVisible,
  onToggle,
  onReorder,
}: GroupProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = widgets.map((w) => w.id);

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = ids.indexOf(active.id as WidgetId);
    const to = ids.indexOf(over.id as WidgetId);
    if (from === -1 || to === -1) return;
    const next = [...ids];
    const [moved] = next.splice(from, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onReorder(group, next);
  }

  if (widgets.length === 0) return null;

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold text-content">{title}</h3>
        <span className="text-xs text-content-muted">{hint}</span>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {widgets.map((w) => (
              <SortableRow
                key={w.id}
                widget={w}
                visible={isVisible(w.id)}
                onToggle={(v) => onToggle(w.id, v)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </section>
  );
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ctx: WidgetContext;
}

export function CustomizeDashboardDialog({ open, onOpenChange, ctx }: Props) {
  const order = useDashboardStore((s) => s.order);
  const visibility = useDashboardStore((s) => s.visibility);
  const toggle = useDashboardStore((s) => s.toggle);
  const reorderGroup = useDashboardStore((s) => s.reorderGroup);
  const reset = useDashboardStore((s) => s.reset);

  // Changes apply to the dashboard behind the dialog immediately — there is no
  // draft to save, and Reset is always one click away.
  const available = useMemo(
    () =>
      order
        .filter((id) => isWidgetAvailable(id, ctx))
        .map((id) => WIDGET_BY_ID[id])
        .filter((w): w is WidgetDef => Boolean(w)),
    [order, ctx],
  );

  const kpis = available.filter((w) => w.group === 'kpi');
  const sections = available.filter((w) => w.group === 'section');

  const isVisible = (id: WidgetId) =>
    visibility[id] ?? isWidgetVisibleByDefault(id, ctx);

  const shownCount = available.filter((w) => isVisible(w.id)).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/8 text-brand-primary dark:bg-brand-secondary/12 dark:text-brand-secondary">
              <LayoutGrid className="size-5" />
            </span>
            <div>
              <DialogTitle>Customise dashboard</DialogTitle>
              <DialogDescription>
                Drag to reorder, toggle to show or hide. Changes apply instantly
                and are saved to this browser for your account.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogBody className="space-y-5">
          <WidgetGroupList
            title="KPI cards"
            hint="The strip across the top"
            group="kpi"
            widgets={kpis}
            isVisible={isVisible}
            onToggle={toggle}
            onReorder={reorderGroup}
          />
          <WidgetGroupList
            title="Sections"
            hint="Charts, tables and analytics"
            group="section"
            widgets={sections}
            isVisible={isVisible}
            onToggle={toggle}
            onReorder={reorderGroup}
          />
        </DialogBody>

        <DialogFooter className="justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                reset();
                toast.success('Dashboard reset to default');
              }}
            >
              <RotateCcw /> Reset to default
            </Button>
            <span className="hidden text-xs text-content-muted sm:inline">
              {shownCount} of {available.length} shown
            </span>
          </div>
          <DialogClose asChild>
            <Button variant="primary" size="sm">
              Done
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

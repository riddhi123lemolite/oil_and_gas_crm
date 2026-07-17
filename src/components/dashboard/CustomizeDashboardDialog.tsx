import { useMemo, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, EyeOff, GripVertical, LayoutGrid, RotateCcw, Sparkles } from 'lucide-react';
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
  sectionSpanFor,
  type WidgetContext,
  type WidgetDef,
  type WidgetGroup,
  type WidgetId,
} from '@/lib/dashboard/widgets';
import { cn } from '@/lib/utils';

const SPAN_CLASS: Record<1 | 2 | 3, string> = {
  1: 'col-span-1',
  2: 'col-span-2',
  3: 'col-span-3',
};

// ---------------------------------------------------------------------------
// Live preview — a miniature of the real dashboard. Reorders and fades in step
// with the list beside it, so you read the layout instead of a list of names.
// ---------------------------------------------------------------------------
function LayoutPreview({
  kpis,
  sections,
  stateMapShown,
}: {
  kpis: WidgetDef[];
  sections: WidgetDef[];
  stateMapShown: boolean;
}) {
  const spring = { type: 'spring' as const, stiffness: 420, damping: 34 };
  const empty = kpis.length === 0 && sections.length === 0;

  return (
    <div className="relative overflow-hidden rounded-xl border border-line bg-base/70 p-3">
      {/* brand hairline, mirroring GlassCard */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand-secondary/40 to-transparent" />

      <div className="mb-2.5 flex items-center gap-1.5">
        <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-content-muted">
          <Sparkles className="size-3 text-brand-secondary" />
          Live preview
        </span>
        <span className="ml-auto flex gap-1">
          <i className="size-1.5 rounded-full bg-content-muted/25" />
          <i className="size-1.5 rounded-full bg-content-muted/25" />
          <i className="size-1.5 rounded-full bg-content-muted/25" />
        </span>
      </div>

      {empty ? (
        <div className="flex h-40 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line text-center">
          <EyeOff className="size-4 text-content-muted" />
          <p className="text-xs text-content-muted">Everything is hidden</p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* KPI strip */}
          {kpis.length > 0 && (
            <div className="grid grid-cols-6 gap-1">
              <AnimatePresence mode="popLayout" initial={false}>
                {kpis.map((w) => (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={spring}
                    title={w.label}
                    className="flex h-7 flex-col justify-center gap-[3px] rounded-[4px] px-1"
                    style={{
                      background: `${w.accent}1A`,
                      boxShadow: `inset 2px 0 0 ${w.accent}`,
                    }}
                  >
                    <i
                      className="block h-[3px] w-3/5 rounded-full"
                      style={{ background: `${w.accent}80` }}
                    />
                    <i
                      className="block h-[5px] w-4/5 rounded-full"
                      style={{ background: w.accent }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Section grid */}
          <div className="grid grid-cols-3 gap-1">
            <AnimatePresence mode="popLayout" initial={false}>
              {sections.map((w) => {
                const span = sectionSpanFor(w.id, stateMapShown);
                return (
                  <motion.div
                    key={w.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={spring}
                    title={w.label}
                    className={cn(
                      'flex items-center gap-1 overflow-hidden rounded-[4px] px-1.5 py-2',
                      SPAN_CLASS[span],
                      span === 3 ? 'h-9' : 'h-12',
                    )}
                    style={{
                      background: `${w.accent}14`,
                      boxShadow: `inset 0 0 0 1px ${w.accent}33`,
                    }}
                  >
                    <i
                      className="size-1.5 shrink-0 rounded-full"
                      style={{ background: w.accent }}
                    />
                    <span className="truncate text-[9px] font-medium leading-none text-content-secondary">
                      {w.label}
                    </span>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------
function RowBody({
  widget,
  visible,
  dragging,
}: {
  widget: WidgetDef;
  visible: boolean;
  dragging?: boolean;
}) {
  const Icon = widget.icon;
  return (
    <>
      <span
        className={cn(
          'flex size-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          !visible && 'grayscale',
        )}
        style={{
          background: `${widget.accent}1A`,
          color: widget.accent,
        }}
      >
        <Icon className="size-4" />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-medium transition-colors',
            visible ? 'text-content' : 'text-content-muted',
          )}
        >
          {widget.label}
        </p>
        <p className="truncate text-xs text-content-muted">
          {widget.description}
        </p>
      </div>

      {!dragging && (
        <span
          className={cn(
            'hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide transition-colors sm:inline-flex',
            visible
              ? 'bg-brand-accent/10 text-brand-accent'
              : 'bg-muted text-content-muted',
          )}
        >
          {visible ? <Eye className="size-3" /> : <EyeOff className="size-3" />}
          {visible ? 'Shown' : 'Hidden'}
        </span>
      )}
    </>
  );
}

function SortableRow({
  widget,
  visible,
  onToggle,
}: {
  widget: WidgetDef;
  visible: boolean;
  onToggle: (visible: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn(
        'group flex items-center gap-2.5 rounded-xl border bg-surface px-2.5 py-2.5 transition-all',
        'hover:border-brand-secondary/40 hover:shadow-pop',
        visible ? 'border-line' : 'border-line/60 bg-muted/30',
        // The original stays in place but hollowed out while its overlay flies.
        isDragging && 'opacity-40',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${widget.label}`}
        className="cursor-grab touch-none rounded p-0.5 text-content-muted/60 transition-colors hover:text-content focus-ring active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <RowBody widget={widget} visible={visible} />

      <Switch
        checked={visible}
        onCheckedChange={onToggle}
        aria-label={`Show ${widget.label}`}
        className="shrink-0"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Group
// ---------------------------------------------------------------------------
function WidgetGroupList({
  title,
  group,
  widgets,
  isVisible,
  onToggle,
  onReorder,
}: {
  title: string;
  group: WidgetGroup;
  widgets: WidgetDef[];
  isVisible: (id: WidgetId) => boolean;
  onToggle: (id: WidgetId, visible: boolean) => void;
  onReorder: (group: WidgetGroup, order: WidgetId[]) => void;
}) {
  const [activeId, setActiveId] = useState<WidgetId | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const ids = widgets.map((w) => w.id);
  const shown = widgets.filter((w) => isVisible(w.id)).length;
  const active = activeId ? WIDGET_BY_ID[activeId] : null;

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const from = ids.indexOf(a.id as WidgetId);
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
      <div className="mb-2 flex items-center gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-content-muted">
          {title}
        </h3>
        <span className="num rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-content-secondary">
          {shown}/{widgets.length}
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as WidgetId)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className="space-y-1.5">
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

        <DragOverlay>
          {active && (
            <div className="flex rotate-1 items-center gap-2.5 rounded-xl border border-brand-secondary/50 bg-surface px-2.5 py-2.5 shadow-pop">
              <GripVertical className="size-4 shrink-0 text-content-muted" />
              <RowBody widget={active} visible={isVisible(active.id)} dragging />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Dialog
// ---------------------------------------------------------------------------
interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ctx: WidgetContext;
}

export function CustomizeDashboardDialog({ open, onOpenChange, ctx }: Props) {
  const order = useDashboardStore((s) => s.order);
  const visibility = useDashboardStore((s) => s.visibility);
  const toggle = useDashboardStore((s) => s.toggle);
  const setMany = useDashboardStore((s) => s.setMany);
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

  const isVisible = (id: WidgetId) =>
    visibility[id] ?? isWidgetVisibleByDefault(id, ctx);

  const kpis = available.filter((w) => w.group === 'kpi');
  const sections = available.filter((w) => w.group === 'section');
  const shownCount = available.filter((w) => isVisible(w.id)).length;
  const pct = available.length
    ? Math.round((shownCount / available.length) * 100)
    : 0;

  const allIds = available.map((w) => w.id);
  const allShown = shownCount === available.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="xl" className="sm:max-h-[88vh]">
        <DialogHeader className="relative overflow-hidden">
          {/* subtle brand wash behind the header */}
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-r from-brand-primary/[0.06] via-transparent to-brand-secondary/[0.08]" />
          <div className="relative flex items-start gap-3">
            <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-brand-secondary text-white shadow-sm">
              <LayoutGrid className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <DialogTitle>Customise dashboard</DialogTitle>
              <DialogDescription>
                Drag to reorder, toggle to show or hide. Changes apply instantly
                and save to this browser for your account.
              </DialogDescription>
            </div>
            <div className="hidden shrink-0 items-center gap-2 sm:flex">
              <div className="text-right">
                <p className="num text-lg font-bold leading-none text-content">
                  {shownCount}
                  <span className="text-sm font-medium text-content-muted">
                    /{available.length}
                  </span>
                </p>
                <p className="text-[10px] uppercase tracking-wide text-content-muted">
                  widgets on
                </p>
              </div>
            </div>
          </div>

          {/* progress rail */}
          <div className="relative mt-3 h-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-brand-primary to-brand-secondary"
              animate={{ width: `${pct}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 30 }}
            />
          </div>
        </DialogHeader>

        <DialogBody>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
            {/* Preview column */}
            <div className="lg:sticky lg:top-0 lg:self-start">
              <LayoutPreview
                kpis={kpis.filter((w) => isVisible(w.id))}
                sections={sections.filter((w) => isVisible(w.id))}
                stateMapShown={isVisible('salesByState')}
              />
              <div className="mt-2.5 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setMany(allIds, !allShown)}
                >
                  {allShown ? <EyeOff /> : <Eye />}
                  {allShown ? 'Hide all' : 'Show all'}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    reset();
                    toast.success('Dashboard reset to default');
                  }}
                >
                  <RotateCcw /> Reset
                </Button>
              </div>
              <p className="mt-2 hidden text-center text-[11px] text-content-muted lg:block">
                This mirrors your live dashboard layout.
              </p>
            </div>

            {/* Controls column */}
            <div className="space-y-5">
              <WidgetGroupList
                title="KPI cards"
                group="kpi"
                widgets={kpis}
                isVisible={isVisible}
                onToggle={toggle}
                onReorder={reorderGroup}
              />
              <WidgetGroupList
                title="Sections"
                group="section"
                widgets={sections}
                isVisible={isVisible}
                onToggle={toggle}
                onReorder={reorderGroup}
              />
            </div>
          </div>
        </DialogBody>

        <DialogFooter className="justify-between">
          <p className="hidden text-xs text-content-muted sm:block">
            Saved automatically · only you see this layout
          </p>
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

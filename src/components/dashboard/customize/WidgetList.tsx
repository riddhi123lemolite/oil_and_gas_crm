import { useState } from 'react';
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
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, EyeOff, GripVertical, Search } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { WIDGET_BY_ID, type WidgetDef, type WidgetGroup, type WidgetId } from '@/lib/dashboard/widgets';
import { cn } from '@/lib/utils';

function RowFace({
  widget,
  visible,
  overlay,
}: {
  widget: WidgetDef;
  visible: boolean;
  overlay?: boolean;
}) {
  const Icon = widget.icon;
  return (
    <>
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg transition-all',
          !visible && 'opacity-45 grayscale',
        )}
        style={{ background: `${widget.accent}1A`, color: widget.accent }}
      >
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <p
          className={cn(
            'truncate text-sm font-semibold',
            visible ? 'text-content' : 'text-content-secondary',
          )}
        >
          {widget.label}
        </p>
        {/* content-secondary, not content-muted: this is the text that explains
            what the widget does, and muted falls below WCAG AA in dark mode. */}
        <p className="truncate text-xs leading-relaxed text-content-secondary">
          {widget.description}
        </p>
      </div>

      {!overlay && (
        <span
          className={cn(
            'hidden shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide md:inline-flex',
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
  onHover,
}: {
  widget: WidgetDef;
  visible: boolean;
  onToggle: (v: boolean) => void;
  onHover: (id: WidgetId | null) => void;
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
      onMouseEnter={() => onHover(widget.id)}
      onMouseLeave={() => onHover(null)}
      className={cn(
        // Glass tile: translucent surface over the panel's blur, lifting on hover.
        'group flex items-center gap-3 rounded-xl border p-2.5',
        'backdrop-blur-sm transition-all duration-200 ease-out',
        'hover:-translate-y-px hover:border-brand-secondary/50 hover:shadow-pop',
        visible
          ? 'glass-tile border-white/40 dark:border-white/10'
          : 'glass-tile-dim border-white/25 dark:border-white/[0.06]',
        isDragging && 'opacity-40',
      )}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${widget.label}`}
        // 36px square: a comfortable touch target on mobile without changing
        // the icon's visual weight.
        className="-ml-1 flex size-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-content-muted/50 transition-colors hover:bg-muted hover:text-content focus-ring active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <RowFace widget={widget} visible={visible} />

      <Switch
        checked={visible}
        onCheckedChange={onToggle}
        aria-label={`Show ${widget.label}`}
        className="shrink-0"
      />
    </div>
  );
}

interface Props {
  group: WidgetGroup;
  widgets: WidgetDef[];
  isVisible: (id: WidgetId) => boolean;
  onToggle: (id: WidgetId, visible: boolean) => void;
  onReorder: (group: WidgetGroup, order: WidgetId[]) => void;
  onSetMany: (ids: WidgetId[], visible: boolean) => void;
  onHover: (id: WidgetId | null) => void;
  /** Shown above the list — what this group controls and where it appears. */
  hint: string;
}

export function WidgetList({
  group,
  widgets,
  isVisible,
  onToggle,
  onReorder,
  onSetMany,
  onHover,
  hint,
}: Props) {
  const [activeId, setActiveId] = useState<WidgetId | null>(null);
  const [query, setQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = widgets.map((w) => w.id);
  const shown = widgets.filter((w) => isVisible(w.id)).length;
  const active = activeId ? WIDGET_BY_ID[activeId] : null;

  const q = query.trim().toLowerCase();
  const filtered = q
    ? widgets.filter(
        (w) =>
          w.label.toLowerCase().includes(q) ||
          w.description.toLowerCase().includes(q),
      )
    : widgets;

  // Dragging is disabled while filtering — indices in a filtered list don't map
  // back to the real order, and a silently wrong reorder is worse than none.
  const filtering = q.length > 0;

  function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    const from = ids.indexOf(a.id as WidgetId);
    const to = ids.indexOf(over.id as WidgetId);
    if (from === -1 || to === -1) return;
    onReorder(group, arrayMove(ids, from, to));
  }

  const allOn = shown === widgets.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="flex-1 text-xs leading-relaxed text-content-secondary">
          {hint}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSetMany(ids, !allOn)}
        >
          {allOn ? <EyeOff /> : <Eye />}
          {allOn ? 'Hide all' : 'Show all'}
        </Button>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-content-muted" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${widgets.length} widgets…`}
          aria-label="Search widgets"
          className="h-10 w-full rounded-xl border glass-soft border-white/40 pl-9 pr-3 text-sm text-content backdrop-blur-sm transition-colors placeholder:text-content-muted focus-ring dark:border-white/10"
        />
      </div>

      {filtering && (
        <p className="text-[11px] text-content-muted">
          {filtered.length} match{filtered.length === 1 ? '' : 'es'} · clear the
          search to drag and reorder
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(e: DragStartEvent) => setActiveId(e.active.id as WidgetId)}
        onDragCancel={() => setActiveId(null)}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filtering ? [] : ids}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {filtered.map((w) => (
              <SortableRow
                key={w.id}
                widget={w}
                visible={isVisible(w.id)}
                onToggle={(v) => onToggle(w.id, v)}
                onHover={onHover}
              />
            ))}
            {filtered.length === 0 && (
              <p className="rounded-xl border border-dashed border-line py-8 text-center text-sm text-content-muted">
                No widgets match “{query}”.
              </p>
            )}
          </div>
        </SortableContext>

        <DragOverlay>
          {active && (
            <div className="flex rotate-1 items-center gap-3 rounded-xl border glass-strong border-brand-secondary/60 p-2.5 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <GripVertical className="size-4 shrink-0 text-content-muted" />
              <RowFace widget={active} visible={isVisible(active.id)} overlay />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

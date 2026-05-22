import { useState, type ReactNode } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { cn } from '@/lib/utils';

export interface KanbanColumn {
  id: string;
  label: string;
  color: string;
}

interface KanbanBoardProps<T> {
  columns: KanbanColumn[];
  items: T[];
  getItemId: (item: T) => string;
  getColumnId: (item: T) => string;
  renderCard: (item: T) => ReactNode;
  columnSummary?: (items: T[]) => string;
  onMove: (itemId: string, toColumnId: string) => void;
}

function DraggableCard({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        'cursor-grab touch-none active:cursor-grabbing',
        isDragging && 'opacity-30',
      )}
    >
      {children}
    </div>
  );
}

function DroppableColumn({
  column,
  count,
  summary,
  children,
}: {
  column: KanbanColumn;
  count: number;
  summary?: string;
  children: ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <div className="flex w-72 shrink-0 flex-col">
      <div className="mb-2 flex items-center gap-2 px-1">
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: column.color }}
        />
        <span className="text-sm font-semibold text-content">
          {column.label}
        </span>
        <span className="num rounded-full bg-muted px-1.5 text-xs font-medium text-content-muted">
          {count}
        </span>
        {summary && (
          <span className="num ml-auto text-xs text-content-muted">
            {summary}
          </span>
        )}
      </div>
      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 space-y-2 rounded-lg border border-dashed p-2 transition-colors',
          isOver
            ? 'border-brand-secondary bg-brand-secondary/5'
            : 'border-line bg-muted',
        )}
      >
        {children}
        {count === 0 && (
          <div className="py-6 text-center text-xs text-content-muted">
            Drop cards here
          </div>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard<T>({
  columns,
  items,
  getItemId,
  getColumnId,
  renderCard,
  columnSummary,
  onMove,
}: KanbanBoardProps<T>) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const activeItem = items.find((i) => getItemId(i) === activeId);

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;
    const itemId = String(active.id);
    const toColumn = String(over.id);
    const item = items.find((i) => getItemId(i) === itemId);
    if (item && getColumnId(item) !== toColumn) {
      onMove(itemId, toColumn);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={(e: DragStartEvent) => setActiveId(String(e.active.id))}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="flex gap-3 overflow-x-auto pb-3">
        {columns.map((column) => {
          const colItems = items.filter(
            (i) => getColumnId(i) === column.id,
          );
          return (
            <DroppableColumn
              key={column.id}
              column={column}
              count={colItems.length}
              summary={columnSummary?.(colItems)}
            >
              {colItems.map((item) => (
                <DraggableCard key={getItemId(item)} id={getItemId(item)}>
                  {renderCard(item)}
                </DraggableCard>
              ))}
            </DroppableColumn>
          );
        })}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div className="rotate-2 opacity-95">{renderCard(activeItem)}</div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

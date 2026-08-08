"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (nextItems: T[]) => void;
  children: (item: T, index: number) => React.ReactNode;
  className?: string;
}

/** Drag-and-drop reorderable list. Persist the new order in `onReorder`. */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
  className,
}: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((item) => item.id === active.id);
    const newIndex = items.findIndex((item) => item.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((item) => item.id)} strategy={verticalListSortingStrategy}>
        <div className={className}>{items.map((item, index) => children(item, index))}</div>
      </SortableContext>
    </DndContext>
  );
}

interface DragHandleRenderProps {
  setActivatorNodeRef: (element: HTMLElement | null) => void;
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: Record<string, unknown> | undefined;
}

interface SortableItemProps {
  id: string;
  className?: string;
  children: (drag: DragHandleRenderProps) => React.ReactNode;
}

/** One row inside a `SortableList`. Exposes drag-handle props via render prop so the handle can sit anywhere in the row. */
export function SortableItem({ id, className, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className={className}>
      {children({ setActivatorNodeRef, attributes, listeners })}
    </div>
  );
}

export function DragHandle({ setActivatorNodeRef, attributes, listeners, className }: DragHandleRenderProps & { className?: string }) {
  return (
    <button
      type="button"
      ref={setActivatorNodeRef}
      {...attributes}
      {...listeners}
      className={cn(
        "flex shrink-0 cursor-grab touch-none items-center justify-center rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing",
        className
      )}
      aria-label="Drag to reorder"
    >
      <GripVertical className="size-4" aria-hidden="true" />
    </button>
  );
}

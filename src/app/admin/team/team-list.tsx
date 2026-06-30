"use client";

// 2.3:現役成員後台列表(可拖曳排序)。拖曳左側握把調整順序,放開即以 reorderTeam 存檔。
// 每列沿用共用的 StatusBadge / ContentRowActions(編輯·發布·刪除)。

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ContentRowActions, StatusBadge } from "../content-row-actions";
import { reorderTeam } from "./actions";

export interface TeamRow {
  id: string;
  name: string;
  tier: string;
  researchTopic: string | null;
  status: "DRAFT" | "PUBLISHED";
}

const TIER_LABEL: Record<string, string> = {
  POSTDOC: "博後",
  PHD: "博士生",
  MASTER: "碩士生",
  UNDERGRAD: "專題生",
};

function Row({ item }: { item: TeamRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-start justify-between gap-4 bg-background py-4"
    >
      <div className="flex min-w-0 items-start gap-3">
        <button
          type="button"
          {...attributes}
          {...listeners}
          aria-label="拖曳排序"
          className="mt-0.5 shrink-0 cursor-grab touch-none px-1 text-muted hover:text-foreground active:cursor-grabbing"
        >
          ⠿
        </button>
        <div className="min-w-0">
          <StatusBadge status={item.status} />
          <p className="mt-1 text-sm font-medium">{item.name}</p>
          <p className="text-xs text-muted">
            {TIER_LABEL[item.tier] ?? item.tier}
            {item.researchTopic ? ` · ${item.researchTopic}` : ""}
          </p>
        </div>
      </div>
      <ContentRowActions
        model="teamMember"
        id={item.id}
        status={item.status}
        deleted={false}
        editPath={`/admin/team/${item.id}`}
        listPath="/admin/team"
      />
    </li>
  );
}

export function TeamList({ initial }: { initial: TeamRow[] }) {
  const [items, setItems] = useState(initial);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next); // 樂觀更新
    setSaving(true);
    reorderTeam(next.map((i) => i.id))
      .catch(() => undefined)
      .finally(() => {
        setSaving(false);
        router.refresh();
      });
  }

  if (items.length === 0)
    return <p className="text-sm text-muted">尚無內容。</p>;

  return (
    <div>
      <p className="mb-2 text-xs text-muted">
        拖曳左側握把(⠿)調整顯示順序{saving ? " ·儲存中…" : ""}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={items.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          <ul className="divide-y divide-line border-y border-line">
            {items.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

"use client";

// 通用「可拖曳排序」後台列表外殼(client)。等同 AdminListShell,但用拖曳調整 sortOrder。
// 列以可序列化資料描述(primary/secondary/group),避免跨 server→client 傳函式。
// 自動帶 StatusBadge + ContentRowActions(編輯/發布/刪除);可選分組(僅同組內拖曳)。

import { useState } from "react";
import Link from "next/link";
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
import { ContentRowActions, StatusBadge } from "./content-row-actions";
import { reorderContent } from "./content-actions";

export interface SortableRow {
  id: string;
  status: "DRAFT" | "PUBLISHED";
  primary: string;
  secondary?: string | null;
  group?: string;
}

function Row({
  item,
  model,
  basePath,
}: {
  item: SortableRow;
  model: string;
  basePath: string;
}) {
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
          <p className="mt-1 text-sm font-medium">{item.primary}</p>
          {item.secondary && (
            <p className="text-xs text-muted">{item.secondary}</p>
          )}
        </div>
      </div>
      <ContentRowActions
        model={model}
        id={item.id}
        status={item.status}
        deleted={false}
        editPath={`${basePath}/${item.id}`}
        listPath={basePath}
      />
    </li>
  );
}

export function SortableAdminList({
  title,
  basePath,
  model,
  items: initial,
  deleted,
  groups,
  newLabel = "新增",
}: {
  title: string;
  basePath: string;
  model: string;
  items: SortableRow[];
  deleted: { id: string; status: "DRAFT" | "PUBLISHED"; label: string }[];
  groups?: { key: string; label: string }[];
  newLabel?: string;
}) {
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
    // 有分組時,僅允許同組內排序。
    if (groups) {
      const ag = items.find((i) => i.id === active.id)?.group;
      const og = items.find((i) => i.id === over.id)?.group;
      if (ag !== og) return;
    }
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setSaving(true);
    reorderContent(
      model,
      next.map((i) => i.id),
    )
      .catch(() => undefined)
      .finally(() => {
        setSaving(false);
        router.refresh();
      });
  }

  // 分組或單一列表的渲染區塊。
  const sections = groups
    ? groups
        .map((g) => ({ ...g, rows: items.filter((i) => i.group === g.key) }))
        .filter((g) => g.rows.length > 0)
    : [{ key: "__all__", label: "", rows: items }];

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Link
          href={`${basePath}/new`}
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          {newLabel}
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted">尚無內容。</p>
      ) : (
        <div className="space-y-6">
          <p className="text-xs text-muted">
            拖曳左側握把(⠿)調整顯示順序
            {groups ? "(僅同分類內)" : ""}
            {saving ? " ·儲存中…" : ""}
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
          >
            {sections.map((s) => (
              <div key={s.key}>
                {s.label && (
                  <h2 className="mb-2 text-sm font-semibold text-accent">
                    {s.label}
                  </h2>
                )}
                <SortableContext
                  items={s.rows.map((i) => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="divide-y divide-line border-y border-line">
                    {s.rows.map((item) => (
                      <Row
                        key={item.id}
                        item={item}
                        model={model}
                        basePath={basePath}
                      />
                    ))}
                  </ul>
                </SortableContext>
              </div>
            ))}
          </DndContext>
        </div>
      )}

      {deleted.length > 0 && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer text-sm text-muted">
            已刪除({deleted.length})
          </summary>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {deleted.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="min-w-0 truncate text-sm text-muted line-through">
                  {d.label}
                </span>
                <ContentRowActions
                  model={model}
                  id={d.id}
                  status={d.status}
                  deleted
                  editPath=""
                  listPath={basePath}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

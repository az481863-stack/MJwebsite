"use client";

// 儀器管理後台列表(ADMIN 可拖曳排序)。拖曳左側握把調整順序,放開即以 reorderInstruments 存檔。
// 每列含綜覽/編輯/刪除操作(沿用 DeleteInstrumentButton)。負責人(非 ADMIN)不使用此元件。

import { useState } from "react";
import Image from "next/image";
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
import { DeleteInstrumentButton } from "./row-actions";
import { reorderInstruments } from "./actions";

export interface InstrumentRow {
  id: string;
  name: string;
  maintenance: boolean;
  photoUrl: string | null;
  inUse: number;
  overdue: number;
  managerEmails: string[];
}

function Row({ item }: { item: InstrumentRow }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="border border-line bg-background p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            {...attributes}
            {...listeners}
            aria-label="拖曳排序"
            className="mt-1 shrink-0 cursor-grab touch-none px-1 text-muted hover:text-foreground active:cursor-grabbing"
          >
            ⠿
          </button>
          {item.photoUrl ? (
            <Image
              src={item.photoUrl}
              alt={item.name}
              width={80}
              height={60}
              unoptimized
              className="h-16 w-20 shrink-0 border border-line object-cover"
            />
          ) : (
            <div className="flex h-16 w-20 shrink-0 items-center justify-center border border-line bg-foreground/[0.03] text-xs text-muted">
              無圖
            </div>
          )}
          <div className="min-w-0">
            <Link
              href={`/admin/instruments/${item.id}`}
              className="font-medium underline-offset-4 hover:underline"
            >
              {item.maintenance ? "🟡" : "🟢"} {item.name}
            </Link>
            <p className="mt-1 text-sm text-muted">
              使用中 {item.inUse} · 逾時未簽退 {item.overdue}
            </p>
            <p className="mt-1 text-xs text-muted">
              負責人:
              {item.managerEmails.length
                ? item.managerEmails.join("、")
                : "(未指派)"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
          <Link
            href={`/admin/instruments/${item.id}`}
            className="text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            綜覽
          </Link>
          <Link
            href={`/admin/instruments/${item.id}/edit`}
            className="text-muted underline-offset-4 hover:text-foreground hover:underline"
          >
            編輯
          </Link>
          <DeleteInstrumentButton instrumentId={item.id} />
        </div>
      </div>
    </li>
  );
}

export function InstrumentAdminList({ initial }: { initial: InstrumentRow[] }) {
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
    setItems(next);
    setSaving(true);
    reorderInstruments(next.map((i) => i.id))
      .catch(() => undefined)
      .finally(() => {
        setSaving(false);
        router.refresh();
      });
  }

  if (items.length === 0)
    return (
      <p className="mt-6 border border-line p-6 text-sm text-muted">
        尚無儀器。點右上角「新增儀器」開始。
      </p>
    );

  return (
    <div className="mt-6">
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
          <ul className="space-y-3">
            {items.map((item) => (
              <Row key={item.id} item={item} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </div>
  );
}

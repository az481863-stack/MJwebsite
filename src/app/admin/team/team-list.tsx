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
  PI: "實驗室主持人",
  PROFESSOR: "教授",
  DISTINGUISHED_PROFESSOR: "特聘教授",
  EMERITUS_PROFESSOR: "名譽教授",
  ASSOC_PROFESSOR: "副教授",
  ASST_PROFESSOR: "助理教授",
  VISITING_PROFESSOR: "客座教授",
  ADJUNCT_PROFESSOR: "兼任教授",
  COLLABORATING_PROFESSOR: "合作教授",
  POSTDOC: "博後",
  STAFF: "專任助理",
  PHD: "博士生",
  MASTER: "碩士生",
  UNDERGRAD: "專題生",
};

// 分層顯示順序(與前台、後台下拉一致)。
const TIER_ORDER = Object.keys(TIER_LABEL);

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
          {item.researchTopic && (
            <p className="text-xs text-muted">{item.researchTopic}</p>
          )}
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
    // 僅允許同層級內排序(層級是身份,不由拖曳改變)。
    const activeTier = items.find((i) => i.id === active.id)?.tier;
    const overTier = items.find((i) => i.id === over.id)?.tier;
    if (!activeTier || activeTier !== overTier) return;
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

  // 依層級分組(層級內保持目前順序 = sortOrder)。
  const groups = TIER_ORDER.map((tier) => ({
    tier,
    members: items.filter((i) => i.tier === tier),
  })).filter((g) => g.members.length > 0);

  return (
    <div className="space-y-6">
      <p className="text-xs text-muted">
        拖曳左側握把(⠿)調整同一層級內的順序{saving ? " ·儲存中…" : ""}
      </p>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        {groups.map((g) => (
          <div key={g.tier}>
            <h2 className="mb-2 text-sm font-semibold text-accent">
              {TIER_LABEL[g.tier] ?? g.tier}
            </h2>
            <SortableContext
              items={g.members.map((i) => i.id)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="divide-y divide-line border-y border-line">
                {g.members.map((item) => (
                  <Row key={item.id} item={item} />
                ))}
              </ul>
            </SortableContext>
          </div>
        ))}
      </DndContext>
    </div>
  );
}

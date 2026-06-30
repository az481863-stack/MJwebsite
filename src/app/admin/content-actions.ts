"use server";

// 通用內容操作(9 種內容共用):發布 / 退回草稿 / 軟刪除 / 還原。
// 一律需 ADMIN 以上(學生只能建/改自己的草稿,不能發布或刪除)。

import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  ok: boolean;
  message: string;
}

// 允許操作的內容模型(對應 prisma delegate 名稱)。
const MODELS = [
  "dashboardPost",
  "publication",
  "teamMember",
  "alumnus",
  "jobOpening",
  "blogPost",
  "course",
  "industryItem",
  "highSchoolMessage",
] as const;
type ContentModel = (typeof MODELS)[number];

function getDelegate(model: string) {
  if (!MODELS.includes(model as ContentModel)) return null;
  // 各 delegate 介面一致(update),以單一函式統一操作。
  return (prisma as unknown as Record<string, {
    update: (args: unknown) => Promise<unknown>;
  }>)[model];
}

async function mutate(
  formData: FormData,
  data: Record<string, unknown>,
  successMsg: string,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }
  const model = String(formData.get("model") ?? "");
  const id = String(formData.get("id") ?? "");
  const delegate = getDelegate(model);
  if (!delegate || !id) {
    return { ok: false, message: "參數錯誤。" };
  }

  await delegate.update({
    where: { id },
    data: { ...data, updatedBy: me.id },
  });

  // 重新驗證後台列表與前台(小站直接整站 revalidate 最簡單可靠)。
  const path = String(formData.get("path") ?? "");
  if (path) revalidatePath(path);
  revalidatePath("/", "layout");

  return { ok: true, message: successMsg };
}

// 通用拖曳排序:依傳入順序把各筆 sortOrder 設為索引。需 ADMIN 以上。
export async function reorderContent(
  model: string,
  orderedIds: string[],
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }
  const delegate = getDelegate(model);
  if (!delegate) return { ok: false, message: "參數錯誤。" };
  const ids = orderedIds.filter((id) => typeof id === "string" && id);
  if (ids.length === 0) return { ok: false, message: "順序資料無效。" };

  await Promise.all(
    ids.map((id, i) =>
      delegate.update({
        where: { id },
        data: { sortOrder: i, updatedBy: me.id },
      }),
    ),
  );
  revalidatePath("/", "layout");
  return { ok: true, message: "順序已更新。" };
}

export async function publishContent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return mutate(formData, { status: "PUBLISHED" }, "已發布。");
}

export async function unpublishContent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return mutate(formData, { status: "DRAFT" }, "已退回草稿。");
}

export async function softDeleteContent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  return mutate(
    formData,
    { deletedAt: new Date(), deletedBy: me?.id },
    "已刪除(可於已刪除清單還原)。",
  );
}

export async function restoreContent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  return mutate(formData, { deletedAt: null, deletedBy: null }, "已還原。");
}

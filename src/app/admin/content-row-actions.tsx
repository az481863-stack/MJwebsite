"use client";

// 內容列表每列的共用操作:編輯、發布/退回草稿、刪除/還原。
// 透過通用 content-actions 操作(需 ADMIN 以上;學生不會看到這些列表)。

import Link from "next/link";
import { useActionState } from "react";
import {
  publishContent,
  restoreContent,
  softDeleteContent,
  unpublishContent,
  type ActionResult,
} from "./content-actions";

function HiddenFields({
  model,
  id,
  path,
}: {
  model: string;
  id: string;
  path: string;
}) {
  return (
    <>
      <input type="hidden" name="model" value={model} />
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="path" value={path} />
    </>
  );
}

const btn =
  "border border-line px-2.5 py-1 text-xs transition-colors hover:bg-foreground hover:text-background";

export function ContentRowActions({
  model,
  id,
  status,
  deleted,
  editPath,
  listPath,
  canManage = true,
}: {
  model: string;
  id: string;
  status: "DRAFT" | "PUBLISHED";
  deleted: boolean;
  editPath: string;
  listPath: string;
  canManage?: boolean; // false:學生僅能編輯自己的草稿,不能發布/刪除
}) {
  const [pubState, publish] = useActionState<ActionResult | null, FormData>(
    publishContent,
    null,
  );
  const [unpubState, unpublish] = useActionState<ActionResult | null, FormData>(
    unpublishContent,
    null,
  );
  const [delState, del] = useActionState<ActionResult | null, FormData>(
    softDeleteContent,
    null,
  );
  const [resState, restore] = useActionState<ActionResult | null, FormData>(
    restoreContent,
    null,
  );

  const err =
    [pubState, unpubState, delState, resState].find((s) => s && !s.ok)
      ?.message ?? null;

  if (deleted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <form action={restore}>
          <HiddenFields model={model} id={id} path={listPath} />
          <button className={btn}>還原</button>
        </form>
        {err && <span className="text-xs text-red-600">{err}</span>}
      </div>
    );
  }

  // 學生:僅顯示編輯(自己的草稿),不能發布/刪除。
  if (!canManage) {
    return (
      <div className="flex items-center justify-end">
        <Link href={editPath} className={btn}>
          編輯
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Link href={editPath} className={btn}>
        編輯
      </Link>
      {status === "DRAFT" ? (
        <form action={publish}>
          <HiddenFields model={model} id={id} path={listPath} />
          <button className={btn}>發布</button>
        </form>
      ) : (
        <form action={unpublish}>
          <HiddenFields model={model} id={id} path={listPath} />
          <button className={btn}>退回草稿</button>
        </form>
      )}
      <form action={del}>
        <HiddenFields model={model} id={id} path={listPath} />
        <button className={`${btn} text-red-600 hover:bg-red-600`}>刪除</button>
      </form>
      {err && <span className="w-full text-right text-xs text-red-600">{err}</span>}
    </div>
  );
}

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs ${
        status === "PUBLISHED"
          ? "bg-foreground text-background"
          : "border border-line text-muted"
      }`}
    >
      {status === "PUBLISHED" ? "已發布" : "草稿"}
    </span>
  );
}

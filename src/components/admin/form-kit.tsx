"use client";

// 後台表單共用零件:統一樣式 + 處理 useActionState、發布勾選、錯誤、送出鈕。
// 各內容類型只需提供欄位,大幅減少重複。

import { useActionState } from "react";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export const fieldCls =
  "mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong";
export const labelCls = "block text-sm font-medium";

export function Labeled({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
    </div>
  );
}

// 表單外殼:edit 時帶 id(隱藏欄);create 時顯示「立即發布」勾選。
export function ContentFormShell({
  action,
  id,
  submitLabel,
  canPublish = true,
  children,
}: {
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  id?: string;
  submitLabel?: string;
  canPublish?: boolean; // false:學生建立時不顯示「立即發布」(一律存草稿)
  children: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {id && <input type="hidden" name="id" value={id} />}
      {children}

      {!id && canPublish && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" />
          建立後立即發布(否則存為草稿)
        </label>
      )}
      {!id && !canPublish && (
        <p className="text-xs text-muted">
          將存為草稿,送出後由管理員審核發布。
        </p>
      )}

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "儲存中…" : submitLabel ?? (id ? "儲存變更" : "建立")}
      </button>
    </form>
  );
}

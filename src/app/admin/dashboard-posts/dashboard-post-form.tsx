"use client";

// 動態佈告欄 新增/編輯 共用表單。

import { useActionState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import type { ActionResult } from "./actions";

export interface DashboardPostInitial {
  id: string;
  category: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  publishedDate: string; // YYYY-MM-DD
}

const field =
  "mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong";
const label = "block text-sm font-medium";

export function DashboardPostForm({
  action,
  initial,
}: {
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  initial?: DashboardPostInitial;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(action, null);

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div>
        <label className={label} htmlFor="category">
          分類
        </label>
        <select
          id="category"
          name="category"
          defaultValue={initial?.category ?? "ACADEMIC"}
          className={field}
        >
          <option value="ACADEMIC">學術快報</option>
          <option value="LAB_LIFE">實驗室日常</option>
          <option value="HONOR">榮譽榜</option>
        </select>
      </div>

      <div>
        <label className={label} htmlFor="title">
          標題
        </label>
        <input id="title" name="title" required defaultValue={initial?.title} className={field} />
      </div>

      <div>
        <label className={label} htmlFor="body">
          內文
        </label>
        <textarea
          id="body"
          name="body"
          required
          rows={4}
          defaultValue={initial?.body}
          className={field}
        />
      </div>

      <div>
        <label className={label} htmlFor="publishedDate">
          發布日期
        </label>
        <input
          id="publishedDate"
          name="publishedDate"
          type="date"
          required
          defaultValue={initial?.publishedDate}
          className={field}
        />
      </div>

      <ImageUpload name="imageUrl" folder="dashboard" defaultUrl={initial?.imageUrl} />

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={label} htmlFor="linkUrl">
            連結網址(選填)
          </label>
          <input id="linkUrl" name="linkUrl" defaultValue={initial?.linkUrl ?? ""} className={field} />
        </div>
        <div>
          <label className={label} htmlFor="linkText">
            連結文字(選填)
          </label>
          <input id="linkText" name="linkText" defaultValue={initial?.linkText ?? ""} className={field} />
        </div>
      </div>

      {!initial && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publish" />
          建立後立即發布(否則存為草稿)
        </label>
      )}

      {state && !state.ok && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "儲存中…" : initial ? "儲存變更" : "建立"}
      </button>
    </form>
  );
}

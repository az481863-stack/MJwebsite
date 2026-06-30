"use client";

// 動態佈告欄 新增/編輯 共用表單。中文欄位手填,英文欄位可「一鍵翻譯」後微調(留空則前台 fallback 中文)。

import { useActionState, useRef, useState } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";
import { TranslateButton } from "@/components/admin/TranslateButton";
import type { ActionResult } from "./actions";

export interface DashboardPostInitial {
  id: string;
  category: string;
  title: string;
  titleEn: string | null;
  body: string;
  bodyEn: string | null;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  linkTextEn: string | null;
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

  const formRef = useRef<HTMLFormElement>(null);
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [bodyEn, setBodyEn] = useState(initial?.bodyEn ?? "");
  const [linkTextEn, setLinkTextEn] = useState(initial?.linkTextEn ?? "");

  function collect() {
    const fd = new FormData(formRef.current!);
    return {
      title: String(fd.get("title") ?? ""),
      body: String(fd.get("body") ?? ""),
      linkText: String(fd.get("linkText") ?? ""),
    };
  }
  function apply(out: Record<string, string>) {
    if (out.title != null) setTitleEn(out.title);
    if (out.body != null) setBodyEn(out.body);
    if (out.linkText != null) setLinkTextEn(out.linkText);
  }

  return (
    <form ref={formRef} action={formAction} className="max-w-xl space-y-5">
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

      <div className="border-y border-line py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">英文版(切換 EN 時顯示;留空則沿用中文)</p>
          <TranslateButton collect={collect} apply={apply} />
        </div>
        <div className="mt-3 space-y-3">
          <div>
            <label className={label} htmlFor="titleEn">
              Title (English)
            </label>
            <input
              id="titleEn"
              name="titleEn"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="bodyEn">
              Body (English)
            </label>
            <textarea
              id="bodyEn"
              name="bodyEn"
              rows={4}
              value={bodyEn}
              onChange={(e) => setBodyEn(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className={label} htmlFor="linkTextEn">
              Link text (English)
            </label>
            <input
              id="linkTextEn"
              name="linkTextEn"
              value={linkTextEn}
              onChange={(e) => setLinkTextEn(e.target.value)}
              className={field}
            />
          </div>
        </div>
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

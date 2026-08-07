"use client";

// QR Code 新增/編輯表單(限最高權限者)。非草稿/審核內容,故自帶簡易 shell
// (比照儀器表單,不沿用 ContentFormShell 的發布/草稿訊息)。

import { useActionState } from "react";
import { Labeled, fieldCls, type ActionResult } from "@/components/admin/form-kit";

export interface QrCodeInitial {
  id: string;
  label: string;
  targetUrl: string;
  expiresAt: string; // yyyy-mm-dd,空字串 = 永久
}

export function QrCodeForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: QrCodeInitial;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Labeled label="名稱/用途" htmlFor="label">
        <input
          id="label"
          name="label"
          required
          placeholder="例:實驗室開放日報名表"
          defaultValue={initial?.label}
          className={fieldCls}
        />
      </Labeled>
      <p className="-mt-2 text-xs text-muted">僅供後台辨識,不會顯示給掃碼的人。</p>

      <Labeled label="目標網址" htmlFor="targetUrl">
        <input
          id="targetUrl"
          name="targetUrl"
          required
          type="url"
          placeholder="https://example.com/form"
          defaultValue={initial?.targetUrl}
          className={fieldCls}
        />
      </Labeled>
      <p className="-mt-2 text-xs text-muted">
        掃碼者會先經過本站的短網址再轉到這裡(這樣才能計數)。
        {initial?.id
          ? "目標網址可隨時修改,已印出的 QR Code 不必重印。"
          : "建立後可隨時修改目標網址,QR 圖片不會改變。"}
      </p>

      <Labeled label="到期日(選填)" htmlFor="expiresAt">
        <input
          id="expiresAt"
          name="expiresAt"
          type="date"
          defaultValue={initial?.expiresAt}
          className={fieldCls}
        />
      </Labeled>
      <p className="-mt-2 text-xs text-muted">
        留空 = 永久有效。設定後於該日結束(台灣時間 23:59)後失效,掃碼者會看到「已失效」說明頁。
      </p>

      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "儲存中…" : initial?.id ? "儲存變更" : "建立"}
      </button>
    </form>
  );
}

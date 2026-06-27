"use client";

// 階段六:「AI 快速新增」入口。上傳 Word(.docx)→ 呼叫對應 server action →
// 成功則 action 直接 redirect 到新草稿的編輯頁;失敗顯示錯誤訊息。
// 僅在 AI 啟用時由父層渲染;AI 關閉時完全不出現,手填「新增」照常。

import { useActionState } from "react";

interface ActionResult {
  ok: boolean;
  message: string;
}

export function WordQuickAdd({
  action,
  hint,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  hint: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form
      action={formAction}
      className="rounded-sm border border-dashed border-line-strong bg-foreground/[0.02] p-4"
    >
      <p className="text-sm font-medium">✦ AI 快速新增</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          type="file"
          name="file"
          accept=".docx"
          required
          className="block text-sm text-muted file:mr-3 file:border file:border-line file:bg-background file:px-3 file:py-1.5 file:text-sm hover:file:bg-foreground hover:file:text-background"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "AI 解析中…" : "上傳並產生草稿"}
        </button>
      </div>
      {state && !state.ok && (
        <p className="mt-2 text-sm text-red-600">{state.message}</p>
      )}
      <p className="mt-2 text-xs text-muted">
        產出一律為草稿,需人工審核後才會發布。
      </p>
    </form>
  );
}

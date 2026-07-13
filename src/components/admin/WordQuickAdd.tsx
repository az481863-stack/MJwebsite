"use client";

// 階段六:「AI 快速新增」入口。上傳 Word(.docx)→ AI 產生草稿。
//
// 為突破 Vercel 函式 4.5MB 的 body 硬上限,檔案不再穿過 server action:
// 1) 向 server 要一個「簽章上傳網址」(極小請求);
// 2) 瀏覽器用該網址把 .docx 直傳 Supabase Storage(不經 Vercel 函式);
// 3) 只把檔案 path 交給處理 action → 它下載解析、建 DRAFT、redirect 到編輯頁。
// 僅在 AI 啟用時由父層渲染;AI 關閉時完全不出現,手填「新增」照常。

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { createDocxUploadUrl } from "@/app/admin/docx-upload-actions";

interface ActionResult {
  ok: boolean;
  message: string;
}

const DOCX_BUCKET = "media";

// Supabase Storage 免費層單檔上限 50MB;此處保守設 30MB。
const MAX_BYTES = 30 * 1024 * 1024;

export function WordQuickAdd({
  action,
  hint,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  hint: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [phase, setPhase] = useState<"upload" | "parse">("upload");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = inputRef.current?.files?.[0];
    if (!file) return setError("請選擇一個 Word(.docx)檔。");
    if (!file.name.toLowerCase().endsWith(".docx"))
      return setError("僅支援 .docx 檔。");
    if (file.size > MAX_BYTES) return setError("檔案過大(超過 30MB)。");

    setPending(true);
    try {
      // 1) 取簽章上傳網址。
      setPhase("upload");
      const signed = await createDocxUploadUrl();
      if (!signed.ok || !signed.path || !signed.token) {
        setPending(false);
        return setError(signed.message ?? "無法建立上傳連結。");
      }

      // 2) 直傳 Storage(繞過 Vercel 4.5MB 上限)。
      const supabase = createClient();
      const { error: upErr } = await supabase.storage
        .from(DOCX_BUCKET)
        .uploadToSignedUrl(signed.path, signed.token, file);
      if (upErr) {
        setPending(false);
        return setError("上傳失敗,請再試一次。");
      }

      // 3) 只送 path 給處理 action;成功時它會 redirect(不返回),失敗才有回傳。
      setPhase("parse");
      const fd = new FormData();
      fd.set("path", signed.path);
      const res = await action(null, fd);
      if (res && !res.ok) {
        setError(res.message);
        setPending(false);
      }
    } catch (err) {
      // action 的 redirect() 以特殊例外實作,需重新拋出讓 Next 完成導頁。
      if (
        err &&
        typeof err === "object" &&
        "digest" in err &&
        typeof (err as { digest?: unknown }).digest === "string" &&
        (err as { digest: string }).digest.startsWith("NEXT_REDIRECT")
      ) {
        throw err;
      }
      setError(err instanceof Error ? err.message : "發生錯誤,請再試一次。");
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-sm border border-dashed border-line-strong bg-foreground/[0.02] p-4"
    >
      <p className="text-sm font-medium">✦ AI 快速新增</p>
      <p className="mt-1 text-xs text-muted">{hint}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".docx"
          required
          disabled={pending}
          className="block text-sm text-muted file:mr-3 file:border file:border-line file:bg-background file:px-3 file:py-1.5 file:text-sm hover:file:bg-foreground hover:file:text-background"
        />
        <button
          type="submit"
          disabled={pending}
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending
            ? phase === "upload"
              ? "上傳中…"
              : "AI 解析中…"
            : "上傳並產生草稿"}
        </button>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <p className="mt-2 text-xs text-muted">
        產出一律為草稿,需人工審核後才會發布。
      </p>
    </form>
  );
}

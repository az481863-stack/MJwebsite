"use client";

// QR Code 列表的互動按鈕:複製短網址、下載 PNG、刪除(軟刪除)。

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/components/admin/form-kit";
import { softDeleteQrCode } from "./actions";

const btnCls =
  "border border-line-strong px-3 py-1 text-xs font-medium transition-colors hover:bg-foreground hover:text-background disabled:opacity-50";

export function CopyUrlButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1500);
    return () => clearTimeout(timer);
  }, [copied]);

  return (
    <button
      type="button"
      className={btnCls}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
        } catch {
          // 舊瀏覽器或未授權剪貼簿:讓使用者自行選取短網址文字即可。
        }
      }}
    >
      {copied ? "已複製" : "複製短網址"}
    </button>
  );
}

// QR 圖片由 server 端產好 data URL 傳入,這裡只負責觸發下載。
export function DownloadQrButton({
  dataUrl,
  filename,
}: {
  dataUrl: string;
  filename: string;
}) {
  return (
    <a className={btnCls} href={dataUrl} download={`${filename}.png`}>
      下載 PNG
    </a>
  );
}

export function DeleteQrCodeButton({ id }: { id: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    softDeleteQrCode,
    null,
  );
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="inline"
      onSubmit={(e) => {
        if (
          !confirm("確定刪除此 QR Code?已印出的圖片掃描後將顯示「已失效」說明頁。")
        )
          e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-muted underline-offset-4 hover:text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "刪除中…" : "刪除"}
      </button>
      {state && !state.ok && (
        <span className="ml-2 text-xs text-red-600">{state.message}</span>
      )}
    </form>
  );
}

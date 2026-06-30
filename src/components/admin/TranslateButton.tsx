"use client";

// 後台「一鍵翻譯成英文」按鈕。collect() 蒐集要翻的中文欄位,翻好後交給 apply() 填入英文欄。
// 由各表單提供 collect/apply(皆 client),本元件只負責呼叫 server action 與顯示狀態。

import { useState } from "react";
import {
  translateFieldsAction,
  type TranslateResult,
} from "@/app/admin/translate-action";

export function TranslateButton({
  collect,
  apply,
  label = "一鍵翻譯成英文",
}: {
  collect: () => Record<string, string>;
  apply: (out: Record<string, string>) => void;
  label?: string;
}) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setMsg(null);
    const fields = collect();
    if (Object.values(fields).every((v) => !v?.trim())) {
      setMsg("請先填寫中文內容。");
      return;
    }
    setPending(true);
    try {
      const res: TranslateResult = await translateFieldsAction(fields);
      if (res.ok && res.data) {
        apply(res.data);
        setMsg("已翻譯,請檢查後存檔。");
      } else {
        setMsg(res.message ?? "翻譯失敗。");
      }
    } catch {
      setMsg("翻譯失敗,請稍後再試。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="border border-line px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {pending ? "翻譯中…" : label}
      </button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}

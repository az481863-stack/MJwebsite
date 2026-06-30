"use client";

// 3.2:Blog「一鍵翻譯成英文」。呼叫 translateBlog 把中文(標題/摘要/內文)翻好寫回 DB,
// 成功後重新載入頁面,讓英文欄與英文 Tiptap 編輯器帶出結果。需先儲存草稿(有 id)。

import { useState } from "react";
import { translateBlog } from "./ai-actions";

export function BlogTranslateButton({ id }: { id: string }) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function run() {
    setMsg(null);
    setPending(true);
    try {
      const res = await translateBlog(id);
      if (res.ok) {
        setMsg("已翻譯,正在重新載入…");
        window.location.reload();
      } else {
        setMsg(res.message);
        setPending(false);
      }
    } catch {
      setMsg("翻譯失敗,請稍後再試。");
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
        {pending ? "翻譯中…" : "一鍵翻譯成英文(含內文)"}
      </button>
      {msg && <span className="text-xs text-muted">{msg}</span>}
    </div>
  );
}

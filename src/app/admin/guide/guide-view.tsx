"use client";

// 後台「使用說明」頁:預設為閱讀模式(Markdown 渲染);
// 按「編輯」切換成 Markdown 純文字編輯,儲存後回到閱讀模式。
// 編輯權限:ADMIN 以上(由頁面傳入 canEdit;server action 亦再檢查)。

import { useState, useTransition } from "react";
import { Markdown } from "@/components/Markdown";
import { saveAdminGuide, type ActionResult } from "./actions";

const PLACEHOLDER =
  "尚無使用說明內容。\n\n按右上角「編輯」以 Markdown 撰寫後台操作指引(例如:如何發布內容、審核草稿、邀請會員、管理儀器等),供未來接手的管理員閱讀。";

export function GuideView({
  initial,
  canEdit,
}: {
  initial: string;
  canEdit: boolean;
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [editing, setEditing] = useState(false);
  const [msg, setMsg] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  function startEdit() {
    setDraft(saved);
    setMsg(null);
    setEditing(true);
  }

  function cancel() {
    setEditing(false);
    setMsg(null);
  }

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await saveAdminGuide(draft);
      setMsg(res);
      if (res.ok) {
        setSaved(draft);
        setEditing(false);
      }
    });
  }

  const btn = "px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50";

  return (
    <div className="space-y-4">
      {canEdit && (
        <div className="flex flex-wrap items-center gap-3">
          {!editing ? (
            <button
              type="button"
              onClick={startEdit}
              className={`${btn} border border-line hover:bg-foreground/[0.04]`}
            >
              ✎ 編輯
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={save}
                disabled={pending}
                className={`${btn} bg-foreground text-background hover:opacity-85`}
              >
                {pending ? "儲存中…" : "儲存"}
              </button>
              <button
                type="button"
                onClick={cancel}
                disabled={pending}
                className={`${btn} border border-line hover:bg-foreground/[0.04]`}
              >
                取消
              </button>
              <span className="text-xs text-muted">支援 Markdown 格式</span>
            </>
          )}
          {msg && (
            <span className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
              {msg.message}
            </span>
          )}
        </div>
      )}

      {editing ? (
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={24}
          placeholder="以 Markdown 撰寫使用說明…"
          className="w-full border border-line px-3 py-2.5 font-mono text-sm leading-relaxed outline-none focus:border-line-strong"
        />
      ) : (
        <div className="rounded border border-line px-5 py-5">
          <Markdown>{saved.trim() || PLACEHOLDER}</Markdown>
        </div>
      )}
    </div>
  );
}

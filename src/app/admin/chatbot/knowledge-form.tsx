"use client";

// 階段七:知識庫維護表單。
// 流程:更新知識庫(產中文)→ 微調中文 → 翻譯(產英文)→ 微調英文 → 儲存。
// 「更新」「翻譯」整份覆蓋對應欄位;按「儲存」前不影響線上聊天。

import { useState, useTransition } from "react";
import {
  regenerateKnowledge,
  translateToEnglish,
  saveKnowledge,
  type TextResult,
} from "./actions";

export function KnowledgeForm({
  initialZh,
  initialEn,
  aiEnabled,
}: {
  initialZh: string;
  initialEn: string;
  aiEnabled: boolean;
}) {
  const [zh, setZh] = useState(initialZh);
  const [en, setEn] = useState(initialEn);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState<TextResult | null>(null);
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<"regen" | "translate" | "save" | null>(null);

  function run(which: "regen" | "translate" | "save", fn: () => Promise<TextResult>) {
    setAction(which);
    setMsg(null);
    startTransition(async () => {
      const res = await fn();
      setMsg(res);
      if (res.ok && res.text !== undefined) {
        if (which === "regen") setZh(res.text);
        if (which === "translate") setEn(res.text);
        setDirty(true);
      }
      if (which === "save" && res.ok) setDirty(false);
      setAction(null);
    });
  }

  const btn =
    "px-4 py-2 text-sm font-medium transition-opacity disabled:opacity-50";

  return (
    <div className="max-w-3xl space-y-8">
      {!aiEnabled && (
        <p className="border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          AI 未啟用(未設定 <code>GEMINI_API_KEY</code>):「更新知識庫」與「翻譯」無法使用,
          但你仍可手動編輯下方欄位並儲存。前台聊天入口在未設金鑰時也不會顯示。
        </p>
      )}

      {/* 中文知識庫 */}
      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">中文知識庫(主來源)</h2>
          <button
            type="button"
            onClick={() => run("regen", () => regenerateKnowledge())}
            disabled={pending || !aiEnabled}
            className={`${btn} border border-line hover:bg-foreground/[0.04]`}
          >
            {pending && action === "regen" ? "彙整中…" : "↻ 更新知識庫"}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          「更新知識庫」會彙整全站已發布內容,經 AI 濃縮後<strong>整份覆蓋</strong>下方欄位(草稿/隱藏不納入)。
        </p>
        <textarea
          value={zh}
          onChange={(e) => {
            setZh(e.target.value);
            setDirty(true);
          }}
          rows={16}
          placeholder="尚無內容。可點「更新知識庫」自動產生,或直接手動輸入。"
          className="mt-3 w-full border border-line px-3 py-2.5 font-mono text-sm leading-relaxed outline-none focus:border-line-strong"
        />
      </section>

      {/* 英文知識庫 */}
      <section className="border-t border-line pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">英文知識庫</h2>
          <button
            type="button"
            onClick={() => run("translate", () => translateToEnglish(zh))}
            disabled={pending || !aiEnabled}
            className={`${btn} border border-line hover:bg-foreground/[0.04]`}
          >
            {pending && action === "translate" ? "翻譯中…" : "⇄ 由中文翻譯"}
          </button>
        </div>
        <p className="mt-1 text-sm text-muted">
          「由中文翻譯」會把<strong>目前中文欄位</strong>內容翻成英文並<strong>整份覆蓋</strong>下方欄位;也可手動編輯。英文提問時聊天取用此版本。
        </p>
        <textarea
          value={en}
          onChange={(e) => {
            setEn(e.target.value);
            setDirty(true);
          }}
          rows={16}
          placeholder="English knowledge base. Use 'Translate from Chinese' or edit manually."
          className="mt-3 w-full border border-line px-3 py-2.5 font-mono text-sm leading-relaxed outline-none focus:border-line-strong"
        />
      </section>

      {msg && (
        <p className={`text-sm ${msg.ok ? "text-green-600" : "text-red-600"}`}>
          {msg.message}
        </p>
      )}

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => run("save", () => saveKnowledge(zh, en))}
          disabled={pending}
          className={`${btn} bg-foreground text-background hover:opacity-85`}
        >
          {pending && action === "save" ? "儲存中…" : "儲存"}
        </button>
        {dirty && (
          <span className="text-sm text-muted">尚有未儲存的變更</span>
        )}
      </div>
    </div>
  );
}

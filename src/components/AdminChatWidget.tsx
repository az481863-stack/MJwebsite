"use client";

// 後台「管理員小幫手」浮動視窗(僅掛載於 /admin/guide 使用說明頁)。
// 與前台「實驗室小幫手」區隔:Emerald 綠色、後台淺色介面、打 /api/admin-chat、繁中固定。
// 依「使用說明」內容回答後台操作問題;多輪對話 + 串流,僅存當次工作階段。

import { useEffect, useRef, useState } from "react";

const ACCENT = "#059669"; // emerald-600
const ON_ACCENT = "#ffffff";

interface Msg {
  role: "user" | "model";
  text: string;
}

const GREETING = "嗨,我是管理員小幫手。你可以問我後台怎麼操作(發布內容、審核草稿、邀請會員、管理儀器等),我會依「使用說明」回答。";

export function AdminChatWidget() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const history: Msg[] = [...messages, { role: "user", text }];
    setMessages([...history, { role: "model", text: "" }]);
    setBusy(true);

    try {
      const res = await fetch("/api/admin-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });

      if (res.status === 429) {
        appendToLast("訊息太頻繁,請稍後再試。");
        return;
      }
      if (!res.ok || !res.body) {
        appendToLast("抱歉,暫時無法回應。");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToLast(decoder.decode(value, { stream: true }));
      }
    } catch {
      appendToLast("抱歉,暫時無法回應。");
    } finally {
      setBusy(false);
    }
  }

  function appendToLast(delta: string) {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last && last.role === "model") {
        next[next.length - 1] = { ...last, text: last.text + delta };
      }
      return next;
    });
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="開啟管理員小幫手"
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
          style={{ background: ACCENT, color: ON_ACCENT }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex h-[32rem] max-h-[80vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col rounded-lg border border-line bg-background text-foreground shadow-2xl">
          <header
            className="flex items-center justify-between rounded-t-lg px-4 py-3 text-white"
            style={{ background: ACCENT }}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full bg-white" />
              管理員小幫手
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="關閉"
              className="text-white/80 hover:text-white"
            >
              ✕
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <Bubble role="model" text={GREETING} />
            {messages.map((m, i) => (
              <Bubble key={i} role={m.role} text={m.text} />
            ))}
            {busy && messages[messages.length - 1]?.text === "" && (
              <p className="text-xs text-muted">…</p>
            )}
          </div>

          <div className="border-t border-line p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                rows={1}
                placeholder="詢問後台操作…"
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || !input.trim()}
                className="shrink-0 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                style={{ background: ACCENT }}
              >
                送出
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Bubble({ role, text }: { role: "user" | "model"; text: string }) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm leading-relaxed ${
          isUser ? "text-white" : "border border-line bg-foreground/[0.04]"
        }`}
        style={isUser ? { background: ACCENT } : undefined}
      >
        {isUser ? text : renderRich(text)}
      </div>
    </div>
  );
}

// 將模型輸出裡的 Markdown 連結與裸連結渲染成可點擊(其餘純文字)。
function renderRich(text: string): React.ReactNode[] {
  const re = /\[([^\]]+)\]\(([^)\s]+)\)|(https?:\/\/[^\s]+)/g;
  const nodes: React.ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) nodes.push(text.slice(last, m.index));
    const href = m[2] ?? m[3];
    const label = m[1] ?? m[3];
    const external = /^https?:\/\//.test(href);
    nodes.push(
      <a
        key={i++}
        href={href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="underline underline-offset-2"
        style={{ color: ACCENT }}
      >
        {label}
      </a>,
    );
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

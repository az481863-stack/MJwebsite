"use client";

// 階段七:前台 AI 聊天機器人浮動視窗。
// 多輪對話 + 串流逐字顯示;對話僅存當次工作階段(state),不存 DB。
// 語言跟隨前台 [EN/中文] 切換;送 lang 給 API 以取對應知識庫。
// 僅在 layout 依 showChatbot + isAiEnabled() 掛載。

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";

interface Msg {
  role: "user" | "model";
  text: string;
}

export function ChatWidget() {
  const { lang, t } = useLanguage();
  const pathname = usePathname();
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history, lang }),
      });

      if (res.status === 429) {
        appendToLast(t.chat.rateLimited);
        return;
      }
      if (!res.ok || !res.body) {
        appendToLast(t.chat.error);
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
      appendToLast(t.chat.error);
    } finally {
      setBusy(false);
    }
  }

  // 把串流文字接到最後一則(model)訊息。
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
    // 正在用輸入法組字(中文/日文等)時的 Enter 是「確認選字」,不可當送出,
    // 否則會送出又把剛確認的字補回輸入框(看起來像沒清空)。
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  }

  // 實驗室小幫手只出現在前台公開頁;後台/會員/登入等頁面不顯示
  // (後台改由「管理員小幫手」負責,見 admin/layout.tsx)。
  const BACKEND_PREFIXES = ["/admin", "/account", "/login", "/setup", "/invite", "/auth"];
  if (BACKEND_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) {
    return null;
  }

  return (
    <>
      {/* 浮動開關按鈕 */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t.chat.open}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105"
          style={{ background: "var(--accent)", color: "#06121a" }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
          </svg>
        </button>
      )}

      {/* 聊天面板 */}
      {open && (
        <div className="band-dark fixed bottom-5 right-5 z-50 flex h-[32rem] max-h-[80vh] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col rounded-lg border border-line bg-background text-foreground shadow-2xl">
          <header className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="flex items-center gap-2 text-sm font-semibold">
              <span className="h-2 w-2 rounded-full" style={{ background: "var(--accent)" }} />
              {t.chat.title}
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.chat.close}
              className="text-muted hover:text-foreground"
            >
              ✕
            </button>
          </header>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <Bubble role="model" text={t.chat.greeting} />
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
                placeholder={t.chat.placeholder}
                className="max-h-28 min-h-[2.5rem] flex-1 resize-none border border-line bg-transparent px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
              <button
                type="button"
                onClick={send}
                disabled={busy || !input.trim()}
                className="shrink-0 px-3 py-2 text-sm font-medium disabled:opacity-50"
                style={{ background: "var(--accent)", color: "#06121a" }}
              >
                {t.chat.send}
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
          isUser ? "text-[#06121a]" : "border border-line bg-foreground/[0.04]"
        }`}
        style={isUser ? { background: "var(--accent)" } : undefined}
      >
        {isUser ? text : renderRich(text)}
      </div>
    </div>
  );
}

// 將模型輸出裡的 Markdown 連結 [文字](網址) 與裸 http(s) 連結渲染成可點擊。
// 其餘維持純文字(外層 whitespace-pre-wrap 保留換行)。
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
        style={{ color: "var(--accent)" }}
      >
        {label}
      </a>,
    );
    last = re.lastIndex;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

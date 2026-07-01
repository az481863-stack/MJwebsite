"use client";

// 輕量 Markdown 渲染(react-markdown + GFM),以 tailwind 類別套版,
// 不依賴 typography 外掛。用於後台「使用說明」頁。
// 內容為受信任的後台輸入,故不特別 sanitize(react-markdown 預設也不放行原始 HTML)。

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="mt-6 text-2xl font-semibold tracking-tight" {...p} />,
          h2: (p) => <h2 className="mt-6 border-b border-line pb-1 text-xl font-semibold" {...p} />,
          h3: (p) => <h3 className="mt-4 text-lg font-semibold" {...p} />,
          p: (p) => <p className="whitespace-pre-wrap" {...p} />,
          ul: (p) => <ul className="ml-5 list-disc space-y-1" {...p} />,
          ol: (p) => <ol className="ml-5 list-decimal space-y-1" {...p} />,
          li: (p) => <li className="pl-1" {...p} />,
          a: (p) => (
            <a
              className="underline underline-offset-2"
              style={{ color: "var(--accent)" }}
              target="_blank"
              rel="noopener noreferrer"
              {...p}
            />
          ),
          blockquote: (p) => (
            <blockquote className="border-l-2 border-line pl-4 text-muted" {...p} />
          ),
          code: (p) => (
            <code className="rounded bg-foreground/[0.06] px-1.5 py-0.5 font-mono text-[0.85em]" {...p} />
          ),
          pre: (p) => (
            <pre className="overflow-x-auto rounded border border-line bg-foreground/[0.04] p-3 font-mono text-xs" {...p} />
          ),
          hr: () => <hr className="border-line" />,
          table: (p) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left" {...p} />
            </div>
          ),
          th: (p) => <th className="border border-line px-3 py-1.5 font-semibold" {...p} />,
          td: (p) => <td className="border border-line px-3 py-1.5 align-top" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

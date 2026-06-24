"use client";

// 複製定型文字按鈕(階段一測試條件:「複製應徵範本」可正確複製)。

import { useState } from "react";

export function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // 後備:不支援 clipboard API 時用隱藏 textarea。
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 border border-line-strong px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

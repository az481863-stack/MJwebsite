"use client";

// 前台數學公式渲染:server 端 generateHTML 只輸出 data-latex 空 span,
// 這裡於 client 掛載後用 KaTeX 將其渲染為公式。語系切換重繪時自動重跑。

import { useEffect, useRef } from "react";
import katex from "katex";

export function MathUpgrader({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const nodes = root.querySelectorAll<HTMLElement>(
      '[data-type="inline-math"], [data-type="block-math"]',
    );
    nodes.forEach((el) => {
      const latex = el.getAttribute("data-latex") ?? "";
      const display = el.getAttribute("data-type") === "block-math";
      try {
        katex.render(latex, el, { displayMode: display, throwOnError: false });
      } catch {
        el.textContent = latex;
      }
    });
  });

  return <div ref={ref}>{children}</div>;
}

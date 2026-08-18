"use client";

// 「使用狀況」全部展開/收合。列表有兩種渲染路徑(ADMIN 的拖曳列表 client 元件、
// 負責人的 server 列表),各自的 <details> 由瀏覽器自行管理 open 狀態,
// 故此處直接掃 DOM 切換,不必把 open 狀態一路往下傳(React 也未受控此屬性)。

import { useState } from "react";

export function ToggleAllUsage() {
  const [allOpen, setAllOpen] = useState(false);

  function toggle() {
    const list = Array.from(
      document.querySelectorAll<HTMLDetailsElement>("details[data-usage-summary]"),
    );
    if (list.length === 0) return;
    // 只要還有收合的就全部展開;全開時才全部收合。
    const next = list.some((d) => !d.open);
    for (const d of list) d.open = next;
    setAllOpen(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-expanded={allOpen}
      className="border border-line-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
    >
      {allOpen ? "全部收合使用狀況 ▴" : "全部展開使用狀況 ▾"}
    </button>
  );
}

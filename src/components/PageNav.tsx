"use client";

// 本頁目錄(On this page),借鑑 HackMD 的浮動 TOC:
// - 桌機(lg+):右側一疊「迷你橫線」(minimap),目前區塊的線變長變深;
//   滑鼠移上去整個展開成完整文字目錄(hover expand)。
// - 手機/平板:右下角浮動圓鈕,點擊彈出區塊清單(觸控無 hover,改用 tap)。
// - 共用:IntersectionObserver scrollspy 高亮、點擊平滑跳轉。

import { useEffect, useState } from "react";
import { useScrollHidden } from "@/lib/scroll-hide";

export interface PageNavItem {
  id: string;
  label: string;
}

export function PageNav({ items }: { items: PageNavItem[] }) {
  const [active, setActive] = useState(items[0]?.id ?? "");
  const navHidden = useScrollHidden();

  // 以區塊 id 字串作為穩定依賴(語系切換只改 label、不改 id)。
  const idSig = items.map((i) => i.id).join("|");

  useEffect(() => {
    const ids = idSig.split("|").filter(Boolean);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [idSig]);

  const jumpTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive(id);
      window.history.replaceState(null, "", `#${id}`);
    }
  };

  if (items.length < 2) return null;

  return (
    <>
      {/* ── 桌機:右側 minimap + hover 展開 ── */}
      <nav
        aria-label="On this page"
        className="group fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block"
      >
        {/* 收合態:迷你橫線 */}
        <ul className="flex flex-col items-end gap-2.5 transition-opacity duration-200 group-hover:pointer-events-none group-hover:opacity-0">
          {items.map((item) => (
            <li key={item.id} className="flex h-3 items-center">
              <span
                className={`block h-0.5 rounded-full transition-all duration-200 ${
                  active === item.id
                    ? "w-8 bg-foreground"
                    : "w-4 bg-foreground/25"
                }`}
              />
            </li>
          ))}
        </ul>

        {/* 展開態:完整文字目錄 */}
        <ul className="invisible absolute right-0 top-1/2 min-w-44 -translate-y-1/2 rounded-sm border border-line bg-background/95 p-4 opacity-0 shadow-sm backdrop-blur transition-all duration-200 group-hover:visible group-hover:opacity-100">
          {items.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  jumpTo(item.id);
                }}
                className={`block py-1.5 text-sm leading-snug transition-colors ${
                  active === item.id
                    ? "font-semibold text-foreground"
                    : "text-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── 手機/平板:導覽列下方的橫向籤條(非選單,明確為「換區塊」)──
          導覽列隱藏時同步上移 64px(-translate-y-16),貼合 top-0,避免空隙。 */}
      <div
        className={`sticky top-16 z-30 border-b border-line bg-background/90 backdrop-blur transition-transform duration-300 lg:hidden ${
          navHidden ? "-translate-y-16" : "translate-y-0"
        }`}
      >
        <div className="flex gap-2 overflow-x-auto px-6 py-2.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                jumpTo(item.id);
              }}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
                active === item.id
                  ? "border-line-strong bg-foreground text-background"
                  : "border-line text-muted"
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </>
  );
}

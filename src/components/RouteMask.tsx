"use client";

// 全站導航遮罩:只要網址(pathname 或 query)改變就立刻覆蓋遮罩,直到新頁就緒。
// - 攔截站內 <a>/<Link> 點擊與瀏覽器上一頁/下一頁(popstate)→ 立即顯示。
// - 純 #(同頁錨點)、外部連結、開新分頁、修飾鍵點擊、下載 → 不遮。
// - 與 app/loading.tsx 互補:此元件蓋「點擊→網址提交」空檔,loading.tsx 蓋「資料載入」期間(視覺相同)。

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function RouteMaskInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // 啟動遮罩時所在的網址(FROM)。導航完成後現址會 ≠ fromKey,遮罩即自動隱藏
  //(衍生計算,不在 effect 內 setState)。
  const [fromKey, setFromKey] = useState<string | null>(null);

  const currentKey = `${pathname}?${searchParams.toString()}`;
  const show = fromKey !== null && fromKey === currentKey;

  useEffect(() => {
    const startMask = () => {
      setFromKey(`${window.location.pathname}?${window.location.search.replace(/^\?/, "")}`);
      // 安全網:導航若被取消/未真的換頁,10 秒後解除避免卡住。
      window.setTimeout(() => setFromKey(null), 10000);
    };

    const onClick = (e: MouseEvent) => {
      // 修飾鍵 / 非左鍵 → 可能開新分頁,交給瀏覽器,不遮。
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const a = (e.target as HTMLElement | null)?.closest?.("a");
      if (!a) return;
      const href = a.getAttribute("href");
      if (!href) return;
      if (a.target && a.target !== "_self") return; // 開新分頁
      if (a.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return; // 外部連結
      // 同 pathname + 同 query → 純 # 或原地,不遮。
      if (
        url.pathname === window.location.pathname &&
        url.search === window.location.search
      ) {
        return;
      }
      startMask();
    };

    const onPopState = () => startMask(); // 上一頁/下一頁

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", onPopState);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-sm"
    >
      <span aria-hidden className="laser-loader" />
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
        載入中…
      </span>
    </div>
  );
}

export function RouteMask() {
  // useSearchParams 需在 Suspense 邊界內。
  return (
    <Suspense fallback={null}>
      <RouteMaskInner />
    </Suspense>
  );
}

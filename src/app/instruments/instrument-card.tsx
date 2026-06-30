"use client";

// 階段五 / 2.2:儀器介紹卡片頂部資訊(client)。
// - 說明文字過長時可收合/展開,避免整頁太長。
// - 照片可點擊放大(lightbox);點背景或按 Esc 關閉。

import Image from "next/image";
import { useEffect, useState } from "react";

export function InstrumentCard({
  name,
  maintenance,
  photoUrl,
  purpose,
}: {
  name: string;
  maintenance: boolean;
  photoUrl: string | null;
  purpose: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [zoom, setZoom] = useState(false);

  // 文字偏長才顯示「展開」鈕(以字數或換行判斷,免去量測 DOM)。
  const longText = purpose.length > 80 || purpose.includes("\n");

  // lightbox 開啟時:Esc 關閉 + 鎖背景捲動。
  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  return (
    <>
      <div className="flex items-start gap-4">
        {photoUrl && (
          <button
            type="button"
            onClick={() => setZoom(true)}
            aria-label={`放大「${name}」照片`}
            className="shrink-0"
          >
            <Image
              src={photoUrl}
              alt={name}
              width={120}
              height={90}
              unoptimized
              className="h-20 w-auto cursor-zoom-in border border-line object-cover transition-opacity hover:opacity-80"
            />
          </button>
        )}
        <div className="min-w-0">
          <h3 className="font-medium">
            {maintenance ? "🟡" : "🟢"} {name}
          </h3>
          <p
            className={`mt-1 whitespace-pre-wrap text-sm text-muted ${
              !expanded && longText ? "line-clamp-3" : ""
            }`}
          >
            {purpose}
          </p>
          {longText && (
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="mt-1 text-xs font-medium text-accent underline-offset-4 hover:underline"
            >
              {expanded ? "收合" : "展開全部"}
            </button>
          )}
        </div>
      </div>

      {zoom && photoUrl && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`「${name}」照片`}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
        >
          <Image
            src={photoUrl}
            alt={name}
            width={1200}
            height={900}
            unoptimized
            className="max-h-[90vh] w-auto max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
}

"use client";

// 階段五 / 2.2:儀器介紹卡片頂部資訊(client)。
// - 說明文字過長時可收合/展開,避免整頁太長。
// - 照片可點擊放大,沿用共用元件 ZoomableImage。

import { useState } from "react";
import { ZoomableImage } from "@/components/ZoomableImage";

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

  // 文字偏長才顯示「展開」鈕(以字數或換行判斷,免去量測 DOM)。
  const longText = purpose.length > 80 || purpose.includes("\n");

  return (
    <div className="flex items-start gap-4">
      {photoUrl && (
        <ZoomableImage
          src={photoUrl}
          alt={name}
          width={120}
          height={90}
          thumbClassName="h-20 w-auto border border-line object-cover"
        />
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
  );
}

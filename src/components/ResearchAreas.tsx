"use client";

// 研究領域清單(直式編號清單樣式)。首頁與研究頁共用同一份後台資料
// (Settings 的 homeResearchAreasZh/En),留空則 fallback 首頁字典預設。
// 卡片 padding 較小、間距緊湊(吳教授偏好研究頁排版但更緊)。

import { useLanguage } from "@/lib/i18n/context";

export function ResearchAreas({
  areasZh,
  areasEn,
}: {
  areasZh: string;
  areasEn: string;
}) {
  const { t, lang } = useLanguage();
  const override = lang === "en" ? areasEn : areasZh;
  const areas = override
    ? override
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((line) => {
          const [title, ...rest] = line.split("|");
          return { title: title.trim(), desc: rest.join("|").trim() };
        })
    : t.home.researchAreas;

  return (
    <div className="space-y-px overflow-hidden border border-line bg-line">
      {areas.map((area, i) => (
        <div
          key={i}
          className="flex flex-col gap-1 bg-background p-4 sm:flex-row sm:gap-6"
        >
          <span className="font-mono text-sm text-accent sm:w-12">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="sm:flex-1">
            <h3 className="text-lg font-semibold">{area.title}</h3>
            <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted">
              {area.desc}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

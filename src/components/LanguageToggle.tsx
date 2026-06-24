"use client";

// 右上角語系切換,做成滑動 switch 樣式(中 / EN),點擊即全站切換(A-1)。

import { useLanguage } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { lang, toggle } = useLanguage();
  const isEn = lang === "en";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isEn}
      aria-label="Language / 語言"
      onClick={toggle}
      className="relative inline-flex h-7 w-16 items-center rounded-full border border-line bg-background"
    >
      {/* 滑動知識塊(highlight) */}
      <span
        className={`pointer-events-none absolute top-1/2 h-6 w-7.5 -translate-y-1/2 rounded-full bg-foreground transition-all duration-200 ${
          isEn ? "left-8" : "left-0.5"
        }`}
      />
      <span
        className={`relative z-10 w-1/2 text-center text-xs transition-colors ${
          !isEn ? "font-semibold text-background" : "text-muted"
        }`}
      >
        中
      </span>
      <span
        className={`relative z-10 w-1/2 text-center text-xs transition-colors ${
          isEn ? "font-semibold text-background" : "text-muted"
        }`}
      >
        EN
      </span>
    </button>
  );
}

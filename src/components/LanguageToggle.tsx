"use client";

// 右上角固定語系切換鈕 [中文 / EN](A-1)。顯示單一語言,點選即全站切換。

import { useLanguage } from "@/lib/i18n/context";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  const base =
    "px-2 py-0.5 text-sm transition-colors rounded-sm cursor-pointer";
  const active = "font-semibold text-foreground";
  const inactive = "text-muted hover:text-foreground";

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Language"
    >
      <button
        type="button"
        onClick={() => setLang("zh")}
        aria-pressed={lang === "zh"}
        className={`${base} ${lang === "zh" ? active : inactive}`}
      >
        中文
      </button>
      <span className="text-line-strong/30" aria-hidden>
        /
      </span>
      <button
        type="button"
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`${base} ${lang === "en" ? active : inactive}`}
      >
        EN
      </button>
    </div>
  );
}

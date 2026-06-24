"use client";

// 依目前語系挑選要顯示的內容(兩版皆由 server 預先渲染,僅切換顯示)。
// 用於 Blog:中/英內文都在 server 端用 Tiptap 渲染好,前台依切換鈕顯示對應版本。

import { useLanguage } from "@/lib/i18n/context";

export function LangPick({
  zh,
  en,
}: {
  zh: React.ReactNode;
  en: React.ReactNode;
}) {
  const { lang } = useLanguage();
  return <>{lang === "en" ? en : zh}</>;
}

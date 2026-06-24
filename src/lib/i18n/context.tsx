"use client";

// 全站語系狀態(A-1:全站單一語言,隨右上角切換鈕變換)。
// 以 useSyncExternalStore 讀取 localStorage(SSR 安全、避免 setState-in-effect),
// 寫入時通知所有訂閱者重繪,並同步 <html lang>。

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useSyncExternalStore,
} from "react";
import {
  DEFAULT_LANG,
  dictionaries,
  type Dictionary,
  type Lang,
} from "./dictionary";

const STORAGE_KEY = "mjlab.lang";

// ── 外部儲存(localStorage)的最小 store 實作 ──
const listeners = new Set<() => void>();

function readLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "zh" || stored === "en" ? stored : DEFAULT_LANG;
}

function writeLang(lang: Lang) {
  window.localStorage.setItem(STORAGE_KEY, lang);
  listeners.forEach((fn) => fn());
}

function subscribe(callback: () => void) {
  listeners.add(callback);
  // 跨分頁同步
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

interface LanguageContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggle: () => void;
  t: Dictionary;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const lang = useSyncExternalStore(subscribe, readLang, () => DEFAULT_LANG);

  // 同步 <html lang>(對外部系統 DOM 的副作用,非 setState)。
  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-Hant" : "en";
  }, [lang]);

  const setLang = useCallback((next: Lang) => writeLang(next), []);
  const toggle = useCallback(
    () => writeLang(readLang() === "zh" ? "en" : "zh"),
    [],
  );

  return (
    <LanguageContext.Provider
      value={{ lang, setLang, toggle, t: dictionaries[lang] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useLanguage 必須在 <LanguageProvider> 內使用");
  }
  return ctx;
}

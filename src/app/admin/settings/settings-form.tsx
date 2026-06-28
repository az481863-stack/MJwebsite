"use client";

import { useActionState, useState } from "react";
import type { SiteSettingsData } from "@/lib/settings";
import { ACCENTS } from "@/lib/accent";
import { saveSettings, type ActionResult } from "./actions";

const PAGE_TOGGLES: { key: keyof SiteSettingsData; label: string }[] = [
  { key: "showResearch", label: "研究與產學(/research)" },
  { key: "showTeam", label: "團隊與招募(/team)" },
  { key: "showBlog", label: "光電小講堂 Blog(/blog)" },
  { key: "showContact", label: "聯絡教授(/contact)" },
  { key: "showInstruments", label: "儀器預約管理(導覽入口)" },
  { key: "showIndustry", label: "產學與專利區塊(研究頁內)" },
  { key: "showHighschool", label: "給高中生的話(/for-students)" },
  { key: "showChatbot", label: "AI 聊天機器人(前台浮動視窗)" },
];

export function SettingsForm({ initial }: { initial: SiteSettingsData }) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveSettings, null);
  const [accent, setAccent] = useState(initial.siteAccent);

  return (
    <form action={formAction} className="max-w-xl space-y-8">
      <section>
        <h2 className="text-lg font-semibold">頁面顯示</h2>
        <p className="mt-1 text-sm text-muted">
          取消勾選即從前台與導覽列隱藏(直接造訪該網址也會 404)。
        </p>
        <ul className="mt-4 space-y-3">
          {PAGE_TOGGLES.map((t) => (
            <li key={t.key}>
              <label className="flex items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  name={t.key}
                  defaultChecked={initial[t.key] as boolean}
                />
                {t.label}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">全站參數</h2>
        <label className="mt-4 block text-sm font-medium" htmlFor="instrumentMaxHours">
          儀器預約總時數上限(小時,供階段五使用)
        </label>
        <input
          id="instrumentMaxHours"
          name="instrumentMaxHours"
          type="number"
          min={1}
          defaultValue={initial.instrumentMaxHours}
          className="mt-1.5 w-32 border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
        />
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">前台主題重點色</h2>
        <p className="mt-1 text-sm text-muted">
          套用於全站前台(Dark Optics)的重點色:Hero 雷射光束、按鈕、連結與重點。點選即預覽。
        </p>
        <input type="hidden" name="siteAccent" value={accent} />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {ACCENTS.map((a) => {
            const active = accent === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => setAccent(a.key)}
                aria-pressed={active}
                title={a.name}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition-transform hover:scale-110 ${
                  active ? "ring-2 ring-offset-2 ring-offset-background" : ""
                }`}
                style={{
                  background: a.hex,
                  ...(active ? ({ "--tw-ring-color": a.hex } as React.CSSProperties) : {}),
                }}
              >
                {active && (
                  <span className="text-xs font-bold text-[#06121a]">✓</span>
                )}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-sm text-muted">
          目前選擇:
          <span className="font-medium text-foreground">
            {ACCENTS.find((a) => a.key === accent)?.name ?? accent}
          </span>
        </p>
      </section>

      {state && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "儲存中…" : "儲存設定"}
      </button>
    </form>
  );
}

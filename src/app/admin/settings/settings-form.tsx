"use client";

import { useActionState, useState } from "react";
import type { SiteSettingsData } from "@/lib/settings";
import { ACCENTS } from "@/lib/accent";
import { dictionaries } from "@/lib/i18n/dictionary";
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
        <h2 className="text-lg font-semibold">首頁文字</h2>
        <p className="mt-1 text-sm text-muted">
          編輯首頁的標題、副標與「主持人理念」內文。中、英文各一份(隨前台語系切換顯示)。
          <span className="font-medium text-foreground">留空</span>則沿用系統預設文字(灰色提示即為預設)。
          理念內文以<span className="font-medium text-foreground">空行</span>分段。
        </p>

        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">首頁標題(中文)</span>
              <textarea
                name="homeHeroTitleZh"
                rows={2}
                defaultValue={initial.homeHeroTitleZh}
                placeholder={dictionaries.zh.home.heroTitle}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">首頁標題(English)</span>
              <textarea
                name="homeHeroTitleEn"
                rows={2}
                defaultValue={initial.homeHeroTitleEn}
                placeholder={dictionaries.en.home.heroTitle}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">首頁副標(中文)</span>
              <textarea
                name="homeHeroSubtitleZh"
                rows={3}
                defaultValue={initial.homeHeroSubtitleZh}
                placeholder={dictionaries.zh.home.heroSubtitle}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">首頁副標(English)</span>
              <textarea
                name="homeHeroSubtitleEn"
                rows={3}
                defaultValue={initial.homeHeroSubtitleEn}
                placeholder={dictionaries.en.home.heroSubtitle}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">主持人理念內文(中文)</span>
              <textarea
                name="homePhilosophyBodyZh"
                rows={6}
                defaultValue={initial.homePhilosophyBodyZh}
                placeholder={dictionaries.zh.home.philosophyBody.join("\n\n")}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm leading-relaxed outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">主持人理念內文(English)</span>
              <textarea
                name="homePhilosophyBodyEn"
                rows={6}
                defaultValue={initial.homePhilosophyBodyEn}
                placeholder={dictionaries.en.home.philosophyBody.join("\n\n")}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm leading-relaxed outline-none focus:border-line-strong"
              />
            </label>
          </div>
        </div>

        <h3 className="mt-8 text-base font-semibold">研究領域</h3>
        <p className="mt-1 text-sm text-muted">
          研究領域區塊的標題、引言與各領域卡片。各領域卡片請
          <span className="font-medium text-foreground">一行一個</span>,以
          <span className="font-medium text-foreground"> | </span>
          分隔「標題」與「說明」(例:<code>奈米光電元件 | 設計並製作光偵測器與量子點結構</code>)。留空沿用預設。
        </p>

        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">標題(中文)</span>
              <input
                name="homeResearchHeadingZh"
                defaultValue={initial.homeResearchHeadingZh}
                placeholder={dictionaries.zh.home.researchHeading}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">標題(English)</span>
              <input
                name="homeResearchHeadingEn"
                defaultValue={initial.homeResearchHeadingEn}
                placeholder={dictionaries.en.home.researchHeading}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">引言(中文)</span>
              <textarea
                name="homeResearchIntroZh"
                rows={2}
                defaultValue={initial.homeResearchIntroZh}
                placeholder={dictionaries.zh.home.researchIntro}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">引言(English)</span>
              <textarea
                name="homeResearchIntroEn"
                rows={2}
                defaultValue={initial.homeResearchIntroEn}
                placeholder={dictionaries.en.home.researchIntro}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">各領域卡片(中文)</span>
              <textarea
                name="homeResearchAreasZh"
                rows={4}
                defaultValue={initial.homeResearchAreasZh}
                placeholder={dictionaries.zh.home.researchAreas
                  .map((a) => `${a.title} | ${a.desc}`)
                  .join("\n")}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm leading-relaxed outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">各領域卡片(English)</span>
              <textarea
                name="homeResearchAreasEn"
                rows={4}
                defaultValue={initial.homeResearchAreasEn}
                placeholder={dictionaries.en.home.researchAreas
                  .map((a) => `${a.title} | ${a.desc}`)
                  .join("\n")}
                className="mt-1.5 w-full resize-y border border-line px-3 py-2 text-sm leading-relaxed outline-none focus:border-line-strong"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="border-t border-line pt-6">
        <h2 className="text-lg font-semibold">聯絡資訊</h2>
        <p className="mt-1 text-sm text-muted">
          聯絡教授頁的基本資訊。名稱、地址、辦公時間中、英各一(隨前台語系切換);
          Email、電話為單欄。<span className="font-medium text-foreground">留空</span>則沿用系統預設(灰字提示即為預設)。
        </p>

        <div className="mt-4 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">實驗室名稱(中文)</span>
              <input
                name="contactLabNameZh"
                defaultValue={initial.contactLabNameZh}
                placeholder={dictionaries.zh.contact.labName}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">實驗室名稱(English)</span>
              <input
                name="contactLabNameEn"
                defaultValue={initial.contactLabNameEn}
                placeholder={dictionaries.en.contact.labName}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">地址(中文)</span>
              <input
                name="contactAddressZh"
                defaultValue={initial.contactAddressZh}
                placeholder={dictionaries.zh.contact.address}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">地址(English)</span>
              <input
                name="contactAddressEn"
                defaultValue={initial.contactAddressEn}
                placeholder={dictionaries.en.contact.address}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">Email</span>
              <input
                name="contactEmail"
                defaultValue={initial.contactEmail}
                placeholder={dictionaries.zh.contact.email}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">電話</span>
              <input
                name="contactPhone"
                defaultValue={initial.contactPhone}
                placeholder={dictionaries.zh.contact.phone}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="font-medium">辦公時間(中文)</span>
              <input
                name="contactOfficeHoursZh"
                defaultValue={initial.contactOfficeHoursZh}
                placeholder={dictionaries.zh.contact.officeHours}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
            <label className="block text-sm">
              <span className="font-medium">辦公時間(English)</span>
              <input
                name="contactOfficeHoursEn"
                defaultValue={initial.contactOfficeHoursEn}
                placeholder={dictionaries.en.contact.officeHours}
                className="mt-1.5 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
              />
            </label>
          </div>
        </div>
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

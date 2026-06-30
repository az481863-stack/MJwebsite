"use client";

// 聯絡教授:聯絡基本資訊(寫死)+ 分類聯絡表單(階段四,server action 寄信)。

import { useActionState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { submitContact, type ContactResult } from "./actions";

export interface ContactOverrides {
  labNameZh: string;
  labNameEn: string;
  addressZh: string;
  addressEn: string;
  email: string;
  phone: string;
  officeHoursZh: string;
  officeHoursEn: string;
}

export function ContactContent({
  overrides,
}: {
  overrides: ContactOverrides;
}) {
  const { t, lang } = useLanguage();
  const c = t.contact;
  const f = c.form;
  const [state, formAction, pending] = useActionState<
    ContactResult | null,
    FormData
  >(submitContact, null);

  // server action 回傳字典 key → 對應當前語系文案。
  const feedback = state
    ? ((f as Record<string, unknown>)[state.message] as string) ?? state.message
    : null;

  // 後台覆寫優先,留空則沿用字典預設(會切換的欄位依語系取中/英)。
  const labName =
    (lang === "en" ? overrides.labNameEn : overrides.labNameZh) || c.labName;
  const address =
    (lang === "en" ? overrides.addressEn : overrides.addressZh) || c.address;
  const email = overrides.email || c.email;
  const phone = overrides.phone || c.phone;
  const officeHours =
    (lang === "en" ? overrides.officeHoursEn : overrides.officeHoursZh) ||
    c.officeHours;

  const rows = [
    { label: c.addressLabel, value: address },
    { label: c.emailLabel, value: email, href: `mailto:${email}` },
    { label: c.phoneLabel, value: phone },
    { label: c.officeHoursLabel, value: officeHours },
  ];

  return (
    <Section heading={c.heading} intro={c.intro}>
      <div className="max-w-2xl">
        <p className="text-lg font-semibold">{labName}</p>

        <dl className="mt-8 divide-y divide-line border-y border-line">
          {rows.map((row, i) => (
            <div
              key={i}
              className="flex flex-col gap-1 py-4 sm:flex-row sm:gap-6"
            >
              <dt className="w-28 shrink-0 text-sm font-medium text-muted">
                {row.label}
              </dt>
              <dd className="text-base">
                {row.href ? (
                  <a
                    href={row.href}
                    className="underline-offset-4 transition-colors hover:underline"
                  >
                    {row.value}
                  </a>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <p className="mt-8 text-sm leading-relaxed text-muted">{c.formNote}</p>

        {/* 分類聯絡表單(階段四) */}
        <div className="mt-12 border-t border-line pt-10">
          <h2 className="text-xl font-semibold tracking-tight">{f.heading}</h2>
          <p className="mt-2 text-sm text-muted">{f.intro}</p>

          <form action={formAction} className="mt-6 space-y-4">
            {/* 蜜罐:人類看不到、勿填;機器人填了即被擋。 */}
            <div
              aria-hidden
              className="absolute left-[-9999px] h-0 w-0 overflow-hidden"
            >
              <label>
                Company
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium" htmlFor="cf-name">
                  {f.name}
                </label>
                <input
                  id="cf-name"
                  name="name"
                  type="text"
                  required
                  className="mt-1.5 w-full border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-line-strong"
                />
              </div>
              <div>
                <label className="block text-sm font-medium" htmlFor="cf-email">
                  {f.email}
                </label>
                <input
                  id="cf-email"
                  name="email"
                  type="email"
                  required
                  className="mt-1.5 w-full border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-line-strong"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="cf-category">
                {f.category}
              </label>
              <select
                id="cf-category"
                name="category"
                required
                defaultValue=""
                className="mt-1.5 w-full border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-line-strong"
              >
                <option value="" disabled>
                  {f.categoryPlaceholder}
                </option>
                <option value="industry">{f.categories.industry}</option>
                <option value="academic">{f.categories.academic}</option>
                <option value="recruit">{f.categories.recruit}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium" htmlFor="cf-message">
                {f.message}
              </label>
              <textarea
                id="cf-message"
                name="message"
                required
                rows={5}
                className="mt-1.5 w-full resize-y border border-line bg-transparent px-3 py-2.5 text-sm outline-none focus:border-line-strong"
              />
            </div>

            {feedback && (
              <p
                className={`text-sm ${state?.ok ? "text-accent" : "text-red-600"}`}
              >
                {feedback}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="bg-accent px-6 py-2.5 text-sm font-semibold text-[#06121a] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
            >
              {pending ? f.sending : f.submit}
            </button>
          </form>
        </div>
      </div>
    </Section>
  );
}

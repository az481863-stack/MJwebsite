"use client";

// 聯絡教授(階段一):聯絡基本資訊(寫死)。表單於階段四開放。

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export default function ContactPage() {
  const { t } = useLanguage();
  const c = t.contact;

  const rows = [
    { label: c.addressLabel, value: c.address },
    { label: c.emailLabel, value: c.email, href: `mailto:${c.email}` },
    { label: c.phoneLabel, value: c.phone },
    { label: c.officeHoursLabel, value: c.officeHours },
  ];

  return (
    <Section heading={c.heading} intro={c.intro}>
      <div className="max-w-2xl">
        <p className="text-lg font-semibold">{c.labName}</p>

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

        <p className="mt-8 border border-line bg-foreground/[0.02] p-4 text-sm leading-relaxed text-muted">
          {c.formNote}
        </p>
      </div>
    </Section>
  );
}

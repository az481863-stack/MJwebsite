"use client";

// 研究與產學(階段一寫死):研究領域 + 產學與專利 + 代表著作(靜態佔位)。

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { PageNav } from "@/components/PageNav";

export default function ResearchPage() {
  const { t } = useLanguage();
  const r = t.research;

  const navItems = [
    { id: "areas", label: r.heading },
    { id: "industry", label: r.industryHeading },
    { id: "publications", label: r.pubHeading },
  ];

  return (
    <>
      <PageNav items={navItems} />
      <Section id="areas" heading={r.heading} intro={r.intro}>
        <div className="space-y-px overflow-hidden border border-line bg-line">
          {r.areas.map((area, i) => (
            <div
              key={i}
              className="flex flex-col gap-3 bg-background p-8 sm:flex-row sm:gap-8"
            >
              <span className="font-mono text-sm text-muted sm:w-12">
                0{i + 1}
              </span>
              <div className="sm:flex-1">
                <h3 className="text-lg font-semibold">{area.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {area.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section id="industry" heading={r.industryHeading} intro={r.industryIntro} bordered>
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {r.industryItems.map((item, i) => (
            <div key={i} className="bg-background p-8">
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="publications" heading={r.pubHeading} intro={r.pubIntro} bordered>
        <ul className="divide-y divide-line border-y border-line">
          {r.pubItems.map((pub, i) => (
            <li key={i} className="flex gap-6 py-6">
              <span className="shrink-0 font-mono text-sm text-muted">
                {pub.year}
              </span>
              <div>
                <p className="text-base font-medium leading-snug">
                  {pub.title}
                </p>
                <p className="mt-1.5 text-sm text-muted">
                  {pub.authors} · <span className="italic">{pub.venue}</span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

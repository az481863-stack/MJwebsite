"use client";

// 研究與產學(前台):研究領域為 i18n 寫死;產學與專利來自後台 CMS;
// 代表著作(Publications)暫為寫死,將於 Tiptap 階段串接。

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";
import { PageNav } from "@/components/PageNav";
import { ResearchAreas } from "@/components/ResearchAreas";

export interface IndustryEntry {
  id: string;
  category: "PATENT" | "LICENSABLE" | "COLLABORATION";
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
}

export interface PublicationEntry {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  doiUrl: string | null;
  highlight: boolean;
}

const CAT_ORDER: IndustryEntry["category"][] = [
  "PATENT",
  "LICENSABLE",
  "COLLABORATION",
];

export function ResearchContent({
  industry,
  publications,
  showIndustry,
  researchHeadingZh,
  researchHeadingEn,
  researchIntroZh,
  researchIntroEn,
  researchAreasZh,
  researchAreasEn,
}: {
  industry: IndustryEntry[];
  publications: PublicationEntry[];
  showIndustry: boolean;
  researchHeadingZh: string;
  researchHeadingEn: string;
  researchIntroZh: string;
  researchIntroEn: string;
  researchAreasZh: string;
  researchAreasEn: string;
}) {
  const { t, lang } = useLanguage();
  const r = t.research;

  // 標題/引言:後台覆寫優先(與首頁研究領域共用同一組 Settings 欄位),空值 fallback 研究頁字典。
  const areasHeading =
    (lang === "en" ? researchHeadingEn : researchHeadingZh) || r.heading;
  const areasIntro =
    (lang === "en" ? researchIntroEn : researchIntroZh) || r.intro;

  const navItems = [
    { id: "areas", label: areasHeading },
    ...(showIndustry ? [{ id: "industry", label: r.industryHeading }] : []),
    { id: "publications", label: r.pubHeading },
  ];

  return (
    <>
      <PageNav items={navItems} />

      {/* 研究領域(與首頁共用同一份後台資料與樣式) */}
      <Section id="areas" heading={areasHeading} intro={areasIntro}>
        <ResearchAreas areasZh={researchAreasZh} areasEn={researchAreasEn} />
      </Section>

      {/* 產學與專利(後台 CMS;可由 Settings 隱藏) */}
      {showIndustry && (
      <Section id="industry" heading={r.industryHeading} intro={r.industryIntro} bordered>
        {industry.length === 0 ? (
          <p className="text-sm text-muted">{r.emptyIndustry}</p>
        ) : (
          <div className="space-y-8">
            {CAT_ORDER.map((cat) => {
              const items = industry.filter((it) => it.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat}>
                  <h3 className="text-base font-semibold">
                    {r.industryCatLabels[cat]}
                  </h3>
                  <ul className="mt-3 divide-y divide-line border-y border-line">
                    {items.map((it) => (
                      <li key={it.id} className="py-3">
                        <p className="text-sm font-medium">
                          {(lang === "en" ? it.titleEn : null) || it.title}
                        </p>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-muted">
                          {(lang === "en" ? it.descriptionEn : null) ||
                            it.description}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        )}
      </Section>
      )}

      {/* 代表著作(後台 CMS;年份倒序、精選加粗放大) */}
      <Section id="publications" heading={r.pubHeading} intro={r.pubIntro} bordered>
        {publications.length === 0 ? (
          <p className="text-sm text-muted">{r.pubEmpty}</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {publications.map((pub) => (
              <li key={pub.id} className="flex gap-6 py-6">
                <span className="shrink-0 font-mono text-sm text-muted">
                  {pub.year}
                </span>
                <div>
                  <p
                    className={
                      pub.highlight
                        ? "text-lg font-semibold leading-snug"
                        : "text-base font-medium leading-snug"
                    }
                  >
                    {pub.doiUrl ? (
                      <a
                        href={pub.doiUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline-offset-4 hover:underline"
                      >
                        {pub.title}
                      </a>
                    ) : (
                      pub.title
                    )}
                  </p>
                  <p className="mt-1.5 text-sm text-muted">
                    {pub.authors} · <span className="italic">{pub.venue}</span>
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </>
  );
}

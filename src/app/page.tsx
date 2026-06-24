"use client";

// 首頁(階段一):Hero + 研究領域 + 主持人理念 + 動態佈告欄(靜態佔位)+ CTA。
// 內容全部來自 i18n 字典,隨語系切換顯示單一語言。

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageNav } from "@/components/PageNav";

export default function Home() {
  const { t } = useLanguage();
  const h = t.home;

  const navItems = [
    { id: "research", label: h.researchHeading },
    { id: "philosophy", label: h.philosophyHeading },
    { id: "dashboard", label: h.dashboardHeading },
  ];

  return (
    <>
      <PageNav items={navItems} />
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line">
        {/* 雷射光路幾何:極細斜線作為背景分割 */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(115deg, #111 0, #111 1px, transparent 1px, transparent 64px)",
          }}
        />
        <Container className="relative">
          <div className="flex max-w-3xl flex-col py-28 sm:py-36">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
              {h.heroEyebrow}
            </p>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              {h.heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              {h.heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/research"
                className="inline-flex items-center justify-center bg-foreground px-6 py-3 text-sm font-medium text-background transition-opacity hover:opacity-85"
              >
                {h.ctaPrimary}
              </Link>
              <Link
                href="/team"
                className="inline-flex items-center justify-center border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
              >
                {h.ctaSecondary}
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* 研究領域 */}
      <Section id="research" heading={h.researchHeading} intro={h.researchIntro}>
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {h.researchAreas.map((area, i) => (
            <div key={i} className="bg-background p-8">
              <span className="text-sm font-mono text-muted">
                0{i + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{area.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {area.desc}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* 主持人理念 */}
      <Section id="philosophy" heading={h.philosophyHeading} bordered>
        <div className="max-w-3xl space-y-6">
          {h.philosophyBody.map((para, i) => (
            <p key={i} className="text-lg leading-relaxed text-foreground/80">
              {para}
            </p>
          ))}
        </div>
      </Section>

      {/* 動態佈告欄(靜態佔位,階段三改後台) */}
      <Section id="dashboard" heading={h.dashboardHeading} intro={h.dashboardIntro} bordered>
        <ul className="divide-y divide-line border-y border-line">
          {h.dashboardItems.map((item, i) => (
            <li
              key={i}
              className="flex flex-col gap-2 py-5 sm:flex-row sm:items-center sm:gap-6"
            >
              <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wider text-muted">
                {item.tag}
              </span>
              <span className="flex-1 text-base">{item.title}</span>
              <span className="shrink-0 font-mono text-sm text-muted">
                {item.date}
              </span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

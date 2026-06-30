"use client";

// 首頁內容(Dark Optics)。淺色學院風為底,Hero 與「主持人理念」為近黑深色帶
// (.band-dark)+ 雷射光束;研究領域、動態佈告欄維持淺色。重點色取全站 --accent
// (由後台 Settings 決定)。動態以 .beam / .reveal(globals.css)。

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageNav } from "@/components/PageNav";
import { Reveal } from "@/components/Reveal";

export interface DashboardItem {
  id: string;
  category: string;
  title: string;
  body: string;
  imageUrl: string | null;
  linkUrl: string | null;
  linkText: string | null;
  date: string; // YYYY.MM.DD
}

// 首頁可由後台 Settings 覆寫的文字(留空則沿用 i18n 字典預設)。
export interface HomeOverrides {
  heroTitleZh: string;
  heroTitleEn: string;
  heroSubtitleZh: string;
  heroSubtitleEn: string;
  philosophyBodyZh: string;
  philosophyBodyEn: string;
}

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: "學術快報",
  LAB_LIFE: "實驗室日常",
  HONOR: "榮譽榜",
};

export function HomeContent({
  posts,
  overrides,
}: {
  posts: DashboardItem[];
  overrides: HomeOverrides;
}) {
  const { t, lang } = useLanguage();
  const h = t.home;
  const [openId, setOpenId] = useState<string | null>(null);

  // 後台覆寫優先,留空則沿用字典預設(依當前語系挑中/英文)。
  const heroTitle =
    (lang === "zh" ? overrides.heroTitleZh : overrides.heroTitleEn) ||
    h.heroTitle;
  const heroSubtitle =
    (lang === "zh" ? overrides.heroSubtitleZh : overrides.heroSubtitleEn) ||
    h.heroSubtitle;
  const philosophyOverride =
    lang === "zh" ? overrides.philosophyBodyZh : overrides.philosophyBodyEn;
  const philosophyBody = philosophyOverride
    ? philosophyOverride.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
    : h.philosophyBody;

  const navItems = [
    { id: "research", label: h.researchHeading },
    { id: "philosophy", label: h.philosophyHeading },
    { id: "dashboard", label: h.dashboardHeading },
  ];

  return (
    <>
      <PageNav items={navItems} />

      {/* Hero(深色帶:雷射光束 + 光暈) */}
      <section className="band-dark relative flex min-h-[88vh] items-center overflow-hidden">
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1200 600"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="home-beam" x1="0" y1="0" x2="1" y2="1">
              <stop className="beam-stop-0" offset="0%" />
              <stop className="beam-stop-1" offset="50%" />
              <stop className="beam-stop-0" offset="100%" />
            </linearGradient>
          </defs>
          <line className="beam" x1="-100" y1="120" x2="1300" y2="360" stroke="url(#home-beam)" />
          <line className="beam beam-2" x1="-100" y1="500" x2="1300" y2="180" stroke="url(#home-beam)" />
          <line className="beam beam-3" x1="200" y1="-50" x2="900" y2="650" stroke="url(#home-beam)" />
        </svg>
        <div
          aria-hidden
          className="hero-glow pointer-events-none absolute right-[-10%] top-[10%] h-[50vw] w-[50vw]"
        />

        <Container className="relative">
          <div className="flex max-w-3xl flex-col py-28 sm:py-36">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
              {h.heroEyebrow}
            </p>
            <h1 className="mt-6 whitespace-pre-line text-4xl font-semibold leading-tight tracking-tight sm:text-6xl">
              {heroTitle}
            </h1>
            <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-muted">
              {heroSubtitle}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/research"
                className="inline-flex items-center justify-center bg-accent px-6 py-3 text-sm font-semibold text-[#06121a] transition-transform hover:-translate-y-0.5"
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

      {/* 研究領域(淺色) */}
      <Section id="research" heading={h.researchHeading} intro={h.researchIntro}>
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-3">
          {h.researchAreas.map((area, i) => (
            <Reveal
              key={i}
              delay={i * 90}
              className="bg-background p-8 transition-shadow hover:shadow-[inset_0_3px_0_var(--accent)]"
            >
              <span className="font-mono text-sm text-accent">0{i + 1}</span>
              <h3 className="mt-4 text-lg font-semibold">{area.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                {area.desc}
              </p>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* 主持人理念(深色帶) */}
      <section id="philosophy" className="band-dark scroll-mt-20 py-16 sm:py-24">
        <Container>
          <Reveal as="header" className="mb-10 sm:mb-14">
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {h.philosophyHeading}
            </h2>
          </Reveal>
          <div className="max-w-3xl space-y-6">
            {philosophyBody.map((para, i) => (
              <Reveal
                key={i}
                delay={i * 120}
                as="p"
                className="text-lg leading-relaxed text-foreground/80"
              >
                {para}
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* 動態佈告欄(淺色,來自後台 CMS) */}
      <Section id="dashboard" heading={h.dashboardHeading} intro={h.dashboardIntro}>
        {posts.length === 0 ? (
          <p className="text-sm text-muted">目前沒有最新動態。</p>
        ) : (
          <ul className="divide-y divide-line border-y border-line">
            {posts.map((item) => {
              const open = openId === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : item.id)}
                    aria-expanded={open}
                    className="flex w-full items-center gap-4 py-5 text-left transition-[padding,background] hover:bg-accent/[0.06] hover:pl-3 sm:gap-6"
                  >
                    <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wider text-accent">
                      {CATEGORY_LABEL[item.category] ?? item.category}
                    </span>
                    <span className="flex-1 text-base">{item.title}</span>
                    <span className="shrink-0 font-mono text-sm text-muted">
                      {item.date}
                    </span>
                    <span
                      className={`shrink-0 text-muted transition-transform ${
                        open ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    >
                      ⌄
                    </span>
                  </button>

                  {open && (
                    <div className="pb-6 sm:pl-30">
                      {item.imageUrl && (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          width={640}
                          height={360}
                          className="mb-4 h-auto w-full max-w-md border border-line object-cover"
                          unoptimized
                        />
                      )}
                      <p className="max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-foreground/80">
                        {item.body}
                      </p>
                      {item.linkUrl && (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center gap-1 border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
                        >
                          {item.linkText || "相關連結"} ↗
                        </a>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </>
  );
}

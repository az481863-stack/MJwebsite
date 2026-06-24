"use client";

// 首頁內容(client:用 i18n 字典渲染寫死區塊)。
// 動態佈告欄改吃資料庫傳入的 posts(階段三);其餘區塊仍為寫死文案。

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { PageNav } from "@/components/PageNav";

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

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: "學術快報",
  LAB_LIFE: "實驗室日常",
  HONOR: "榮譽榜",
};

export function HomeContent({ posts }: { posts: DashboardItem[] }) {
  const { t } = useLanguage();
  const h = t.home;
  const [openId, setOpenId] = useState<string | null>(null);

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
              <span className="text-sm font-mono text-muted">0{i + 1}</span>
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

      {/* 動態佈告欄(來自後台 CMS) */}
      <Section id="dashboard" heading={h.dashboardHeading} intro={h.dashboardIntro} bordered>
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
                    className="flex w-full items-center gap-4 py-5 text-left sm:gap-6"
                  >
                    <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wider text-muted">
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

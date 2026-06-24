"use client";

// 儀器預約管理(階段一):系統未上線,顯示「即將推出」。
// 規格 A-2:入口於儀器系統(階段五)上線前導向「即將推出」。

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";

export default function InstrumentsPage() {
  const { t } = useLanguage();
  const c = t.comingSoon;

  return (
    <section className="flex min-h-[60vh] items-center py-24">
      <Container>
        <div className="max-w-xl">
          <span className="inline-flex items-center border border-line-strong px-3 py-1 text-xs font-medium uppercase tracking-wider">
            {c.badge}
          </span>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">
            {c.title}
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted">{c.body}</p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center border border-line-strong px-6 py-3 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            {t.nav.contact}
          </Link>
        </div>
      </Container>
    </section>
  );
}

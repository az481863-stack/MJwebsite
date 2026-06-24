"use client";

// 頁尾:極簡,實驗室名稱 + 標語 + 導覽 + 版權年份。

import Link from "next/link";
import { NAV_ITEMS } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "./ui/Container";

export function Footer() {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line py-12">
      <Container>
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-sm font-semibold tracking-tight">
              {t.footer.rights}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {t.footer.tagline}
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-10 text-xs text-muted">
          © {year} {t.footer.rights}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}

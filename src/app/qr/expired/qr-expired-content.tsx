"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export function QrExpiredContent() {
  const { t } = useLanguage();
  const q = t.qrExpired;

  return (
    <Section heading={q.heading} intro={q.intro}>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/"
          className="inline-flex items-center rounded-sm bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          {q.home}
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center rounded-sm border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-foreground"
        >
          {q.contact}
        </Link>
      </div>
    </Section>
  );
}

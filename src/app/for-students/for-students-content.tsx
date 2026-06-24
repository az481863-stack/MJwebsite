"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export function ForStudentsContent({ content }: { content: string | null }) {
  const { t } = useLanguage();
  const f = t.forStudents;

  return (
    <Section heading={f.heading} intro={f.intro}>
      {content ? (
        <div className="max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-foreground/80">
          {content}
        </div>
      ) : (
        <p className="text-sm text-muted">{f.empty}</p>
      )}
    </Section>
  );
}

"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export function ForStudentsContent({
  content,
  contentEn,
}: {
  content: string | null;
  contentEn: string | null;
}) {
  const { t, lang } = useLanguage();
  const f = t.forStudents;
  const body = (lang === "en" ? contentEn : null) || content;

  return (
    <Section heading={f.heading} intro={f.intro}>
      {body ? (
        <div className="max-w-2xl whitespace-pre-wrap text-base leading-relaxed text-foreground/80">
          {body}
        </div>
      ) : (
        <p className="text-sm text-muted">{f.empty}</p>
      )}
    </Section>
  );
}

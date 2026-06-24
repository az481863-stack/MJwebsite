"use client";

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export interface CourseEntry {
  id: string;
  name: string;
  outline: string;
  handoutUrl: string | null;
}

export function CoursesContent({ courses }: { courses: CourseEntry[] }) {
  const { t } = useLanguage();
  const c = t.courses;

  return (
    <Section heading={c.heading} intro={c.intro}>
      {courses.length === 0 ? (
        <p className="text-sm text-muted">{c.empty}</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {courses.map((course) => (
            <li key={course.id} className="py-6">
              <h3 className="text-lg font-semibold">{course.name}</h3>
              <p className="mt-2 max-w-2xl whitespace-pre-wrap text-sm leading-relaxed text-muted">
                {course.outline}
              </p>
              {course.handoutUrl && (
                <a
                  href={course.handoutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                >
                  {c.handout} ↗
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

"use client";

// 光電小講堂 Blog(階段一):靜態文章佔位,階段三改後台(Tiptap)。

import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export default function BlogPage() {
  const { t } = useLanguage();
  const b = t.blog;

  return (
    <Section heading={b.heading} intro={b.intro}>
      <div className="space-y-px overflow-hidden border border-line bg-line">
        {b.posts.map((post, i) => (
          <article
            key={i}
            className="group flex cursor-pointer flex-col gap-2 bg-background p-8 transition-colors hover:bg-foreground/[0.02] sm:flex-row sm:items-baseline sm:gap-8"
          >
            <span className="shrink-0 font-mono text-sm text-muted sm:w-28">
              {post.date}
            </span>
            <div>
              <h3 className="text-lg font-semibold">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}

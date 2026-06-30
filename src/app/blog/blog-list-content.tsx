"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Section } from "@/components/ui/Section";

export interface BlogListItem {
  id: string;
  titleZh: string;
  titleEn: string;
  summary: string | null;
  summaryEn: string | null;
  coverUrl: string | null;
  date: string;
}

export function BlogListContent({ posts }: { posts: BlogListItem[] }) {
  const { t, lang } = useLanguage();
  const b = t.blog;

  return (
    <Section heading={b.heading} intro={b.intro}>
      {posts.length === 0 ? (
        <p className="text-sm text-muted">目前沒有文章。</p>
      ) : (
        <div className="space-y-px overflow-hidden border border-line bg-line">
          {posts.map((post) => {
            const title =
              (lang === "en" ? post.titleEn : null) || post.titleZh;
            const summary =
              (lang === "en" ? post.summaryEn : null) || post.summary;
            return (
              <Link
                key={post.id}
                href={`/blog/${post.id}`}
                className="group flex gap-5 bg-background p-8 transition-colors hover:bg-foreground/[0.02]"
              >
                {post.coverUrl && (
                  <Image
                    src={post.coverUrl}
                    alt=""
                    width={120}
                    height={90}
                    unoptimized
                    className="hidden h-20 w-28 shrink-0 border border-line object-cover sm:block"
                  />
                )}
                <div className="min-w-0">
                  <span className="font-mono text-sm text-muted">{post.date}</span>
                  <h3 className="mt-1 text-lg font-semibold">{title}</h3>
                  {summary && (
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {summary}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </Section>
  );
}

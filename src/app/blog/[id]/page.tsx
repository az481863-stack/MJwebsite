// Blog 內文頁(server):中英內文皆 server 端渲染,依語系切換顯示。

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { Container } from "@/components/ui/Container";
import { TiptapContent } from "@/components/TiptapContent";
import { LangPick } from "@/components/LangPick";
import { MathUpgrader } from "@/components/MathUpgrader";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const settings = await getSettings();
  if (!settings.showBlog) notFound();
  const post = await prisma.blogPost.findFirst({
    where: { id, status: "PUBLISHED", deletedAt: null },
  });
  if (!post) notFound();

  return (
    <Container className="py-16">
      <article className="mx-auto max-w-2xl">
        <Link
          href="/blog"
          className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
        >
          ← 返回列表
        </Link>

        <p className="mt-6 font-mono text-sm text-muted">
          {post.publishedDate.toISOString().slice(0, 10).replace(/-/g, ".")}
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          <LangPick zh={post.titleZh} en={post.titleEn} />
        </h1>
        {post.summary && (
          <p className="mt-4 text-lg leading-relaxed text-muted">
            {post.summary}
          </p>
        )}

        {post.coverUrl && (
          <Image
            src={post.coverUrl}
            alt=""
            width={896}
            height={504}
            unoptimized
            className="mt-8 h-auto w-full border border-line object-cover"
          />
        )}

        <div className="mt-10">
          <MathUpgrader>
            <LangPick
              zh={<TiptapContent json={post.bodyZh} />}
              en={<TiptapContent json={post.bodyEn} />}
            />
          </MathUpgrader>
        </div>
      </article>
    </Container>
  );
}

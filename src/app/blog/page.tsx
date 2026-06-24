// 光電小講堂 Blog(server):列出已發布文章。

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { BlogListContent } from "./blog-list-content";

export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const settings = await getSettings();
  if (!settings.showBlog) notFound();

  const posts = await prisma.blogPost.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedDate: "desc" },
  });

  return (
    <BlogListContent
      posts={posts.map((p) => ({
        id: p.id,
        titleZh: p.titleZh,
        titleEn: p.titleEn,
        summary: p.summary,
        coverUrl: p.coverUrl,
        date: p.publishedDate.toISOString().slice(0, 10).replace(/-/g, "."),
      }))}
    />
  );
}

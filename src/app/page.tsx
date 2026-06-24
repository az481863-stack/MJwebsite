// 首頁(server):抓取已發布的動態佈告欄,交給 client 內容渲染。
// 靜態產生 + 發布內容時以 revalidatePath 更新。

import { prisma } from "@/lib/prisma";
import { HomeContent } from "./home-content";

// 內容來自資料庫,改為請求時渲染(避免 build 期連線、內容即時更新)。
export const dynamic = "force-dynamic";

export default async function Home() {
  const posts = await prisma.dashboardPost.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { publishedDate: "desc" },
    take: 5,
  });

  return (
    <HomeContent
      posts={posts.map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        body: p.body,
        imageUrl: p.imageUrl,
        linkUrl: p.linkUrl,
        linkText: p.linkText,
        date: p.publishedDate.toISOString().slice(0, 10).replace(/-/g, "."),
      }))}
    />
  );
}

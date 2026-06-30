// 首頁(server):抓取已發布的動態佈告欄,交給 client 內容渲染。
// 靜態產生 + 發布內容時以 revalidatePath 更新。

import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { HomeContent } from "./home-content";

// 內容來自資料庫,改為請求時渲染(避免 build 期連線、內容即時更新)。
export const dynamic = "force-dynamic";

export default async function Home() {
  const [posts, settings] = await Promise.all([
    prisma.dashboardPost.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: { publishedDate: "desc" },
      take: 5,
    }),
    getSettings(),
  ]);

  return (
    <HomeContent
      overrides={{
        heroTitleZh: settings.homeHeroTitleZh,
        heroTitleEn: settings.homeHeroTitleEn,
        heroSubtitleZh: settings.homeHeroSubtitleZh,
        heroSubtitleEn: settings.homeHeroSubtitleEn,
        philosophyBodyZh: settings.homePhilosophyBodyZh,
        philosophyBodyEn: settings.homePhilosophyBodyEn,
        researchHeadingZh: settings.homeResearchHeadingZh,
        researchHeadingEn: settings.homeResearchHeadingEn,
        researchIntroZh: settings.homeResearchIntroZh,
        researchIntroEn: settings.homeResearchIntroEn,
        researchAreasZh: settings.homeResearchAreasZh,
        researchAreasEn: settings.homeResearchAreasEn,
      }}
      posts={posts.map((p) => ({
        id: p.id,
        category: p.category,
        title: p.title,
        titleEn: p.titleEn,
        body: p.body,
        bodyEn: p.bodyEn,
        imageUrl: p.imageUrl,
        linkUrl: p.linkUrl,
        linkText: p.linkText,
        linkTextEn: p.linkTextEn,
        date: p.publishedDate.toISOString().slice(0, 10).replace(/-/g, "."),
      }))}
    />
  );
}

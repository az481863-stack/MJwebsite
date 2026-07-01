// 研究與產學(server):抓取已發布的產學與專利、代表著作。

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ResearchContent } from "./research-content";

export const dynamic = "force-dynamic";

export default async function ResearchPage() {
  const settings = await getSettings();
  if (!settings.showResearch) notFound();

  const [industry, publications] = await Promise.all([
    prisma.industryItem.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.publication.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  return (
    <ResearchContent
      showIndustry={settings.showIndustry}
      industry={industry.map((it) => ({
        id: it.id,
        category: it.category,
        title: it.title,
        titleEn: it.titleEn,
        description: it.description,
        descriptionEn: it.descriptionEn,
      }))}
      publications={publications.map((p) => ({
        id: p.id,
        authors: p.authors,
        title: p.title,
        venue: p.venue,
        year: p.year,
        doiUrl: p.doiUrl,
        highlight: p.highlight,
      }))}
    />
  );
}

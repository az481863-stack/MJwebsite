// 團隊與招募(server):抓取已發布的成員/校友/職缺,交給 client 內容渲染。

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { TeamContent } from "./team-content";

export const dynamic = "force-dynamic";

export default async function TeamPage() {
  const settings = await getSettings();
  if (!settings.showTeam) notFound();

  const [members, alumni, jobs] = await Promise.all([
    prisma.teamMember.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.alumnus.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ gradYear: "desc" }, { sortOrder: "asc" }],
    }),
    prisma.jobOpening.findMany({
      where: { status: "PUBLISHED", deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <TeamContent
      data={{
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          tier: m.tier,
          photoUrl: m.photoUrl,
          researchTopic: m.researchTopic,
        })),
        alumni: alumni.map((a) => ({
          id: a.id,
          name: a.name,
          gradYear: a.gradYear,
          destination: a.destination,
        })),
        jobs: jobs.map((j) => ({
          id: j.id,
          title: j.title,
          recruitStatus: j.recruitStatus,
          slots: j.slots,
          description: j.description,
        })),
      }}
    />
  );
}

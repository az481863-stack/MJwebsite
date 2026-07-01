import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { ForStudentsContent } from "./for-students-content";

export const dynamic = "force-dynamic";

export default async function ForStudentsPage() {
  const settings = await getSettings();
  if (!settings.showHighschool) notFound();

  const msg = await prisma.highSchoolMessage.findFirst({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <ForStudentsContent
      content={msg?.content ?? null}
      contentEn={msg?.contentEn ?? null}
    />
  );
}

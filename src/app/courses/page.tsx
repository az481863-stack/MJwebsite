import { prisma } from "@/lib/prisma";
import { CoursesContent } from "./courses-content";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  const courses = await prisma.course.findMany({
    where: { status: "PUBLISHED", deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });

  return (
    <CoursesContent
      courses={courses.map((c) => ({
        id: c.id,
        name: c.name,
        outline: c.outline,
        handoutUrl: c.handoutUrl,
      }))}
    />
  );
}

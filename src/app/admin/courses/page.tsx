import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SortableAdminList } from "../sortable-admin-list";

export default async function CoursesAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.course.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.course.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <SortableAdminList
      key={items.map((c) => `${c.id}:${c.status}`).join(",")}
      title="課程紀錄"
      basePath="/admin/courses"
      model="course"
      items={items.map((c) => ({
        id: c.id,
        status: c.status,
        primary: c.name,
      }))}
      deleted={deleted.map((c) => ({
        id: c.id,
        status: c.status,
        label: c.name,
      }))}
    />
  );
}

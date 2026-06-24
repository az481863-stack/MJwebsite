import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

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
    <AdminListShell
      title="課程紀錄"
      basePath="/admin/courses"
      model="course"
      items={items}
      deleted={deleted}
      renderRow={(c) => <p className="text-sm font-medium">{c.name}</p>}
      renderDeleted={(c) => c.name}
    />
  );
}

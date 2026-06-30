import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SortableAdminList } from "../sortable-admin-list";

export default async function JobsAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.jobOpening.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.jobOpening.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <SortableAdminList
      key={items.map((j) => `${j.id}:${j.status}`).join(",")}
      title="職缺管理"
      basePath="/admin/jobs"
      model="jobOpening"
      items={items.map((j) => ({
        id: j.id,
        status: j.status,
        primary: j.title,
        secondary: `${j.recruitStatus === "OPEN" ? "開放" : "額滿"}${
          j.slots != null ? ` · ${j.slots} 名` : ""
        }`,
      }))}
      deleted={deleted.map((j) => ({
        id: j.id,
        status: j.status,
        label: j.title,
      }))}
    />
  );
}

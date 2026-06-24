import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

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
    <AdminListShell
      title="職缺管理"
      basePath="/admin/jobs"
      model="jobOpening"
      items={items}
      deleted={deleted}
      renderRow={(j) => (
        <p className="text-sm">
          <span className="font-medium">{j.title}</span>
          <span className="text-muted">
            {" "}
            · {j.recruitStatus === "OPEN" ? "開放" : "額滿"}
            {j.slots != null ? ` · ${j.slots} 名` : ""}
          </span>
        </p>
      )}
      renderDeleted={(j) => j.title}
    />
  );
}

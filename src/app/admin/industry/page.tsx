import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

const CAT_LABEL: Record<string, string> = {
  PATENT: "已獲證專利",
  LICENSABLE: "可授權技術",
  COLLABORATION: "企業合作",
};

export default async function IndustryAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.industryItem.findMany({
      where: { deletedAt: null },
      orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
    }),
    prisma.industryItem.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <AdminListShell
      title="產學與專利"
      basePath="/admin/industry"
      model="industryItem"
      items={items}
      deleted={deleted}
      renderRow={(it) => (
        <p className="text-sm">
          <span className="text-muted">[{CAT_LABEL[it.category]}] </span>
          <span className="font-medium">{it.title}</span>
        </p>
      )}
      renderDeleted={(it) => it.title}
    />
  );
}

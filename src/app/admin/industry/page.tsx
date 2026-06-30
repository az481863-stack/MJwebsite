import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SortableAdminList } from "../sortable-admin-list";

const CAT_LABEL: Record<string, string> = {
  PATENT: "已獲證專利",
  LICENSABLE: "可授權技術",
  COLLABORATION: "企業合作",
};
// 與前台 research-content 的 CAT_ORDER 一致。
const CAT_GROUPS = [
  { key: "PATENT", label: "已獲證專利" },
  { key: "LICENSABLE", label: "可授權技術" },
  { key: "COLLABORATION", label: "企業合作" },
];

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
    <SortableAdminList
      key={items.map((it) => `${it.id}:${it.status}`).join(",")}
      title="產學與專利"
      basePath="/admin/industry"
      model="industryItem"
      groups={CAT_GROUPS}
      items={items.map((it) => ({
        id: it.id,
        status: it.status,
        primary: it.title,
        group: it.category,
      }))}
      deleted={deleted.map((it) => ({
        id: it.id,
        status: it.status,
        label: `[${CAT_LABEL[it.category] ?? it.category}] ${it.title}`,
      }))}
    />
  );
}

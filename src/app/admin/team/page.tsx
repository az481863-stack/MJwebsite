import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

const TIER_LABEL: Record<string, string> = {
  POSTDOC: "博後",
  PHD: "博士生",
  MASTER: "碩士生",
  UNDERGRAD: "專題生",
};

export default async function TeamAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.teamMember.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.teamMember.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <AdminListShell
      title="現役成員"
      basePath="/admin/team"
      model="teamMember"
      items={items}
      deleted={deleted}
      renderRow={(m) => (
        <>
          <p className="text-sm font-medium">{m.name}</p>
          <p className="text-xs text-muted">
            {TIER_LABEL[m.tier]}
            {m.researchTopic ? ` · ${m.researchTopic}` : ""}
          </p>
        </>
      )}
      renderDeleted={(m) => m.name}
    />
  );
}

// Publications 列表。管理員看全部;學生只看自己的(可建草稿)。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

export default async function PublicationsAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  const isAdmin = roleAtLeast(me.role, "ADMIN");

  const [items, deleted] = await Promise.all([
    prisma.publication.findMany({
      where: { deletedAt: null, ...(isAdmin ? {} : { createdBy: me.id }) },
      orderBy: [{ year: "desc" }, { createdAt: "desc" }],
    }),
    isAdmin
      ? prisma.publication.findMany({
          where: { deletedAt: { not: null } },
          orderBy: { deletedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AdminListShell
      title="Publications"
      basePath="/admin/publications"
      model="publication"
      canManage={isAdmin}
      items={items}
      deleted={deleted}
      renderRow={(p) => (
        <>
          <p className="text-sm font-medium">
            {p.highlight && <span title="精選">★ </span>}
            {p.title}
          </p>
          <p className="text-xs text-muted">
            {p.authors} · {p.venue} · {p.year}
          </p>
        </>
      )}
      renderDeleted={(p) => p.title}
    />
  );
}

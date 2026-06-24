// Blog 列表。管理員看全部;學生只看自己的(可建草稿)。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminListShell } from "../content-list-shell";

export default async function BlogAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  const isAdmin = roleAtLeast(me.role, "ADMIN");

  const [items, deleted] = await Promise.all([
    prisma.blogPost.findMany({
      where: { deletedAt: null, ...(isAdmin ? {} : { createdBy: me.id }) },
      orderBy: { publishedDate: "desc" },
    }),
    isAdmin
      ? prisma.blogPost.findMany({
          where: { deletedAt: { not: null } },
          orderBy: { deletedAt: "desc" },
        })
      : Promise.resolve([]),
  ]);

  return (
    <AdminListShell
      title="光電小講堂 Blog"
      basePath="/admin/blog"
      model="blogPost"
      canManage={isAdmin}
      items={items}
      deleted={deleted}
      renderRow={(p) => (
        <>
          <p className="text-sm font-medium">{p.titleZh}</p>
          <p className="text-xs text-muted">
            {p.titleEn} · {p.publishedDate.toISOString().slice(0, 10)}
          </p>
        </>
      )}
      renderDeleted={(p) => p.titleZh}
    />
  );
}

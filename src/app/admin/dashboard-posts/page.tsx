// 動態佈告欄 列表(ADMIN 以上)。有效區(可拖曳)/ 過期區 / 已刪除區。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SortableAdminList } from "../sortable-admin-list";

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: "學術快報",
  LAB_LIFE: "實驗室日常",
  HONOR: "榮譽榜",
};

function secondary(p: {
  category: string;
  publishedDate: Date;
  expiresAt: Date | null;
}): string {
  const pub = p.publishedDate.toISOString().slice(0, 10);
  const exp = p.expiresAt ? p.expiresAt.toISOString().slice(0, 10) : "無";
  return `${CATEGORY_LABEL[p.category] ?? p.category} · 發布 ${pub} · 過期 ${exp}`;
}

export default async function DashboardPostsPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const now = new Date();
  const [alive, deleted] = await Promise.all([
    prisma.dashboardPost.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { publishedDate: "desc" }],
    }),
    prisma.dashboardPost.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  // 有效(未過期)可拖曳;過期進過期區。null 視為未過期。
  const active = alive.filter((p) => !p.expiresAt || p.expiresAt > now);
  const expired = alive.filter((p) => p.expiresAt && p.expiresAt <= now);

  return (
    <SortableAdminList
      key={alive.map((p) => `${p.id}:${p.status}:${p.expiresAt && p.expiresAt <= now ? "x" : "a"}`).join(",")}
      title="動態佈告欄"
      basePath="/admin/dashboard-posts"
      model="dashboardPost"
      items={active.map((p) => ({
        id: p.id,
        status: p.status,
        primary: p.title,
        secondary: secondary(p),
      }))}
      expired={expired.map((p) => ({
        id: p.id,
        status: p.status,
        primary: p.title,
        secondary: secondary(p),
      }))}
      deleted={deleted.map((p) => ({
        id: p.id,
        status: p.status,
        label: p.title,
      }))}
    />
  );
}

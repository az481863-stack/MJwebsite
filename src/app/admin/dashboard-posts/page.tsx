// 動態佈告欄 列表(ADMIN 以上)。含草稿/已發布與已刪除區。

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentRowActions, StatusBadge } from "../content-row-actions";

const CATEGORY_LABEL: Record<string, string> = {
  ACADEMIC: "學術快報",
  LAB_LIFE: "實驗室日常",
  HONOR: "榮譽榜",
};

export default async function DashboardPostsPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.dashboardPost.findMany({
      where: { deletedAt: null },
      orderBy: { publishedDate: "desc" },
    }),
    prisma.dashboardPost.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">動態佈告欄</h1>
        <Link
          href="/admin/dashboard-posts/new"
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          新增
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted">尚無內容。</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {items.map((p) => (
            <li key={p.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <span className="text-xs text-muted">
                    {CATEGORY_LABEL[p.category]} ·{" "}
                    {p.publishedDate.toISOString().slice(0, 10)}
                  </span>
                </div>
                <p className="mt-1 truncate text-sm font-medium">{p.title}</p>
              </div>
              <ContentRowActions
                model="dashboardPost"
                id={p.id}
                status={p.status}
                deleted={false}
                editPath={`/admin/dashboard-posts/${p.id}`}
                listPath="/admin/dashboard-posts"
              />
            </li>
          ))}
        </ul>
      )}

      {deleted.length > 0 && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer text-sm text-muted">
            已刪除({deleted.length})
          </summary>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {deleted.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <span className="truncate text-sm text-muted line-through">
                  {p.title}
                </span>
                <ContentRowActions
                  model="dashboardPost"
                  id={p.id}
                  status={p.status}
                  deleted
                  editPath=""
                  listPath="/admin/dashboard-posts"
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

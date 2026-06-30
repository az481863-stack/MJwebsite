import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentRowActions } from "../content-row-actions";
import { TeamList } from "./team-list";

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

  const rows = items.map((m) => ({
    id: m.id,
    name: m.name,
    tier: m.tier,
    researchTopic: m.researchTopic,
    status: m.status,
  }));
  // 發布/刪除等改動後,以「id+狀態」簽章為 key 讓清單重新掛載取最新資料;
  // 純拖曳排序不改變此集合,故拖曳途中不會重掛。
  const signature = rows.map((r) => `${r.id}:${r.status}`).join(",");

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">現役成員</h1>
        <Link
          href="/admin/team/new"
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          新增
        </Link>
      </header>

      <TeamList key={signature} initial={rows} />

      {deleted.length > 0 && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer text-sm text-muted">
            已刪除({deleted.length})
          </summary>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {deleted.map((m) => (
              <li
                key={m.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="min-w-0 truncate text-sm text-muted line-through">
                  {m.name}
                </span>
                <ContentRowActions
                  model="teamMember"
                  id={m.id}
                  status={m.status}
                  deleted
                  editPath=""
                  listPath="/admin/team"
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ContentRowActions } from "../content-row-actions";
import { AlumniList } from "./alumni-list";

export default async function AlumniAdminPage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const [items, deleted] = await Promise.all([
    prisma.alumnus.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: "asc" }, { gradYear: "desc" }],
    }),
    prisma.alumnus.findMany({
      where: { deletedAt: { not: null } },
      orderBy: { deletedAt: "desc" },
    }),
  ]);

  const rows = items.map((a) => ({
    id: a.id,
    name: a.name,
    gradYear: a.gradYear,
    destination: a.destination,
    status: a.status,
  }));
  // 發布/刪除後以「id+狀態」簽章為 key 重新掛載取最新;純拖曳排序不改變此集合。
  const signature = rows.map((r) => `${r.id}:${r.status}`).join(",");

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">歷屆成員去向</h1>
        <Link
          href="/admin/alumni/new"
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          新增
        </Link>
      </header>

      <AlumniList key={signature} initial={rows} />

      {deleted.length > 0 && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer text-sm text-muted">
            已刪除({deleted.length})
          </summary>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {deleted.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-4 py-3"
              >
                <span className="min-w-0 truncate text-sm text-muted line-through">
                  {a.name}({a.gradYear})
                </span>
                <ContentRowActions
                  model="alumnus"
                  id={a.id}
                  status={a.status}
                  deleted
                  editPath=""
                  listPath="/admin/alumni"
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}

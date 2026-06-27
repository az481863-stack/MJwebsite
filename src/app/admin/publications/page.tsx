// Publications 列表。管理員看全部;學生只看自己的(可建草稿)。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/ai/gemini";
import { AdminListShell } from "../content-list-shell";
import { WordQuickAdd } from "@/components/admin/WordQuickAdd";
import { quickAddPublicationFromWord } from "./ai-actions";

export default async function PublicationsAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  const isAdmin = roleAtLeast(me.role, "ADMIN");
  const aiEnabled = isAiEnabled();

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
    <div className="space-y-5">
      {aiEnabled && (
        <WordQuickAdd
          action={quickAddPublicationFromWord}
          hint="上傳一份含論文書目的 Word(.docx),AI 會抽取作者/標題/期刊/年份/DOI 產生草稿,供你核對後發布。"
        />
      )}
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
    </div>
  );
}

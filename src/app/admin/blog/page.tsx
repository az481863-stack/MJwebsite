// Blog 列表。管理員看全部;學生只看自己的(可建草稿)。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/ai/gemini";
import { AdminListShell } from "../content-list-shell";
import { WordQuickAdd } from "@/components/admin/WordQuickAdd";
import { quickAddBlogFromWord } from "./ai-actions";

export default async function BlogAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  const isAdmin = roleAtLeast(me.role, "ADMIN");
  const aiEnabled = isAiEnabled();

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
    <div className="space-y-5">
      {aiEnabled && (
        <WordQuickAdd
          action={quickAddBlogFromWord}
          hint="上傳一份 Word(.docx),AI 會重寫整理並產生中英兩版內文草稿,供你審核後發布。"
        />
      )}
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
    </div>
  );
}

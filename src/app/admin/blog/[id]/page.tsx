import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateBlogPost } from "../actions";
import { BlogForm } from "../blog-form";

export default async function EditBlogPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  const { id } = await params;
  const p = await prisma.blogPost.findUnique({ where: { id } });
  if (!p || p.deletedAt) notFound();

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  if (!isAdmin && (p.createdBy !== me.id || p.status !== "DRAFT")) {
    redirect("/admin/blog");
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯文章</h1>
      <BlogForm
        action={updateBlogPost}
        canPublish={isAdmin}
        initial={{
          id: p.id,
          titleZh: p.titleZh,
          titleEn: p.titleEn,
          summary: p.summary,
          summaryEn: p.summaryEn,
          bodyZh: p.bodyZh,
          bodyEn: p.bodyEn,
          coverUrl: p.coverUrl,
          publishedDate: p.publishedDate.toISOString().slice(0, 10),
        }}
      />
    </div>
  );
}

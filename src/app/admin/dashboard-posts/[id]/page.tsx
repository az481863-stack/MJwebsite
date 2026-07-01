import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateDashboardPost } from "../actions";
import { DashboardPostForm } from "../dashboard-post-form";

export default async function EditDashboardPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const { id } = await params;
  const post = await prisma.dashboardPost.findUnique({ where: { id } });
  if (!post || post.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯佈告</h1>
      <DashboardPostForm
        action={updateDashboardPost}
        initial={{
          id: post.id,
          category: post.category,
          title: post.title,
          titleEn: post.titleEn,
          body: post.body,
          bodyEn: post.bodyEn,
          imageUrl: post.imageUrl,
          linkUrl: post.linkUrl,
          linkText: post.linkText,
          linkTextEn: post.linkTextEn,
          publishedDate: post.publishedDate.toISOString().slice(0, 10),
          expiresAt: post.expiresAt
            ? post.expiresAt.toISOString().slice(0, 10)
            : "",
        }}
      />
    </div>
  );
}

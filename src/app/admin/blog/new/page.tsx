import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createBlogPost } from "../actions";
import { BlogForm } from "../blog-form";

export default async function NewBlogPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增文章</h1>
      <BlogForm action={createBlogPost} canPublish={roleAtLeast(me.role, "ADMIN")} />
    </div>
  );
}

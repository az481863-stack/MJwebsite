import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";

// /admin 入口:管理員導向會員管理,學生導向其可投稿的 Blog。
export default async function AdminHome() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  if (roleAtLeast(me.role, "ADMIN")) redirect("/admin/members");
  redirect("/admin/blog");
}

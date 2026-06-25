// 登入頁(server):已登入(有有效會員)者直接導向 /account;否則顯示登入表單。

import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const me = await getCurrentMember();
  if (me) redirect(dest);
  return <LoginForm />;
}

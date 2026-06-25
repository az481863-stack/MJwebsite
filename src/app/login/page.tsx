// 登入頁(server):已登入(有有效會員)者直接導向 /account;否則顯示登入表單。

import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const me = await getCurrentMember();
  if (me) redirect("/account");
  return <LoginForm />;
}

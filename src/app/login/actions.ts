"use server";

// 登入 / 登出(密碼登入;Google 登入走 client OAuth + /auth/callback)。

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export interface LoginResult {
  ok: boolean;
  message: string;
}

export async function signInWithPassword(
  _prev: LoginResult | null,
  formData: FormData,
): Promise<LoginResult> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "請輸入 email 與密碼。" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error || !data.user) {
    return { ok: false, message: "登入失敗,請確認 email 與密碼。" };
  }

  // 確認對應到有效會員(ACTIVE 且未刪除)。
  const member = await prisma.member.findFirst({
    where: { authUserId: data.user.id, deletedAt: null },
  });
  if (!member || member.status !== "ACTIVE") {
    await supabase.auth.signOut();
    return { ok: false, message: "此帳號未啟用或已停用。" };
  }

  redirect("/account");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

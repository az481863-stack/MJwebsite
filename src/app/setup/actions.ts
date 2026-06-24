"use server";

// 一次性建立「首位最高權限者」(B:最高權限者不從邀請產生)。
// 雙重防護:(1) 系統尚無最高權限者才作用;(2) 需輸入 SETUP_SECRET 密語。
// 建立後此流程自動失效。

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export interface SetupResult {
  ok: boolean;
  message: string;
}

// 系統是否已有最高權限者(有則 /setup 失效)。
export async function hasSuperadmin(): Promise<boolean> {
  const count = await prisma.member.count({
    where: { role: "SUPERADMIN", deletedAt: null },
  });
  return count > 0;
}

export async function createFirstSuperadmin(
  _prev: SetupResult | null,
  formData: FormData,
): Promise<SetupResult> {
  // 防護 1:已有最高權限者即拒絕。
  if (await hasSuperadmin()) {
    return { ok: false, message: "系統已完成初始設定,此頁已失效。" };
  }

  // 防護 2:密語驗證。
  const secret = process.env.SETUP_SECRET;
  if (!secret) {
    return {
      ok: false,
      message: "尚未設定 SETUP_SECRET 環境變數,請先設定後再試。",
    };
  }
  if (String(formData.get("secret") ?? "") !== secret) {
    return { ok: false, message: "設定密語不正確。" };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, message: "請輸入有效的 email。" };
  }
  if (password.length < 8) {
    return { ok: false, message: "密碼至少需 8 個字元。" };
  }
  if (password !== confirm) {
    return { ok: false, message: "兩次輸入的密碼不一致。" };
  }

  // 建立 Supabase auth 使用者。
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    return {
      ok: false,
      message: "建立帳號失敗,可能此 email 已註冊。",
    };
  }

  // 建立或升級 Member 為最高權限者。
  const existing = await prisma.member.findUnique({
    where: { loginEmail: email },
  });
  if (existing) {
    await prisma.member.update({
      where: { id: existing.id },
      data: { role: "SUPERADMIN", status: "ACTIVE", authUserId: data.user.id },
    });
  } else {
    await prisma.member.create({
      data: {
        loginEmail: email,
        role: "SUPERADMIN",
        status: "ACTIVE",
        authUserId: data.user.id,
      },
    });
  }

  // 自動登入並導向會員頁。
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({ email, password });
  redirect("/account");
}

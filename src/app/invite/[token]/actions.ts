"use server";

// 啟用流程(C-1 步驟 2 / C-3):點邀請連結 → 設定密碼 → 啟用帳號。
// 密碼交給 Supabase Auth 雜湊儲存(C-3:勿自製雜湊)。

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/tokens";

export interface ActivateResult {
  ok: boolean;
  message: string;
}

// 驗證 token 是否有效(供頁面渲染前判斷;回傳對應 email 或 null)。
export async function lookupInvitation(rawToken: string) {
  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { member: true },
  });
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt < new Date() ||
    !invitation.member ||
    invitation.member.deletedAt
  ) {
    return null;
  }
  return { email: invitation.email };
}

export async function activateAccount(
  _prev: ActivateResult | null,
  formData: FormData,
): Promise<ActivateResult> {
  const rawToken = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 8) {
    return { ok: false, message: "密碼至少需 8 個字元。" };
  }
  if (password !== confirm) {
    return { ok: false, message: "兩次輸入的密碼不一致。" };
  }

  const invitation = await prisma.invitation.findUnique({
    where: { tokenHash: hashToken(rawToken) },
    include: { member: true },
  });
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt < new Date() ||
    !invitation.member ||
    invitation.member.deletedAt
  ) {
    return { ok: false, message: "邀請連結無效或已過期,請向管理員索取新連結。" };
  }

  const member = invitation.member;
  const admin = createAdminClient();

  // 建立 Supabase auth 使用者(email 直接視為已驗證)。
  const { data: created, error: createErr } =
    await admin.auth.admin.createUser({
      email: member.loginEmail,
      password,
      email_confirm: true,
    });

  if (createErr || !created.user) {
    return {
      ok: false,
      message:
        "建立帳號失敗,可能此 email 已註冊。請聯絡管理員協助處理。",
    };
  }

  // 更新會員為啟用、綁定 authUserId,並作廢該邀請。
  await prisma.$transaction(async (tx) => {
    await tx.member.update({
      where: { id: member.id },
      data: { authUserId: created.user.id, status: "ACTIVE" },
    });
    await tx.invitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    });
  });

  // 自動登入(設定 session cookie),再導向 info 頁詢問綁 Google。
  const supabase = await createClient();
  await supabase.auth.signInWithPassword({
    email: member.loginEmail,
    password,
  });

  redirect("/account?welcome=1");
}

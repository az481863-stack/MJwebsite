"use server";

// 會員 info 頁 server actions(C-5):改密碼、管理常用 email(多筆)。
// Google 連結/解除走 client 端 supabase(linkIdentity / unlinkIdentity)。

import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function changePassword(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");
  if (password.length < 8) {
    return { ok: false, message: "密碼至少需 8 個字元。" };
  }
  if (password !== confirm) {
    return { ok: false, message: "兩次輸入的密碼不一致。" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: "更新密碼失敗,請稍後再試。" };
  }
  return { ok: true, message: "密碼已更新。" };
}

export async function addContactEmail(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "請輸入有效的 email。" };
  }

  const exists = await prisma.contactEmail.findFirst({
    where: { memberId: me.id, email },
  });
  if (exists) {
    return { ok: false, message: "此 email 已在清單中。" };
  }

  await prisma.contactEmail.create({
    data: { memberId: me.id, email },
  });
  revalidatePath("/account");
  return { ok: true, message: "已新增常用 email。" };
}

export async function removeContactEmail(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const id = String(formData.get("id") ?? "");
  // 限定刪除自己的 email。
  await prisma.contactEmail.deleteMany({
    where: { id, memberId: me.id },
  });
  revalidatePath("/account");
  return { ok: true, message: "已移除。" };
}

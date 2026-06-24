"use server";

// 會員管理 server actions(C-1 邀請、C-3 重寄、B 角色/停用)。
// 權限:邀請與停用需 ADMIN 以上;改角色與移除需 SUPERADMIN。

import { revalidatePath } from "next/cache";
import { Role } from "@/generated/prisma/client";
import { getCurrentMember, isLastSuperadmin, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendInvitationEmail } from "@/lib/email";
import { generateInviteToken, inviteExpiry } from "@/lib/tokens";
import { siteUrl } from "@/lib/site";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function normalizeEmail(raw: FormDataEntryValue | null): string {
  return String(raw ?? "")
    .trim()
    .toLowerCase();
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── C-1 新增邀請 ──────────────────────────────────────────────
export async function inviteMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }

  const email = normalizeEmail(formData.get("email"));
  if (!EMAIL_RE.test(email)) {
    return { ok: false, message: "請輸入有效的 email。" };
  }

  // 角色規則:管理員邀請固定學生;僅最高權限者可指定(學生/管理員)。
  let role: Role = "STUDENT";
  if (me.role === "SUPERADMIN") {
    const requested = String(formData.get("role") ?? "STUDENT");
    role = requested === "ADMIN" ? "ADMIN" : "STUDENT";
  }

  // 不可重複:已存在未刪除會員即擋下。
  const existing = await prisma.member.findFirst({
    where: { loginEmail: email, deletedAt: null },
  });
  if (existing) {
    return { ok: false, message: "此 email 已是會員或已被邀請。" };
  }

  const { raw, hash } = generateInviteToken();

  await prisma.$transaction(async (tx) => {
    const member = await tx.member.create({
      data: {
        loginEmail: email,
        role,
        status: "PENDING",
        createdBy: me.id,
      },
    });
    await tx.invitation.create({
      data: {
        email,
        role,
        tokenHash: hash,
        expiresAt: inviteExpiry(),
        memberId: member.id,
        createdBy: me.id,
      },
    });
  });

  const result = await sendInvitationEmail({
    to: email,
    inviteUrl: `${siteUrl()}/invite/${raw}`,
  });

  revalidatePath("/admin/members");
  return {
    ok: true,
    message: result.delivered
      ? `已邀請 ${email},邀請信已寄出。`
      : `已邀請 ${email}(開發模式:邀請連結已印至伺服器 console)。`,
  };
}

// ── C-3 重寄邀請(舊連結失效、發新連結)──────────────────────
export async function resendInvite(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }

  const memberId = String(formData.get("memberId") ?? "");
  const member = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
  });
  if (!member || member.status !== "PENDING") {
    return { ok: false, message: "此會員非待啟用狀態,無法重寄。" };
  }

  const { raw, hash } = generateInviteToken();

  await prisma.$transaction(async (tx) => {
    // 舊邀請一律作廢
    await tx.invitation.updateMany({
      where: { memberId, acceptedAt: null, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await tx.invitation.create({
      data: {
        email: member.loginEmail,
        role: member.role,
        tokenHash: hash,
        expiresAt: inviteExpiry(),
        memberId: member.id,
        createdBy: me.id,
      },
    });
  });

  const result = await sendInvitationEmail({
    to: member.loginEmail,
    inviteUrl: `${siteUrl()}/invite/${raw}`,
  });

  revalidatePath("/admin/members");
  return {
    ok: true,
    message: result.delivered
      ? "已重寄邀請信,舊連結失效。"
      : "已重寄(開發模式:新連結已印至 console),舊連結失效。",
  };
}

// ── B 改角色(僅最高權限者;防呆最後一位最高權限者降級)──────
export async function changeRole(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || me.role !== "SUPERADMIN") {
    return { ok: false, message: "僅最高權限者可變更角色。" };
  }

  const memberId = String(formData.get("memberId") ?? "");
  const next = String(formData.get("role") ?? "");
  if (!["STUDENT", "ADMIN", "SUPERADMIN"].includes(next)) {
    return { ok: false, message: "角色不正確。" };
  }
  const nextRole = next as Role;

  const target = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
  });
  if (!target) return { ok: false, message: "找不到該會員。" };

  // 防呆:不可降級最後一位最高權限者。
  if (
    target.role === "SUPERADMIN" &&
    nextRole !== "SUPERADMIN" &&
    (await isLastSuperadmin(memberId))
  ) {
    return { ok: false, message: "不可降級最後一位最高權限者。" };
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { role: nextRole, updatedBy: me.id },
  });

  revalidatePath("/admin/members");
  return { ok: true, message: "角色已更新。" };
}

// ── C-2 停用(軟性,保留歷史;同時封鎖 Supabase 登入)──────────
export async function disableMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }

  const memberId = String(formData.get("memberId") ?? "");
  if (memberId === me.id) {
    return { ok: false, message: "不可停用自己。" };
  }

  const target = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
  });
  if (!target) return { ok: false, message: "找不到該會員。" };

  // 防呆:不可停用最後一位最高權限者。
  if (await isLastSuperadmin(memberId)) {
    return { ok: false, message: "不可停用最後一位最高權限者。" };
  }

  await prisma.member.update({
    where: { id: memberId },
    data: { status: "DISABLED", updatedBy: me.id },
  });

  // 同步封鎖 Supabase 登入(若已啟用)。
  if (target.authUserId) {
    const admin = createAdminClient();
    // ban 期限設很長,等同停用;還原時解除。
    await admin.auth.admin.updateUserById(target.authUserId, {
      ban_duration: "876000h",
    });
  }

  revalidatePath("/admin/members");
  return { ok: true, message: "會員已停用(歷史資料保留)。" };
}

// ── 還原停用會員 ─────────────────────────────────────────────
export async function restoreMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }

  const memberId = String(formData.get("memberId") ?? "");
  const target = await prisma.member.findFirst({
    where: { id: memberId, deletedAt: null },
  });
  if (!target) return { ok: false, message: "找不到該會員。" };

  // 曾啟用過(有 authUserId)→ 回 ACTIVE;從未啟用 → 回 PENDING。
  await prisma.member.update({
    where: { id: memberId },
    data: {
      status: target.authUserId ? "ACTIVE" : "PENDING",
      updatedBy: me.id,
    },
  });

  if (target.authUserId) {
    const admin = createAdminClient();
    await admin.auth.admin.updateUserById(target.authUserId, {
      ban_duration: "none",
    });
  }

  revalidatePath("/admin/members");
  return { ok: true, message: "會員已還原。" };
}

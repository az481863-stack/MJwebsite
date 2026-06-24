// 伺服器端 Auth / RBAC 工具(B:三層角色,權限往上累加)。
// 僅供 server component / server action / route handler 使用。

import { Role } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

// 角色高低(數字越大權限越高);用於「至少某層級」判斷。
const ROLE_ORDER: Record<Role, number> = {
  STUDENT: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_ORDER[role] >= ROLE_ORDER[min];
}

// 取得目前登入的 Supabase auth 使用者(尚未對應到 Member)。
export async function getAuthUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// 取得目前登入會員(必須 ACTIVE 且未軟刪除才視為有效)。
export async function getCurrentMember() {
  const user = await getAuthUser();
  if (!user) return null;

  const member = await prisma.member.findFirst({
    where: { authUserId: user.id, deletedAt: null },
  });
  if (!member || member.status !== "ACTIVE") return null;
  return member;
}

// 要求至少某層級;不足則回傳 null(呼叫端決定導向/拒絕)。
export async function getMemberAtLeast(min: Role) {
  const member = await getCurrentMember();
  if (!member || !roleAtLeast(member.role, min)) return null;
  return member;
}

// 是否為「最後一位最高權限者」(防呆:不可刪除或降級)。
export async function isLastSuperadmin(memberId: string): Promise<boolean> {
  const count = await prisma.member.count({
    where: { role: "SUPERADMIN", status: { not: "DISABLED" }, deletedAt: null },
  });
  if (count > 1) return false;
  const target = await prisma.member.findUnique({ where: { id: memberId } });
  return target?.role === "SUPERADMIN";
}

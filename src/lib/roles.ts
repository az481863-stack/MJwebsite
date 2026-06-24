// 角色高低判斷(純函式,可在 client/server 共用)。
// 權限往上累加:STUDENT < ADMIN < SUPERADMIN。

import { Role } from "@/generated/prisma/client";

const ROLE_ORDER: Record<Role, number> = {
  STUDENT: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export function roleAtLeast(role: Role, min: Role): boolean {
  return ROLE_ORDER[role] >= ROLE_ORDER[min];
}

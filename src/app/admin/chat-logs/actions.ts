"use server";

// 前台小幫手對話管理頁的 server action:切換 IP 封鎖(switch)。
// 權限:ADMIN 以上(server 端自行檢查,不只靠 UI)。

import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { setIpBlocked } from "@/lib/chatlog";

export interface ToggleResult {
  ok: boolean;
  message?: string;
}

// blocked=true 代表關掉小幫手(封鎖該 IP);false 代表恢復。
export async function toggleIpBlock(
  ip: string,
  blocked: boolean,
): Promise<ToggleResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足" };
  }
  if (!ip || ip === "unknown") {
    return { ok: false, message: "無效的 IP" };
  }
  try {
    await setIpBlocked(ip, blocked);
    revalidatePath("/admin/chat-logs");
    revalidatePath(`/admin/chat-logs/${encodeURIComponent(ip)}`);
    return { ok: true };
  } catch {
    return { ok: false, message: "更新失敗" };
  }
}

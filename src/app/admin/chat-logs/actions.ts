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

// ipHash = 已雜湊的 IP(後台不接觸原始 IP)。
// blocked=true 代表關掉小幫手(封鎖);false 代表恢復。
export async function toggleIpBlock(
  ipHash: string,
  blocked: boolean,
): Promise<ToggleResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足" };
  }
  if (!ipHash || ipHash === "unknown") {
    return { ok: false, message: "無效的識別碼" };
  }
  try {
    await setIpBlocked(ipHash, blocked);
    revalidatePath("/admin/chat-logs");
    revalidatePath(`/admin/chat-logs/${encodeURIComponent(ipHash)}`);
    return { ok: true };
  } catch {
    return { ok: false, message: "更新失敗" };
  }
}

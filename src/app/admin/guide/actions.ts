"use server";

// 後台「使用說明」頁的儲存(ADMIN 以上)。
// 內容為 Markdown,存於 SiteSettings.adminGuide;同時作為「管理員小幫手」的知識庫。

import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function saveAdminGuide(markdown: string): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }
  const data = { adminGuide: markdown, updatedBy: me.id };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  revalidatePath("/admin/guide");
  return { ok: true, message: "使用說明已儲存。" };
}

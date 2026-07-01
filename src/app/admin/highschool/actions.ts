"use server";

// 給高中生的話(G-9)。單篇長文,故為「建立或更新唯一一筆」。需 ADMIN 以上。

import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function saveHighSchoolMessage(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { ok: false, message: "請填寫內容。" };
  const contentEn = String(formData.get("contentEn") ?? "").trim() || null;
  const status = formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT";

  const existing = await prisma.highSchoolMessage.findFirst({
    where: { deletedAt: null },
  });

  if (existing) {
    await prisma.highSchoolMessage.update({
      where: { id: existing.id },
      data: { content, contentEn, status, updatedBy: me.id },
    });
  } else {
    await prisma.highSchoolMessage.create({
      data: { content, contentEn, status, createdBy: me.id, updatedBy: me.id },
    });
  }

  revalidatePath("/admin/highschool");
  revalidatePath("/", "layout");
  return {
    ok: true,
    message: status === "PUBLISHED" ? "已儲存並發布。" : "已儲存為草稿。",
  };
}

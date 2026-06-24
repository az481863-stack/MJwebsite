"use server";

// 產學與專利(G-8)建立/編輯。需 ADMIN 以上。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IndustryCategory } from "@/generated/prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const CATS = ["PATENT", "LICENSABLE", "COLLABORATION"];

function parse(formData: FormData) {
  return {
    category: String(formData.get("category") ?? ""),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

export async function createIndustry(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!CATS.includes(f.category) || !f.title || !f.description)
    return { ok: false, message: "請填寫分類、標題與說明。" };

  await prisma.industryItem.create({
    data: {
      category: f.category as IndustryCategory,
      title: f.title,
      description: f.description,
      sortOrder: f.sortOrder,
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/industry");
  revalidatePath("/", "layout");
  redirect("/admin/industry");
}

export async function updateIndustry(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !CATS.includes(f.category) || !f.title || !f.description)
    return { ok: false, message: "請填寫分類、標題與說明。" };

  await prisma.industryItem.update({
    where: { id },
    data: {
      category: f.category as IndustryCategory,
      title: f.title,
      description: f.description,
      sortOrder: f.sortOrder,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/industry");
  revalidatePath("/", "layout");
  redirect("/admin/industry");
}

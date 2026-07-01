"use server";

// 課程紀錄(G-7)建立/編輯。需 ADMIN 以上。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    nameEn: String(formData.get("nameEn") ?? "").trim() || null,
    outline: String(formData.get("outline") ?? "").trim(),
    outlineEn: String(formData.get("outlineEn") ?? "").trim() || null,
    handoutUrl: String(formData.get("handoutUrl") ?? "").trim() || null,
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

export async function createCourse(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!f.name || !f.outline)
    return { ok: false, message: "請填寫課程名稱與大綱。" };

  await prisma.course.create({
    data: {
      name: f.name,
      nameEn: f.nameEn,
      outline: f.outline,
      outlineEn: f.outlineEn,
      handoutUrl: f.handoutUrl,
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/courses");
  revalidatePath("/", "layout");
  redirect("/admin/courses");
}

export async function updateCourse(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !f.name || !f.outline)
    return { ok: false, message: "請填寫課程名稱與大綱。" };

  await prisma.course.update({
    where: { id },
    data: {
      name: f.name,
      nameEn: f.nameEn,
      outline: f.outline,
      outlineEn: f.outlineEn,
      handoutUrl: f.handoutUrl,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/courses");
  revalidatePath("/", "layout");
  redirect("/admin/courses");
}

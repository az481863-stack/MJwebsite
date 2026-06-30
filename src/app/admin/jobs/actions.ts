"use server";

// 學術能階職缺表(G-5)建立/編輯。需 ADMIN 以上。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { RecruitStatus } from "@/generated/prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function parse(formData: FormData) {
  const slotsRaw = String(formData.get("slots") ?? "").trim();
  return {
    title: String(formData.get("title") ?? "").trim(),
    titleEn: String(formData.get("titleEn") ?? "").trim() || null,
    recruitStatus: String(formData.get("recruitStatus") ?? "OPEN"),
    slots: slotsRaw ? parseInt(slotsRaw, 10) : null,
    description: String(formData.get("description") ?? "").trim(),
    descriptionEn: String(formData.get("descriptionEn") ?? "").trim() || null,
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

export async function createJob(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!f.title || !f.description)
    return { ok: false, message: "請填寫職位名稱與說明。" };

  await prisma.jobOpening.create({
    data: {
      title: f.title,
      titleEn: f.titleEn,
      recruitStatus: (f.recruitStatus === "FULL" ? "FULL" : "OPEN") as RecruitStatus,
      slots: f.slots,
      description: f.description,
      descriptionEn: f.descriptionEn,
      sortOrder: f.sortOrder,
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/", "layout");
  redirect("/admin/jobs");
}

export async function updateJob(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !f.title || !f.description)
    return { ok: false, message: "請填寫職位名稱與說明。" };

  await prisma.jobOpening.update({
    where: { id },
    data: {
      title: f.title,
      titleEn: f.titleEn,
      recruitStatus: (f.recruitStatus === "FULL" ? "FULL" : "OPEN") as RecruitStatus,
      slots: f.slots,
      description: f.description,
      descriptionEn: f.descriptionEn,
      sortOrder: f.sortOrder,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/jobs");
  revalidatePath("/", "layout");
  redirect("/admin/jobs");
}

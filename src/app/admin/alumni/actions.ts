"use server";

// 校友去向(G-4)建立/編輯。需 ADMIN 以上。

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
    gradYear: parseInt(String(formData.get("gradYear") ?? ""), 10),
    destination: String(formData.get("destination") ?? "").trim(),
    photoUrl: String(formData.get("photoUrl") ?? "").trim() || null,
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

// 2.4:拖曳排序——依傳入順序把每位歷屆成員的 sortOrder 設為其索引。需 ADMIN 以上。
export async function reorderAlumni(orderedIds: string[]): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const ids = orderedIds.filter((id) => typeof id === "string" && id);
  if (ids.length === 0) return { ok: false, message: "順序資料無效。" };

  await prisma.$transaction(
    ids.map((id, i) =>
      prisma.alumnus.update({
        where: { id },
        data: { sortOrder: i, updatedBy: me.id },
      }),
    ),
  );
  revalidatePath("/admin/alumni");
  revalidatePath("/", "layout");
  return { ok: true, message: "順序已更新。" };
}

export async function createAlumnus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!f.name || !f.gradYear || !f.destination)
    return { ok: false, message: "請填寫姓名、畢業年份與去向。" };

  await prisma.alumnus.create({
    data: {
      name: f.name,
      gradYear: f.gradYear,
      destination: f.destination,
      photoUrl: f.photoUrl,
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/alumni");
  revalidatePath("/", "layout");
  redirect("/admin/alumni");
}

export async function updateAlumnus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !f.name || !f.gradYear || !f.destination)
    return { ok: false, message: "請填寫姓名、畢業年份與去向。" };

  await prisma.alumnus.update({
    where: { id },
    data: {
      name: f.name,
      gradYear: f.gradYear,
      destination: f.destination,
      photoUrl: f.photoUrl,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/alumni");
  revalidatePath("/", "layout");
  redirect("/admin/alumni");
}

"use server";

// 現役成員(G-3)建立/編輯。需 ADMIN 以上。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { TeamTier } from "@/generated/prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const TIERS = ["POSTDOC", "PHD", "MASTER", "UNDERGRAD"];

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    tier: String(formData.get("tier") ?? ""),
    photoUrl: String(formData.get("photoUrl") ?? "").trim() || null,
    researchTopic: String(formData.get("researchTopic") ?? "").trim() || null,
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
  };
}

export async function createTeamMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!f.name || !TIERS.includes(f.tier))
    return { ok: false, message: "請填寫姓名與身份階層。" };

  await prisma.teamMember.create({
    data: {
      name: f.name,
      tier: f.tier as TeamTier,
      photoUrl: f.photoUrl,
      researchTopic: f.researchTopic,
      sortOrder: f.sortOrder,
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
  redirect("/admin/team");
}

// 2.3:拖曳排序——依傳入的順序把每位成員的 sortOrder 設為其索引。需 ADMIN 以上。
export async function reorderTeam(orderedIds: string[]): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const ids = orderedIds.filter((id) => typeof id === "string" && id);
  if (ids.length === 0) return { ok: false, message: "順序資料無效。" };

  await prisma.$transaction(
    ids.map((id, i) =>
      prisma.teamMember.update({
        where: { id },
        data: { sortOrder: i, updatedBy: me.id },
      }),
    ),
  );
  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
  return { ok: true, message: "順序已更新。" };
}

export async function updateTeamMember(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !f.name || !TIERS.includes(f.tier))
    return { ok: false, message: "請填寫姓名與身份階層。" };

  await prisma.teamMember.update({
    where: { id },
    data: {
      name: f.name,
      tier: f.tier as TeamTier,
      photoUrl: f.photoUrl,
      researchTopic: f.researchTopic,
      sortOrder: f.sortOrder,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/team");
  revalidatePath("/", "layout");
  redirect("/admin/team");
}

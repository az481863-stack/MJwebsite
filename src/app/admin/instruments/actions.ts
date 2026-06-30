"use server";

// 階段五:儀器管理 server action。
// - 新增/編輯/刪除儀器、指派負責人:限 ADMIN 以上。
// - 改機況、代簽:ADMIN 以上「或」該機台負責人(B-2)。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hoursBetween, isManagerOf } from "@/lib/instruments";
import { InstrumentStatus } from "@/generated/prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
}

// 解析以逗號/換行分隔的負責人 email,對應到有效會員,寫入 InstrumentManager。
async function syncManagers(instrumentId: string, raw: string, byId: string) {
  const emails = Array.from(
    new Set(
      raw
        .split(/[\n,]/)
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
  await prisma.instrumentManager.deleteMany({ where: { instrumentId } });
  if (emails.length === 0) return;
  const members = await prisma.member.findMany({
    where: { loginEmail: { in: emails }, deletedAt: null },
    select: { id: true },
  });
  if (members.length === 0) return;
  await prisma.instrumentManager.createMany({
    data: members.map((m) => ({ instrumentId, memberId: m.id, createdBy: byId })),
    skipDuplicates: true,
  });
}

function parse(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    nameEn: String(formData.get("nameEn") ?? "").trim() || null,
    purpose: String(formData.get("purpose") ?? "").trim(),
    purposeEn: String(formData.get("purposeEn") ?? "").trim() || null,
    photoUrl: String(formData.get("photoUrl") ?? "").trim() || null,
    status: String(formData.get("status") ?? "NORMAL") === "MAINTENANCE"
      ? "MAINTENANCE"
      : "NORMAL",
    sortOrder: parseInt(String(formData.get("sortOrder") ?? "0"), 10) || 0,
    managerEmails: String(formData.get("managerEmails") ?? ""),
  };
}

export async function createInstrument(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!f.name || !f.purpose)
    return { ok: false, message: "請填寫儀器名稱與用途說明。" };

  const created = await prisma.instrument.create({
    data: {
      name: f.name,
      nameEn: f.nameEn,
      purpose: f.purpose,
      purposeEn: f.purposeEn,
      photoUrl: f.photoUrl,
      status: f.status as InstrumentStatus,
      sortOrder: f.sortOrder,
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  await syncManagers(created.id, f.managerEmails, me.id);

  revalidatePath("/admin/instruments");
  revalidatePath("/", "layout");
  redirect("/admin/instruments");
}

export async function updateInstrument(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !f.name || !f.purpose)
    return { ok: false, message: "請填寫儀器名稱與用途說明。" };

  await prisma.instrument.update({
    where: { id },
    data: {
      name: f.name,
      nameEn: f.nameEn,
      purpose: f.purpose,
      purposeEn: f.purposeEn,
      photoUrl: f.photoUrl,
      status: f.status as InstrumentStatus,
      sortOrder: f.sortOrder,
      updatedBy: me.id,
    },
  });
  await syncManagers(id, f.managerEmails, me.id);

  revalidatePath("/admin/instruments");
  revalidatePath(`/admin/instruments/${id}`);
  revalidatePath("/", "layout");
  redirect("/admin/instruments");
}

// 拖曳排序——依傳入順序把每台儀器的 sortOrder 設為其索引。限 ADMIN(負責人只見子集,不開放排序)。
export async function reorderInstruments(
  orderedIds: string[],
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const ids = orderedIds.filter((id) => typeof id === "string" && id);
  if (ids.length === 0) return { ok: false, message: "順序資料無效。" };

  await prisma.$transaction(
    ids.map((id, i) =>
      prisma.instrument.update({
        where: { id },
        data: { sortOrder: i, updatedBy: me.id },
      }),
    ),
  );
  revalidatePath("/admin/instruments");
  revalidatePath("/", "layout");
  return { ok: true, message: "順序已更新。" };
}

export async function softDeleteInstrument(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "參數錯誤。" };
  await prisma.instrument.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: me.id },
  });
  revalidatePath("/admin/instruments");
  revalidatePath("/", "layout");
  return { ok: true, message: "已刪除。" };
}

// 改機況狀態(NORMAL↔MAINTENANCE);與簽退脫鉤,由負責人/管理員手動調整。
export async function setInstrumentStatus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || (status !== "NORMAL" && status !== "MAINTENANCE"))
    return { ok: false, message: "參數錯誤。" };
  const allowed = roleAtLeast(me.role, "ADMIN") || (await isManagerOf(me.id, id));
  if (!allowed) return { ok: false, message: "權限不足。" };

  await prisma.instrument.update({
    where: { id },
    data: { status: status as InstrumentStatus, updatedBy: me.id },
  });
  revalidatePath(`/admin/instruments/${id}`);
  revalidatePath("/admin/instruments");
  revalidatePath("/", "layout");
  return { ok: true, message: "已更新機況。" };
}

// 代簽:負責人/管理員代為簽退「使用中/逾時」紀錄。
// 一律標記代簽、機況預設正常、不觸發警報(CLAUDE.md 代簽豁免)。
export async function proxyCheckout(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  const reservationId = String(formData.get("reservationId") ?? "");
  if (!reservationId) return { ok: false, message: "參數錯誤。" };

  const r = await prisma.reservation.findUnique({
    where: { id: reservationId },
  });
  if (!r || r.deletedAt) return { ok: false, message: "找不到預約紀錄。" };
  if (r.status !== "IN_USE" && r.status !== "OVERDUE")
    return { ok: false, message: "此紀錄無需簽退。" };

  const allowed =
    roleAtLeast(me.role, "ADMIN") || (await isManagerOf(me.id, r.instrumentId));
  if (!allowed) return { ok: false, message: "權限不足。" };

  await prisma.$transaction([
    prisma.checkout.create({
      data: {
        reservationId: r.id,
        hours: hoursBetween(r.startAt, r.endAt),
        condition: "NORMAL",
        byMemberId: me.id,
        isProxy: true,
      },
    }),
    prisma.reservation.update({
      where: { id: r.id },
      data: { status: "CHECKED_OUT", updatedBy: me.id },
    }),
  ]);

  revalidatePath(`/admin/instruments/${r.instrumentId}`);
  revalidatePath("/admin/instruments");
  revalidatePath("/", "layout");
  return { ok: true, message: "已代簽結案。" };
}

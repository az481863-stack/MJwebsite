"use server";

// 階段五:學生端儀器預約 server action(預約 / 提前取消 / 本人簽退)。

import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  canReserve,
  hasOverlap,
  hoursBetween,
  getAnomalyRecipients,
} from "@/lib/instruments";
import { sendAnomalyAlert } from "@/lib/email";
import { ConditionReport } from "@/generated/prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
}

// 預約整點時段。client 傳絕對時間(ISO)+ 時數(小時)。
export async function reserve(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const instrumentId = String(formData.get("instrumentId") ?? "");
  const startISO = String(formData.get("startAt") ?? "");
  const hours = parseInt(String(formData.get("hours") ?? "0"), 10);

  const start = new Date(startISO);
  if (!instrumentId || isNaN(start.getTime()))
    return { ok: false, message: "參數錯誤。" };
  if (!Number.isInteger(hours) || hours < 1)
    return { ok: false, message: "時數須為 1 以上整數。" };
  // 整點檢查(台灣為 +08:00 整數時差,絕對時間亦落在整點)。
  if (start.getUTCMinutes() !== 0 || start.getUTCSeconds() !== 0)
    return { ok: false, message: "請選擇整點時段。" };
  if (start.getTime() <= Date.now())
    return { ok: false, message: "不可預約已過去的時段。" };

  const end = new Date(start.getTime() + hours * 60 * 60 * 1000);

  const inst = await prisma.instrument.findFirst({
    where: { id: instrumentId, deletedAt: null },
  });
  if (!inst) return { ok: false, message: "找不到儀器。" };
  if (inst.status === "MAINTENANCE")
    return { ok: false, message: "此儀器維護中,暫不開放預約。" };

  if (await hasOverlap(instrumentId, start, end))
    return { ok: false, message: "該時段已被預約,請另選時段。" };

  const settings = await getSettings();
  const check = await canReserve(me.id, hours, settings.instrumentMaxHours);
  if (!check.ok) {
    if (check.reason === "suspended")
      return { ok: false, message: "您有 3 筆逾時未簽退,預約權已暫停。請完成簽退後恢復。" };
    return {
      ok: false,
      message: `超過預約總時數上限(上限 ${check.maxHours} 小時,已用 ${check.usedHours} 小時)。`,
    };
  }

  await prisma.reservation.create({
    data: {
      instrumentId,
      memberId: me.id,
      startAt: start,
      endAt: end,
      status: "BOOKED",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/instruments");
  return { ok: true, message: "預約成功。" };
}

// 提前取消:僅本人、BOOKED、時段尚未開始。
export async function cancelReservation(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  const id = String(formData.get("reservationId") ?? "");
  const r = await prisma.reservation.findUnique({ where: { id } });
  if (!r || r.deletedAt || r.memberId !== me.id)
    return { ok: false, message: "找不到預約紀錄。" };
  if (r.status !== "BOOKED")
    return { ok: false, message: "此預約已無法取消。" };
  if (r.startAt.getTime() <= Date.now())
    return { ok: false, message: "時段已開始,無法取消(請於結束後簽退)。" };

  await prisma.reservation.update({
    where: { id },
    data: { status: "CANCELLED", cancelledAt: new Date(), updatedBy: me.id },
  });
  revalidatePath("/instruments");
  return { ok: true, message: "已取消預約。" };
}

// 本人簽退:確認時數 + 強制機況;🟡/🔴 即時寄異常警報。
export async function selfCheckout(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const reservationId = String(formData.get("reservationId") ?? "");
  const hours = parseInt(String(formData.get("hours") ?? "0"), 10);
  const condition = String(formData.get("condition") ?? "");
  const note = String(formData.get("anomalyNote") ?? "").trim() || null;

  if (!["NORMAL", "UNSTABLE", "BROKEN"].includes(condition))
    return { ok: false, message: "請回報機況。" };

  const r = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { instrument: { select: { id: true, name: true } } },
  });
  if (!r || r.deletedAt || r.memberId !== me.id)
    return { ok: false, message: "找不到可簽退的紀錄。" };
  if (r.status !== "IN_USE")
    return {
      ok: false,
      message:
        r.status === "OVERDUE"
          ? "已逾期超過 3 天,本人無法簽退,請洽機台負責人代簽。"
          : "此紀錄無需簽退。",
    };

  const finalHours =
    Number.isInteger(hours) && hours > 0 ? hours : hoursBetween(r.startAt, r.endAt);

  await prisma.$transaction([
    prisma.checkout.create({
      data: {
        reservationId: r.id,
        hours: finalHours,
        condition: condition as ConditionReport,
        anomalyNote: note,
        byMemberId: me.id,
        isProxy: false,
      },
    }),
    prisma.reservation.update({
      where: { id: r.id },
      data: { status: "CHECKED_OUT", updatedBy: me.id },
    }),
  ]);

  // 異常即時警報(🟡/🔴):寄給負責人 + 教授。
  if (condition !== "NORMAL") {
    const recipients = await getAnomalyRecipients(r.instrument.id);
    await sendAnomalyAlert({
      recipients,
      instrumentName: r.instrument.name,
      reporterName: me.loginEmail,
      condition,
      note: note ?? undefined,
    });
  }

  revalidatePath("/instruments");
  revalidatePath(`/instruments/${r.instrument.id}/checkout`);
  return { ok: true, message: "簽退完成,感謝回報。" };
}

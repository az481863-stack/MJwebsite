// 階段五:儀器預約系統核心邏輯(供頁面、server action、cron 共用)。
// 集中於此避免邏輯散落;停權與額度為衍生計算,不另設表。
//
// 規則來源見 CLAUDE.md 階段五:
// - 自動簽到:使用時段一到即轉「使用中·未簽退」,產生簽退義務。
// - 逾時:使用結束後 3 天內須簽退;逾期轉「逾時未簽退」,本人不再開放簽退。
// - 停權:有效「逾時未簽退」達 3 筆即停止預約權(不影響登入/簽退)。
// - 額度:未來預約(BOOKED/IN_USE/OVERDUE)時數加總不得超過 Settings 上限;
//         正常/代簽簽退釋放額度,逾時未簽退不返還。

import { prisma } from "@/lib/prisma";

// 逾時門檻:使用結束後 3 天未簽退即逾時。
export const OVERDUE_DAYS = 3;
// 有效「逾時未簽退」達此數即停權。
export const SUSPEND_THRESHOLD = 3;

// 佔住額度(尚未釋放)的預約狀態。
const ACTIVE_STATUSES = ["BOOKED", "IN_USE", "OVERDUE"] as const;

// 對帳(冪等):自動簽到 + 標記逾時。由 cron 與頁面載入前 lazy 呼叫。
export async function reconcile(): Promise<{ checkedIn: number; overdue: number }> {
  const now = new Date();
  const overdueCutoff = new Date(now.getTime() - OVERDUE_DAYS * 24 * 60 * 60 * 1000);

  // (a) 時段一到 → 自動簽到,轉「使用中·未簽退」。
  const checkedIn = await prisma.reservation.updateMany({
    where: { status: "BOOKED", deletedAt: null, startAt: { lte: now } },
    data: { status: "IN_USE", checkedInAt: now },
  });

  // (b) 使用結束逾 3 天仍未簽退 → 轉「逾時未簽退」。
  const overdue = await prisma.reservation.updateMany({
    where: { status: "IN_USE", deletedAt: null, endAt: { lt: overdueCutoff } },
    data: { status: "OVERDUE" },
  });

  return { checkedIn: checkedIn.count, overdue: overdue.count };
}

// 當前有效「逾時未簽退」筆數。
export async function getActiveOverdueCount(memberId: string): Promise<number> {
  return prisma.reservation.count({
    where: { memberId, status: "OVERDUE", deletedAt: null },
  });
}

// 是否已被停權(僅擋預約)。
export async function isSuspended(memberId: string): Promise<boolean> {
  return (await getActiveOverdueCount(memberId)) >= SUSPEND_THRESHOLD;
}

// 已用額度(小時):未釋放預約的時數加總。
export async function getUsedHours(memberId: string): Promise<number> {
  const rows = await prisma.reservation.findMany({
    where: { memberId, deletedAt: null, status: { in: [...ACTIVE_STATUSES] } },
    select: { startAt: true, endAt: true },
  });
  return rows.reduce((sum, r) => sum + hoursBetween(r.startAt, r.endAt), 0);
}

export interface ReserveCheck {
  ok: boolean;
  reason?: "suspended" | "quota";
  usedHours: number;
  maxHours: number;
}

// 綜合預約資格檢查(未停權 + 額度足夠)。
export async function canReserve(
  memberId: string,
  hours: number,
  maxHours: number,
): Promise<ReserveCheck> {
  const [suspended, usedHours] = await Promise.all([
    isSuspended(memberId),
    getUsedHours(memberId),
  ]);
  if (suspended) return { ok: false, reason: "suspended", usedHours, maxHours };
  if (usedHours + hours > maxHours)
    return { ok: false, reason: "quota", usedHours, maxHours };
  return { ok: true, usedHours, maxHours };
}

// 時段衝突偵測(同機台、未釋放狀態、時段重疊)。
export async function hasOverlap(
  instrumentId: string,
  startAt: Date,
  endAt: Date,
): Promise<boolean> {
  const count = await prisma.reservation.count({
    where: {
      instrumentId,
      deletedAt: null,
      status: { in: [...ACTIVE_STATUSES] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
    },
  });
  return count > 0;
}

// B-2:某會員負責的儀器 id 清單。
export async function managedInstrumentIds(memberId: string): Promise<string[]> {
  const rows = await prisma.instrumentManager.findMany({
    where: { memberId, instrument: { deletedAt: null } },
    select: { instrumentId: true },
  });
  return rows.map((r) => r.instrumentId);
}

// B-2:是否為某機台負責人。
export async function isManagerOf(memberId: string, instrumentId: string): Promise<boolean> {
  const row = await prisma.instrumentManager.findUnique({
    where: { instrumentId_memberId: { instrumentId, memberId } },
  });
  return !!row;
}

// 兩整點時間的時數差(整數)。
export function hoursBetween(start: Date, end: Date): number {
  return Math.round((end.getTime() - start.getTime()) / (60 * 60 * 1000));
}

// 異常警報收件人:該台負責人 email + 教授(CONTACT_RECIPIENTS)。去重。
export async function getAnomalyRecipients(instrumentId: string): Promise<string[]> {
  const managers = await prisma.instrumentManager.findMany({
    where: { instrumentId },
    select: { member: { select: { loginEmail: true } } },
  });
  const professors = (process.env.CONTACT_RECIPIENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const all = [...managers.map((m) => m.member.loginEmail), ...professors];
  return Array.from(new Set(all.filter(Boolean)));
}

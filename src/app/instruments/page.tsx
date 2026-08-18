// 階段五:儀器預約頁(學生視角)。僅見各台空檔並預約,看不到管理資訊。
// 受 Settings.showInstruments 控制(關閉時 404)。
// 介面文字全部交給 client 的 InstrumentsContent 渲染,以隨前台語系切換(規格 A-1)。

import { notFound } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import {
  reconcile,
  getUsedHours,
  getActiveOverdueCount,
  SUSPEND_THRESHOLD,
} from "@/lib/instruments";
import { displayName } from "@/lib/display-name";
import { InstrumentsContent, type MyReservation } from "./instruments-content";
import type { InstrumentItem } from "./instrument-list";

export const dynamic = "force-dynamic";

export default async function InstrumentsPage() {
  const settings = await getSettings();
  if (!settings.showInstruments) notFound();

  await reconcile();
  const me = await getCurrentMember();
  const now = new Date();

  const instruments = await prisma.instrument.findMany({
    where: { deletedAt: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      reservations: {
        where: {
          deletedAt: null,
          status: { in: ["BOOKED", "IN_USE", "OVERDUE"] },
          endAt: { gte: now },
        },
        select: {
          startAt: true,
          endAt: true,
          memberId: true,
          member: { select: { name: true, loginEmail: true } },
        },
      },
    },
  });

  // 額度 / 停權 / 我的預約(僅登入時)。
  let usedHours = 0;
  let overdueCount = 0;
  let suspended = false;
  let myReservations: MyReservation[] = [];
  if (me) {
    [usedHours, overdueCount] = await Promise.all([
      getUsedHours(me.id),
      getActiveOverdueCount(me.id),
    ]);
    suspended = overdueCount >= SUSPEND_THRESHOLD;
    const rows = await prisma.reservation.findMany({
      where: {
        memberId: me.id,
        deletedAt: null,
        status: { in: ["BOOKED", "IN_USE", "OVERDUE"] },
      },
      orderBy: { startAt: "asc" },
      include: { instrument: { select: { name: true } } },
    });
    myReservations = rows.map((r) => ({
      id: r.id,
      instrumentId: r.instrumentId,
      instrumentName: r.instrument.name,
      status: r.status as MyReservation["status"],
      start: r.startAt.toISOString(),
      end: r.endAt.toISOString(),
      note: r.note,
      canCancel: r.status === "BOOKED" && r.startAt.getTime() > now.getTime(),
    }));
  }

  // 序列化給 client 清單(含各台的預約 disabled 判斷)。
  // 預約者名稱只在「已登入」時附上:未登入的訪客看得到空檔,但看不到是誰預約。
  const items: InstrumentItem[] = instruments.map((inst) => ({
    id: inst.id,
    name: inst.name,
    nameEn: inst.nameEn,
    purpose: inst.purpose,
    purposeEn: inst.purposeEn,
    photoUrl: inst.photoUrl,
    maintenance: inst.status === "MAINTENANCE",
    busy: inst.reservations.map((r) => ({
      start: r.startAt.toISOString(),
      end: r.endAt.toISOString(),
      mine: !!me && r.memberId === me.id,
      name: me ? displayName(r.member) : undefined,
    })),
    disabled: !me || suspended || inst.status === "MAINTENANCE",
    disabledReason: !me
      ? undefined
      : inst.status === "MAINTENANCE"
        ? "maintenance"
        : suspended
          ? "suspended"
          : undefined,
  }));

  return (
    <InstrumentsContent
      loggedIn={!!me}
      memberName={me ? displayName(me) : ""}
      usedHours={usedHours}
      maxHours={settings.instrumentMaxHours}
      overdueCount={overdueCount}
      suspended={suspended}
      threshold={SUSPEND_THRESHOLD}
      myReservations={myReservations}
      instruments={items}
    />
  );
}

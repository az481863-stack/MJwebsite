// 階段五:儀器預約頁(學生視角)。僅見各台空檔並預約,看不到管理資訊。
// 受 Settings.showInstruments 控制(關閉時 404)。

import Link from "next/link";
import Image from "next/image";
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
import { Container } from "@/components/ui/Container";
import { InstrumentBooking } from "./instrument-booking";
import { CancelButton } from "./cancel-button";

export const dynamic = "force-dynamic";

const RES_LABEL: Record<string, string> = {
  BOOKED: "已預約",
  IN_USE: "使用中·未簽退",
  OVERDUE: "逾時未簽退",
};

function fmt(d: Date): string {
  return new Date(d).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

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
        select: { startAt: true, endAt: true },
      },
    },
  });

  // 額度 / 停權 / 我的預約(僅登入時)。
  type MyRes = {
    id: string;
    instrumentId: string;
    status: string;
    startAt: Date;
    endAt: Date;
    instrument: { name: string };
  };
  let usedHours = 0;
  let overdueCount = 0;
  let suspended = false;
  let myReservations: MyRes[] = [];
  if (me) {
    [usedHours, overdueCount] = await Promise.all([
      getUsedHours(me.id),
      getActiveOverdueCount(me.id),
    ]);
    suspended = overdueCount >= SUSPEND_THRESHOLD;
    myReservations = await prisma.reservation.findMany({
      where: {
        memberId: me.id,
        deletedAt: null,
        status: { in: ["BOOKED", "IN_USE", "OVERDUE"] },
      },
      orderBy: { startAt: "asc" },
      include: { instrument: { select: { name: true } } },
    });
  }

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">儀器介紹</h1>
      <p className="mt-2 text-muted">
        瀏覽實驗室各項儀器;登入後可展開預約區塊、選擇整點時段預約。
      </p>

      {!me && (
        <p className="mt-4 border border-line bg-foreground/[0.03] p-3 text-sm">
          請先
          <Link href="/login?next=/instruments" className="mx-1 underline underline-offset-4">
            登入
          </Link>
          後預約。
        </p>
      )}

      {me && (
        <div className="mt-4 border border-line p-4 text-sm">
          <p>
            預約總時數:已用 <strong>{usedHours}</strong> / 上限{" "}
            <strong>{settings.instrumentMaxHours}</strong> 小時
          </p>
          {suspended ? (
            <p className="mt-1 text-red-600">
              您有 {overdueCount} 筆逾時未簽退(達 {SUSPEND_THRESHOLD} 筆),預約權已暫停;完成簽退後自動恢復。
            </p>
          ) : (
            overdueCount > 0 && (
              <p className="mt-1 text-amber-700">
                您有 {overdueCount} 筆逾時未簽退;達 {SUSPEND_THRESHOLD} 筆將暫停預約權。
              </p>
            )
          )}
        </div>
      )}

      {/* 我的預約 */}
      {me && myReservations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">我的預約</h2>
          <ul className="mt-3 space-y-2">
            {myReservations.map((r) => (
              <li
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 border border-line p-3 text-sm"
              >
                <span>
                  <strong>{r.instrument.name}</strong> · {fmt(r.startAt)}–{fmt(r.endAt)} ·{" "}
                  {RES_LABEL[r.status] ?? r.status}
                </span>
                <span>
                  {r.status === "BOOKED" && r.startAt.getTime() > now.getTime() && (
                    <CancelButton reservationId={r.id} />
                  )}
                  {r.status === "IN_USE" && (
                    <Link
                      href={`/instruments/${r.instrumentId}/checkout`}
                      className="text-xs underline underline-offset-4 hover:text-accent"
                    >
                      前往簽退
                    </Link>
                  )}
                  {r.status === "OVERDUE" && (
                    <span className="text-xs text-red-600">逾期,請洽負責人代簽</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 機台清單 */}
      <section className="mt-10 space-y-8">
        {instruments.map((inst) => {
          const disabled = !me || suspended || inst.status === "MAINTENANCE";
          const disabledReason = !me
            ? undefined
            : inst.status === "MAINTENANCE"
              ? "此儀器維護中,暫不開放預約。"
              : suspended
                ? "預約權暫停中(逾時未簽退達 3 筆)。"
                : undefined;
          return (
            <div key={inst.id} className="border border-line p-5">
              <div className="flex items-start gap-4">
                {inst.photoUrl && (
                  <Image
                    src={inst.photoUrl}
                    alt={inst.name}
                    width={120}
                    height={90}
                    unoptimized
                    className="h-20 w-auto border border-line object-cover"
                  />
                )}
                <div className="min-w-0">
                  <h3 className="font-medium">
                    {inst.status === "MAINTENANCE" ? "🟡" : "🟢"} {inst.name}
                  </h3>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-muted">{inst.purpose}</p>
                </div>
              </div>
              <InstrumentBooking
                instrumentId={inst.id}
                busy={inst.reservations.map((r) => ({
                  start: r.startAt.toISOString(),
                  end: r.endAt.toISOString(),
                }))}
                disabled={disabled}
                disabledReason={disabledReason}
              />
            </div>
          );
        })}
        {instruments.length === 0 && (
          <p className="text-sm text-muted">目前尚無可預約的儀器。</p>
        )}
      </section>
    </Container>
  );
}

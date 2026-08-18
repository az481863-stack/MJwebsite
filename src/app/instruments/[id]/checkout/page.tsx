// QR 落地頁:掃機台 QR → 要求登入 → 查本人在該機「使用中·未簽退」紀錄 →
// 有則帶往簽退表單;沒有則直接導到預約頁(帶 ?q=機台名稱,自動捲到該台並可展開預約)。
// 逾期(超過 3 天)無法本人簽退者仍留在本頁顯示說明,以免使用者不知情。

import { notFound, redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcile, hoursBetween } from "@/lib/instruments";
import { Container } from "@/components/ui/Container";
import { CheckoutForm } from "./checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const me = await getCurrentMember();
  if (!me) redirect(`/login?next=/instruments/${id}/checkout`);

  await reconcile();

  const inst = await prisma.instrument.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true },
  });
  if (!inst) notFound();

  // 本人在此機「使用中·未簽退」的紀錄(最早結束者優先)。
  const inUse = await prisma.reservation.findFirst({
    where: { instrumentId: id, memberId: me.id, status: "IN_USE", deletedAt: null },
    orderBy: { endAt: "asc" },
  });

  const overdue = inUse
    ? null
    : await prisma.reservation.findFirst({
        where: { instrumentId: id, memberId: me.id, status: "OVERDUE", deletedAt: null },
      });

  // 無簽退義務(也非逾期)→ 一律導向預約系統,讓同一張 QR 兼作「預約入口」。
  if (!inUse && !overdue) {
    redirect(`/instruments?q=${encodeURIComponent(inst.name)}`);
  }

  return (
    <Container className="flex min-h-[60vh] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <p className="text-sm text-muted">儀器簽退</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{inst.name}</h1>

        <div className="mt-6">
          {inUse ? (
            <CheckoutForm
              reservationId={inUse.id}
              defaultHours={hoursBetween(inUse.startAt, inUse.endAt)}
            />
          ) : overdue ? (
            <div className="border border-line p-5 text-sm">
              此紀錄已逾期超過 3 天,本人無法簽退,請洽機台負責人或管理員代簽。
            </div>
          ) : null}
        </div>
      </div>
    </Container>
  );
}

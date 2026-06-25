// QR 簽退頁:掃機台 QR → 要求登入 → 查本人在該機「使用中·未簽退」紀錄 →
// 有則帶往簽退表單;無則顯示「無需簽退」。

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
          ) : (
            <div className="border border-line p-5 text-sm">
              您目前在此儀器沒有「使用中·未簽退」的紀錄,無需簽退。
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import QRCode from "qrcode";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcile, isManagerOf } from "@/lib/instruments";
import { siteUrl } from "@/lib/site";
import { StatusControl, ProxyCheckoutButton } from "../row-actions";

export const dynamic = "force-dynamic";

const RES_LABEL: Record<string, string> = {
  BOOKED: "已預約",
  CANCELLED: "已取消",
  IN_USE: "使用中·未簽退",
  CHECKED_OUT: "已簽退",
  OVERDUE: "逾時未簽退",
};
const COND_LABEL: Record<string, string> = {
  NORMAL: "🟢 正常",
  UNSTABLE: "🟡 異音不穩",
  BROKEN: "🔴 故障",
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

export default async function InstrumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const me = await getCurrentMember();
  if (!me) redirect("/login");

  await reconcile();

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  const allowed = isAdmin || (await isManagerOf(me.id, id));
  if (!allowed) redirect("/admin/instruments");

  const inst = await prisma.instrument.findFirst({
    where: { id, deletedAt: null },
    include: {
      managers: { include: { member: { select: { loginEmail: true } } } },
      reservations: {
        where: { deletedAt: null },
        orderBy: { startAt: "desc" },
        take: 100,
        include: {
          member: { select: { loginEmail: true } },
          checkout: true,
        },
      },
    },
  });
  if (!inst) notFound();

  const checkoutUrl = `${siteUrl()}/instruments/${inst.id}/checkout`;
  const qrDataUrl = await QRCode.toDataURL(checkoutUrl, { width: 220, margin: 1 });

  return (
    <div>
      <Link href="/admin/instruments" className="text-sm text-muted underline-offset-4 hover:underline">
        ← 儀器管理
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {inst.status === "MAINTENANCE" ? "🟡" : "🟢"} {inst.name}
      </h1>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted">{inst.purpose}</p>
      <p className="mt-2 text-xs text-muted">
        負責人:
        {inst.managers.length
          ? inst.managers.map((m) => m.member.loginEmail).join("、")
          : "(未指派)"}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <StatusControl instrumentId={inst.id} status={inst.status} />
        {isAdmin && (
          <Link
            href={`/admin/instruments/${inst.id}/edit`}
            className="border border-line-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
          >
            編輯儀器
          </Link>
        )}
      </div>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">簽退 QR Code</h2>
        <p className="mt-1 text-xs text-muted">列印貼於機台;使用者掃描後登入即可簽退。</p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qrDataUrl} alt="簽退 QR Code" width={180} height={180} className="mt-3 border border-line" />
        <p className="mt-2 break-all text-xs text-muted">{checkoutUrl}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">使用 · 預約 · 簽退紀錄</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4">時段</th>
                <th className="py-2 pr-4">預約人</th>
                <th className="py-2 pr-4">狀態</th>
                <th className="py-2 pr-4">機況/簽退</th>
                <th className="py-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {inst.reservations.map((r) => (
                <tr key={r.id} className="border-b border-line/60 align-top">
                  <td className="py-2 pr-4 whitespace-nowrap">
                    {fmt(r.startAt)}–{fmt(r.endAt)}
                  </td>
                  <td className="py-2 pr-4">{r.member.loginEmail}</td>
                  <td className="py-2 pr-4">{RES_LABEL[r.status] ?? r.status}</td>
                  <td className="py-2 pr-4">
                    {r.checkout ? (
                      <span>
                        {COND_LABEL[r.checkout.condition] ?? r.checkout.condition}
                        {r.checkout.isProxy ? "(代簽)" : ""}
                        {r.checkout.anomalyNote ? ` — ${r.checkout.anomalyNote}` : ""}
                      </span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td className="py-2">
                    {(r.status === "IN_USE" || r.status === "OVERDUE") && (
                      <ProxyCheckoutButton reservationId={r.id} />
                    )}
                  </td>
                </tr>
              ))}
              {inst.reservations.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-muted">
                    尚無預約紀錄。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

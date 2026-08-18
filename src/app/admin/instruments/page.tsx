import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcile, managedInstrumentIds } from "@/lib/instruments";
import { displayName } from "@/lib/display-name";
import { DeleteInstrumentButton } from "./row-actions";
import { InstrumentAdminList } from "./instrument-admin-list";
import { UsageSummary, type UserSlot } from "./usage-summary";
import { ToggleAllUsage } from "./toggle-all-usage";

export const dynamic = "force-dynamic";

function fmt(d: Date): string {
  return new Date(d).toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function InstrumentsAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");

  await reconcile();

  const nowMs = new Date().getTime();
  const isAdmin = roleAtLeast(me.role, "ADMIN");
  const isSuper = roleAtLeast(me.role, "SUPERADMIN");
  const managedIds = await managedInstrumentIds(me.id);
  if (!isAdmin && managedIds.length === 0) redirect("/admin");

  // 綜覽頁僅該台負責人與最高權限者可進;據此決定列表上「綜覽/名稱」是否為可點連結。
  const managedSet = new Set(managedIds);
  const canView = (iid: string) => isSuper || managedSet.has(iid);

  const instruments = await prisma.instrument.findMany({
    where: {
      deletedAt: null,
      ...(isAdmin ? {} : { id: { in: managedIds } }),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      managers: { include: { member: { select: { name: true, loginEmail: true } } } },
      reservations: {
        where: { deletedAt: null, status: { in: ["IN_USE", "OVERDUE", "BOOKED"] } },
        orderBy: { startAt: "asc" },
        select: {
          status: true,
          startAt: true,
          endAt: true,
          note: true,
          member: { select: { name: true, loginEmail: true } },
        },
      },
    },
  });

  // 最新機況回報:各儀器最近一筆簽退的機況;非正常且晚於「異常解除時間點」才標「❗」。
  const ids = instruments.map((i) => i.id);
  const checkouts = await prisma.checkout.findMany({
    where: { reservation: { instrumentId: { in: ids } } },
    orderBy: { createdAt: "desc" },
    select: {
      condition: true,
      createdAt: true,
      reservation: { select: { instrumentId: true } },
    },
  });
  const latest = new Map<string, { condition: string; createdAt: Date }>();
  for (const c of checkouts) {
    const iid = c.reservation.instrumentId;
    if (!latest.has(iid)) latest.set(iid, { condition: c.condition, createdAt: c.createdAt });
  }
  const clearedAt = new Map(instruments.map((i) => [i.id, i.anomalyClearedAt]));
  const anomalyEmoji = (iid: string): string | null => {
    const l = latest.get(iid);
    if (!l || l.condition === "NORMAL") return null;
    const cleared = clearedAt.get(iid);
    if (cleared && l.createdAt <= cleared) return null;
    return l.condition === "BROKEN" ? "🔴" : "🟡";
  };

  // 目前使用者(IN_USE)與下一位使用者(最近的未來 BOOKED)。
  type Inst = (typeof instruments)[number];
  const slotOf = (r: Inst["reservations"][number]): UserSlot => ({
    who: displayName(r.member),
    time: `${fmt(r.startAt)}–${fmt(r.endAt)}`,
    note: r.note,
  });
  // 「目前使用」= IN_USE 且時段**尚未結束**。時段已過但還沒簽退的(人已離開、
  // 只是忘了簽退)不算佔用機台,改列為「待簽退」,燈號顯示「目前空閒」。
  const inUseNow = (inst: Inst) =>
    inst.reservations.filter(
      (x) => x.status === "IN_USE" && x.endAt.getTime() > nowMs,
    );
  const pendingCheckout = (inst: Inst) =>
    inst.reservations.filter(
      (x) => x.status === "IN_USE" && x.endAt.getTime() <= nowMs,
    );
  const currentSlot = (inst: Inst): UserSlot | null => {
    const r = inUseNow(inst)[0];
    return r ? slotOf(r) : null;
  };
  const pendingSlot = (inst: Inst): UserSlot | null => {
    const r = pendingCheckout(inst)[0];
    return r ? slotOf(r) : null;
  };
  const nextSlot = (inst: Inst): UserSlot | null => {
    const r = inst.reservations.find(
      (x) => x.status === "BOOKED" && x.startAt.getTime() >= nowMs,
    );
    return r ? slotOf(r) : null;
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">儀器管理</h1>
          <ToggleAllUsage />
        </div>
        {isAdmin && (
          <Link
            href="/admin/instruments/new"
            className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
          >
            + 新增儀器
          </Link>
        )}
      </div>
      {!isAdmin && (
        <p className="mt-2 text-sm text-muted">您僅能管理自己負責的機台。</p>
      )}

      {isAdmin ? (
        <InstrumentAdminList
          key={instruments.map((i) => `${i.id}:${i.status}`).join(",")}
          initial={instruments.map((inst) => ({
            id: inst.id,
            name: inst.name,
            maintenance: inst.status === "MAINTENANCE",
            canView: canView(inst.id),
            anomaly: anomalyEmoji(inst.id),
            photoUrl: inst.photoUrl,
            inUse: inUseNow(inst).length,
            pending: pendingCheckout(inst).length,
            overdue: inst.reservations.filter((r) => r.status === "OVERDUE")
              .length,
            managerEmails: inst.managers.map((m) => displayName(m.member)),
            current: currentSlot(inst),
            pendingSlot: pendingSlot(inst),
            next: nextSlot(inst),
          }))}
        />
      ) : (
      <ul className="mt-6 space-y-3">
        {instruments.map((inst) => {
          const inUse = inUseNow(inst).length;
          const pending = pendingCheckout(inst).length;
          const overdue = inst.reservations.filter((r) => r.status === "OVERDUE").length;
          const current = currentSlot(inst);
          const pendingUser = pendingSlot(inst);
          const next = nextSlot(inst);
          return (
            <li key={inst.id} className="border border-line p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  {inst.photoUrl ? (
                    <Image
                      src={inst.photoUrl}
                      alt={inst.name}
                      width={80}
                      height={60}
                      unoptimized
                      className="h-16 w-20 shrink-0 border border-line object-cover"
                    />
                  ) : (
                    <div className="flex h-16 w-20 shrink-0 items-center justify-center border border-line bg-foreground/[0.03] text-xs text-muted">
                      無圖
                    </div>
                  )}
                  <div className="min-w-0">
                    {canView(inst.id) ? (
                      <Link
                        href={`/admin/instruments/${inst.id}`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {inst.status === "MAINTENANCE" ? "🟡" : "🟢"} {inst.name}
                        {anomalyEmoji(inst.id) && (
                          <span className="ml-1.5 font-semibold text-red-600" title="最新機況回報異常">
                            ❗{anomalyEmoji(inst.id)}
                          </span>
                        )}
                      </Link>
                    ) : (
                      <span className="font-medium">
                        {inst.status === "MAINTENANCE" ? "🟡" : "🟢"} {inst.name}
                        {anomalyEmoji(inst.id) && (
                          <span className="ml-1.5 font-semibold text-red-600" title="最新機況回報異常">
                            ❗{anomalyEmoji(inst.id)}
                          </span>
                        )}
                      </span>
                    )}
                    <p className="mt-1 text-sm text-muted">
                      使用中 {inUse} · 待簽退 {pending} · 逾時未簽退 {overdue}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      負責人:
                      {inst.managers.length
                        ? inst.managers.map((m) => displayName(m.member)).join("、")
                        : "(未指派)"}
                    </p>
                    <UsageSummary current={current} pending={pendingUser} next={next} />
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                  {canView(inst.id) && (
                    <Link
                      href={`/admin/instruments/${inst.id}`}
                      className="text-muted underline-offset-4 hover:text-foreground hover:underline"
                    >
                      綜覽
                    </Link>
                  )}
                  {isAdmin && (
                    <>
                      <Link
                        href={`/admin/instruments/${inst.id}/edit`}
                        className="text-muted underline-offset-4 hover:text-foreground hover:underline"
                      >
                        編輯
                      </Link>
                      <DeleteInstrumentButton instrumentId={inst.id} />
                    </>
                  )}
                </div>
              </div>
            </li>
          );
        })}
        {instruments.length === 0 && (
          <li className="border border-line p-6 text-sm text-muted">
            尚無儀器。
          </li>
        )}
      </ul>
      )}
    </div>
  );
}

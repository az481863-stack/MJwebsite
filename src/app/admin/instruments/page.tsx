import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { reconcile, managedInstrumentIds } from "@/lib/instruments";
import { DeleteInstrumentButton } from "./row-actions";
import { InstrumentAdminList } from "./instrument-admin-list";

export const dynamic = "force-dynamic";

export default async function InstrumentsAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");

  await reconcile();

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  const managedIds = isAdmin ? [] : await managedInstrumentIds(me.id);
  if (!isAdmin && managedIds.length === 0) redirect("/admin");

  const instruments = await prisma.instrument.findMany({
    where: {
      deletedAt: null,
      ...(isAdmin ? {} : { id: { in: managedIds } }),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      managers: { include: { member: { select: { loginEmail: true } } } },
      reservations: {
        where: { deletedAt: null, status: { in: ["IN_USE", "OVERDUE"] } },
        select: { status: true },
      },
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">儀器管理</h1>
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
            photoUrl: inst.photoUrl,
            inUse: inst.reservations.filter((r) => r.status === "IN_USE").length,
            overdue: inst.reservations.filter((r) => r.status === "OVERDUE")
              .length,
            managerEmails: inst.managers.map((m) => m.member.loginEmail),
          }))}
        />
      ) : (
      <ul className="mt-6 space-y-3">
        {instruments.map((inst) => {
          const inUse = inst.reservations.filter((r) => r.status === "IN_USE").length;
          const overdue = inst.reservations.filter((r) => r.status === "OVERDUE").length;
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
                    <Link
                      href={`/admin/instruments/${inst.id}`}
                      className="font-medium underline-offset-4 hover:underline"
                    >
                      {inst.status === "MAINTENANCE" ? "🟡" : "🟢"} {inst.name}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      使用中 {inUse} · 逾時未簽退 {overdue}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      負責人:
                      {inst.managers.length
                        ? inst.managers.map((m) => m.member.loginEmail).join("、")
                        : "(未指派)"}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-sm">
                  <Link
                    href={`/admin/instruments/${inst.id}`}
                    className="text-muted underline-offset-4 hover:text-foreground hover:underline"
                  >
                    綜覽
                  </Link>
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

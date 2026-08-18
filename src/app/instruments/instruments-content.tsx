"use client";

// 儀器介紹頁的前台外殼(client):標題、額度、我的預約與清單。
// 之所以是 client:整頁介面文字須隨右上角 [EN / 中文] 切換(規格 A-1),
// 而語系是瀏覽器端狀態;server 端只負責取資料。

import { Suspense } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/context";
import { Container } from "@/components/ui/Container";
import { InstrumentList, type InstrumentItem } from "./instrument-list";
import { CancelButton } from "./cancel-button";

export interface MyReservation {
  id: string;
  instrumentId: string;
  instrumentName: string;
  status: "BOOKED" | "IN_USE" | "OVERDUE";
  start: string; // ISO
  end: string; // ISO
  note: string | null;
  canCancel: boolean;
}

// 以 {key} 佔位符填值(字典的多語句子共用同一組佔位符)。
export function fill(tpl: string, vars: Record<string, string | number>): string {
  return tpl.replace(/\{(\w+)\}/g, (m, k) =>
    k in vars ? String(vars[k]) : m,
  );
}

function fmt(iso: string, lang: string): string {
  return new Date(iso).toLocaleString(lang === "en" ? "en-US" : "zh-TW", {
    timeZone: "Asia/Taipei",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function InstrumentsContent({
  loggedIn,
  memberName,
  usedHours,
  maxHours,
  overdueCount,
  suspended,
  threshold,
  myReservations,
  instruments,
}: {
  loggedIn: boolean;
  memberName: string;
  usedHours: number;
  maxHours: number;
  overdueCount: number;
  suspended: boolean;
  threshold: number;
  myReservations: MyReservation[];
  instruments: InstrumentItem[];
}) {
  const { t, lang } = useLanguage();
  const i = t.instruments;

  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{i.heading}</h1>
      {loggedIn && (
        <p className="mt-2 text-lg font-medium text-accent">
          {fill(i.welcome, { name: memberName })}
        </p>
      )}
      <p className="mt-2 text-muted">{i.intro}</p>

      {!loggedIn && (
        <p className="mt-4 border border-line bg-foreground/[0.03] p-3 text-sm">
          {i.loginBefore}
          <Link
            href="/login?next=/instruments"
            className="mx-1 underline underline-offset-4"
          >
            {i.loginLink}
          </Link>
          {i.loginAfter}
        </p>
      )}

      {loggedIn && (
        <div className="mt-4 border border-line p-4 text-sm">
          <p>{fill(i.quota, { used: usedHours, max: maxHours })}</p>
          {suspended ? (
            <p className="mt-1 text-red-600">
              {fill(i.suspended, { n: overdueCount, threshold })}
            </p>
          ) : (
            overdueCount > 0 && (
              <p className="mt-1 text-amber-700">
                {fill(i.overdueWarn, { n: overdueCount, threshold })}
              </p>
            )
          )}
        </div>
      )}

      {/* 我的預約 */}
      {loggedIn && myReservations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">
            {i.myReservations}
          </h2>
          <ul className="mt-3 space-y-2">
            {myReservations.map((r) => (
              <li
                key={r.id}
                className="band-dark flex flex-wrap items-center justify-between gap-2 border border-accent/40 p-3 text-sm"
              >
                <span>
                  <strong className="text-accent">{r.instrumentName}</strong> ·{" "}
                  {fmt(r.start, lang)}–{fmt(r.end, lang)} ·{" "}
                  {i.statusLabels[r.status] ?? r.status}
                  {r.note ? (
                    <span className="mt-0.5 block text-xs text-muted">
                      {i.noteLabel}:{r.note}
                    </span>
                  ) : null}
                </span>
                <span>
                  {r.canCancel && <CancelButton reservationId={r.id} />}
                  {r.status === "IN_USE" && (
                    <Link
                      href={`/instruments/${r.instrumentId}/checkout`}
                      className="text-xs underline underline-offset-4 hover:text-accent"
                    >
                      {i.goCheckout}
                    </Link>
                  )}
                  {r.status === "OVERDUE" && (
                    <span className="text-xs text-red-600">{i.overdueHint}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 機台清單 + 搜尋(搜尋框讀 ?q= 供小幫手與 QR 深連結) */}
      <Suspense fallback={null}>
        <InstrumentList instruments={instruments} />
      </Suspense>
    </Container>
  );
}

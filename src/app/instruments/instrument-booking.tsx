"use client";

// 單一儀器的整點空檔預約面板:以日曆選日期 → 選整點起始(全天 24 小時)→ 選時數 → 預約。
// 預約區塊預設收合,須登入才可展開;已被占用或過去的時段不可選。
// 衝突與額度由 server action 再次把關。

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/components/admin/form-kit";
import { reserve } from "./actions";

const HOURS_PER_DAY = 24; // 全天 24 個整點時段

interface Busy {
  start: string;
  end: string;
}

// 以本地時間組出某日某整點的 Date。
function localDate(dateStr: string, hour: number): Date {
  const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
  return new Date(y, m - 1, d, hour, 0, 0, 0);
}

function todayStr(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${mm}-${dd}`;
}

export function InstrumentBooking({
  instrumentId,
  busy,
  disabled = false,
  disabledReason,
}: {
  instrumentId: string;
  busy: Busy[];
  disabled?: boolean;
  disabledReason?: string;
}) {
  const router = useRouter();
  const [now] = useState(() => Date.now()); // 一次性,避免 render 期呼叫 Date.now
  const [open, setOpen] = useState(false); // 預約區塊預設收合
  const [dateStr, setDateStr] = useState<string>(() => todayStr());
  const [startHour, setStartHour] = useState<number | null>(null);
  const [hours, setHours] = useState(1);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    reserve,
    null,
  );

  useEffect(() => {
    // 預約成功後重抓資料(占用表更新);選取狀態交由重繪後失效。
    if (state?.ok) router.refresh();
  }, [state, router]);

  const busyMs = useMemo(
    () => busy.map((b) => ({ s: new Date(b.start).getTime(), e: new Date(b.end).getTime() })),
    [busy],
  );

  const slotStartDate = (hour: number) => localDate(dateStr, hour);

  const isBusy = (hour: number) => {
    const s = slotStartDate(hour).getTime();
    const e = s + 60 * 60 * 1000;
    return busyMs.some((b) => b.s < e && b.e > s);
  };
  const isPast = (hour: number) => slotStartDate(hour).getTime() <= now;

  // 從 startHour 起算最多可連續預約的時數(遇 busy/過去/超出當日 24:00 即止)。
  const maxHours = useMemo(() => {
    if (startHour == null) return 1;
    let n = 0;
    for (let h = startHour; h < HOURS_PER_DAY; h++) {
      if (isPast(h) || isBusy(h)) break;
      n++;
    }
    return Math.max(1, n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startHour, dateStr, busyMs]);

  const startISO = startHour != null ? slotStartDate(startHour).toISOString() : "";

  // 未登入 / 維護中 / 停權:不顯示預約區塊。有原因才顯示(未登入則完全不顯示)。
  if (disabled) {
    return disabledReason ? (
      <p className="mt-4 text-sm text-muted">{disabledReason}</p>
    ) : null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
      >
        預約時段 ▾
      </button>
    );
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">選擇時段預約</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted underline-offset-4 hover:underline"
        >
          收合 ▴
        </button>
      </div>

      {/* 日期選擇(日曆) */}
      <div className="mt-3">
        <label className="block text-xs text-muted" htmlFor={`date-${instrumentId}`}>
          日期
        </label>
        <input
          id={`date-${instrumentId}`}
          type="date"
          value={dateStr}
          min={todayStr()}
          onChange={(e) => {
            setDateStr(e.target.value || todayStr());
            setStartHour(null);
          }}
          className="mt-1 border border-line px-3 py-1.5 text-sm outline-none focus:border-line-strong"
        />
      </div>

      {/* 整點空檔(全天 24 小時) */}
      <div className="mt-3 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8">
        {Array.from({ length: HOURS_PER_DAY }, (_, h) => h).map((h) => {
          const busyOrPast = isBusy(h) || isPast(h);
          const selected = startHour === h;
          return (
            <button
              key={h}
              type="button"
              disabled={busyOrPast}
              onClick={() => {
                setStartHour(h);
                setHours(1);
              }}
              className={`border px-1 py-1.5 text-xs tabular-nums ${
                selected
                  ? "border-accent bg-accent/15 font-semibold text-foreground"
                  : busyOrPast
                    ? "cursor-not-allowed border-line bg-foreground/[0.04] text-muted line-through"
                    : "border-line hover:border-line-strong"
              }`}
            >
              {String(h).padStart(2, "0")}:00
            </button>
          );
        })}
      </div>

      {startHour != null ? (
        <form action={formAction} className="mt-3 flex flex-wrap items-end gap-3">
          <input type="hidden" name="instrumentId" value={instrumentId} />
          <input type="hidden" name="startAt" value={startISO} />
          <div>
            <label className="block text-xs text-muted">時數(小時)</label>
            <select
              name="hours"
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              className="mt-1 border border-line px-2 py-1.5 text-sm"
            >
              {Array.from({ length: maxHours }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {pending ? "預約中…" : `預約 ${String(startHour).padStart(2, "0")}:00 起 ${hours} 小時`}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-muted">點選上方空檔以預約。</p>
      )}

      {state && (
        <p className={`mt-2 text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}

"use client";

// 單一儀器的整點空檔預約面板:以日曆選日期 → 選整點起始(全天 24 小時)→ 選時數 → 預約。
// 預約區塊預設收合,須登入才可展開;已被占用或過去的時段不可選。
// 衝突與額度由 server action 再次把關。

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import type { ActionResult } from "@/components/admin/form-kit";
import { fill } from "./instruments-content";
import { reserve } from "./actions";

const HOURS_PER_DAY = 24; // 全天 24 個整點時段

interface Busy {
  start: string;
  end: string;
  mine?: boolean; // 是否為目前使用者本人的預約
  name?: string; // 預約者顯示名稱(僅登入者看得到;未登入時為 undefined)
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
  disabledReason?: "maintenance" | "suspended";
}) {
  const { t } = useLanguage();
  const i = t.instruments;
  const router = useRouter();
  const [now] = useState(() => Date.now()); // 一次性,避免 render 期呼叫 Date.now
  const [open, setOpen] = useState(false); // 預約區塊預設收合
  const [dateStr, setDateStr] = useState<string>(() => todayStr());
  // 拉取式選取:第一下設 anchor,第二下設 target;之間即為預約範圍。
  const [anchor, setAnchor] = useState<number | null>(null);
  const [target, setTarget] = useState<number | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    reserve,
    null,
  );

  useEffect(() => {
    // 預約成功後重抓資料(占用表更新);選取狀態交由重繪後失效。
    if (state?.ok) router.refresh();
  }, [state, router]);

  const busyMs = useMemo(
    () =>
      busy.map((b) => ({
        s: new Date(b.start).getTime(),
        e: new Date(b.end).getTime(),
        mine: !!b.mine,
        name: b.name,
      })),
    [busy],
  );

  const slotStartDate = (hour: number) => localDate(dateStr, hour);

  const isBusy = (hour: number) => {
    const s = slotStartDate(hour).getTime();
    const e = s + 60 * 60 * 1000;
    return busyMs.some((b) => b.s < e && b.e > s);
  };
  // 該整點是否落在本人的預約內(用於以不同顏色標示)。
  const isMine = (hour: number) => {
    const s = slotStartDate(hour).getTime();
    const e = s + 60 * 60 * 1000;
    return busyMs.some((b) => b.mine && b.s < e && b.e > s);
  };
  const isPast = (hour: number) => slotStartDate(hour).getTime() <= now;
  const isFree = (hour: number) => !isBusy(hour) && !isPast(hour);

  // 從 anchor 起、朝 to 的方向,回傳最遠可連續選到的整點(遇 busy/過去即止)。
  const clampTo = (to: number): number => {
    if (anchor == null) return to;
    const step = to >= anchor ? 1 : -1;
    let last = anchor;
    for (let h = anchor + step; step > 0 ? h <= to : h >= to; h += step) {
      if (!isFree(h)) break;
      last = h;
    }
    return last;
  };

  // 目前選取範圍:target 已定則 [anchor,target];否則以 hover 預覽;僅 anchor 則單格。
  const range = useMemo<[number, number] | null>(() => {
    if (anchor == null) return null;
    const other = target != null ? target : hover != null ? clampTo(hover) : anchor;
    return [Math.min(anchor, other), Math.max(anchor, other)];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anchor, target, hover, dateStr, busyMs]);

  // 當日預約清單:讓一般帳號也看得到「誰預約了哪個時段」(規格 §階段五 adjustment)。
  // 只列出仍有效(未取消/未過期)的預約,時間夾在所選日期內顯示。
  const dayList = useMemo(() => {
    const dayStart = localDate(dateStr, 0).getTime();
    const dayEnd = dayStart + HOURS_PER_DAY * 60 * 60 * 1000;
    return busyMs
      .filter((b) => b.s < dayEnd && b.e > dayStart)
      .sort((a, b) => a.s - b.s)
      .map((b) => {
        const s0 = Math.max(b.s, dayStart);
        const e0 = Math.min(b.e, dayEnd);
        const hh = (ms: number) => {
          const d = new Date(ms);
          return `${String(d.getHours()).padStart(2, "0")}:00`;
        };
        return {
          key: `${b.s}-${b.e}`,
          range: `${hh(s0)}–${e0 === dayEnd ? "24:00" : hh(e0)}`,
          name: b.name ?? "",
          mine: b.mine,
        };
      });
  }, [busyMs, dateStr]);

  const selStart = range ? range[0] : null;
  const hours = range ? range[1] - range[0] + 1 : 0;
  const startISO = selStart != null ? slotStartDate(selStart).toISOString() : "";

  function pick(h: number) {
    if (anchor == null || target != null) {
      // 開始新的一輪選取。
      setAnchor(h);
      setTarget(null);
      setHover(null);
    } else {
      // 第二下:定下範圍(夾在連續空檔內)。
      setTarget(clampTo(h));
    }
  }

  // 未登入 / 維護中 / 停權:不顯示預約區塊。有原因才顯示(未登入則完全不顯示)。
  if (disabled) {
    return disabledReason ? (
      <p className="mt-4 text-sm text-muted">
        {disabledReason === "maintenance" ? i.reasonMaintenance : i.reasonSuspended}
      </p>
    ) : null;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
      >
        {i.bookBtn}
      </button>
    );
  }

  return (
    <div className="mt-4 border-t border-line pt-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{i.bookHeading}</h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-muted underline-offset-4 hover:underline"
        >
          {i.collapse}
        </button>
      </div>

      {/* 日期選擇(日曆) */}
      <div className="mt-3">
        <label className="block text-xs text-muted" htmlFor={`date-${instrumentId}`}>
          {i.dateLabel}
        </label>
        <input
          id={`date-${instrumentId}`}
          type="date"
          value={dateStr}
          min={todayStr()}
          onChange={(e) => {
            setDateStr(e.target.value || todayStr());
            setAnchor(null);
            setTarget(null);
            setHover(null);
          }}
          className="mt-1 border border-line px-3 py-1.5 text-sm outline-none focus:border-line-strong"
        />
      </div>

      {/* 整點空檔(全天 24 小時):點起點 → 移到終點 → 再點一下即選定連續範圍 */}
      <p className="mt-3 text-xs text-muted">
        {i.pickHint}
        <span className="ml-1 inline-flex items-center gap-1">
          <span className="inline-block h-3 w-3 border border-green-600 bg-green-100 align-middle" />
          {i.mineLegend}
        </span>
      </p>
      <div
        className="mt-2 grid grid-cols-4 gap-1.5 sm:grid-cols-6 md:grid-cols-8"
        onMouseLeave={() => setHover(null)}
      >
        {Array.from({ length: HOURS_PER_DAY }, (_, h) => h).map((h) => {
          const busyOrPast = isBusy(h) || isPast(h);
          const mine = isBusy(h) && isMine(h);
          const inRange = range != null && h >= range[0] && h <= range[1];
          const isEnd = range != null && (h === range[0] || h === range[1]);
          // 本人預約:綠色標示;其他占用/過去:灰;選取範圍端點=accent 實色、中間=淡色。
          const cls = mine
            ? "cursor-not-allowed border-green-600 bg-green-100 text-green-800"
            : busyOrPast
              ? "cursor-not-allowed border-line bg-foreground/[0.04] text-muted line-through"
              : inRange && isEnd
                ? "border-accent bg-accent/25 font-semibold text-foreground"
                : inRange
                  ? "border-accent/60 bg-accent/10 text-foreground"
                  : "border-line hover:border-line-strong";
          return (
            <button
              key={h}
              type="button"
              disabled={busyOrPast}
              onClick={() => pick(h)}
              onMouseEnter={() => !busyOrPast && setHover(h)}
              className={`border px-1 py-1.5 text-xs tabular-nums ${cls}`}
            >
              {String(h).padStart(2, "0")}:00
            </button>
          );
        })}
      </div>

      {/* 當日預約清單(誰預約了哪個時段) */}
      <div className="mt-4 border-t border-line pt-3">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-muted">
          {i.dayListHeading}
        </h5>
        {dayList.length === 0 ? (
          <p className="mt-1 text-xs text-muted">{i.dayListEmpty}</p>
        ) : (
          <ul className="mt-1 space-y-0.5 text-xs">
            {dayList.map((d) => (
              <li key={d.key} className={d.mine ? "text-green-700" : "text-muted"}>
                <span className="tabular-nums">{d.range}</span>
                {d.name ? <span className="ml-2">{d.name}</span> : null}
                {d.mine ? <span className="ml-1">{i.dayListMine}</span> : null}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selStart != null && target != null ? (
        <form action={formAction} className="mt-3 space-y-3">
          <input type="hidden" name="instrumentId" value={instrumentId} />
          <input type="hidden" name="startAt" value={startISO} />
          <input type="hidden" name="hours" value={hours} />
          <p className="text-sm">
            {fill(i.selected, {
              range: `${String(range![0]).padStart(2, "0")}:00–${String(
                range![1] + 1,
              ).padStart(2, "0")}:00`,
              hours,
            })}
          </p>
          <div>
            <label className="block text-xs text-muted" htmlFor={`note-${instrumentId}`}>
              {i.noteOptional}
            </label>
            <textarea
              id={`note-${instrumentId}`}
              name="note"
              rows={2}
              maxLength={500}
              placeholder={i.notePlaceholder}
              className="mt-1 w-full border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {pending ? i.submitting : fill(i.submit, { hours })}
          </button>
        </form>
      ) : (
        <p className="mt-3 text-xs text-muted">
          {anchor != null ? i.pickEnd : i.pickStart}
        </p>
      )}

      {state && (
        <p className={`mt-2 text-sm ${state.ok ? "text-green-700" : "text-red-600"}`}>
          {state.message}
        </p>
      )}
    </div>
  );
}

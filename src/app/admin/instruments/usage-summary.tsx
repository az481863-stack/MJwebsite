// 儀器「目前使用者 / 下一位使用者」摘要:可縮放(原生 <details>,無需 JS)。
// 不含 hooks,server 與 client 元件皆可使用。

export interface UserSlot {
  who: string; // 顯示名稱(無則 email)
  time: string; // 已格式化的時段字串
  note: string | null;
}

function SlotRow({ label, slot }: { label: string; slot: UserSlot | null }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 rounded bg-foreground/[0.06] px-1.5 py-0.5 text-[11px] font-medium text-muted">
        {label}
      </span>
      {slot ? (
        <div className="min-w-0">
          <p className="font-medium text-foreground">{slot.who}</p>
          <p className="text-muted tabular-nums">{slot.time}</p>
          {slot.note ? (
            <p className="mt-0.5 text-muted">備註:{slot.note}</p>
          ) : null}
        </div>
      ) : (
        <span className="text-muted">無</span>
      )}
    </div>
  );
}

export function UsageSummary({
  current,
  next,
}: {
  current: UserSlot | null;
  next: UserSlot | null;
}) {
  return (
    <details className="group mt-2">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 text-xs text-muted">
        <span className="transition-transform group-open:rotate-90">▸</span>
        <span>使用狀況</span>
        <span
          className={`rounded px-1.5 py-0.5 text-[11px] font-medium ${
            current
              ? "bg-green-100 text-green-800"
              : "bg-foreground/[0.06] text-muted"
          }`}
        >
          {current ? "使用中" : "目前空閒"}
        </span>
      </summary>
      <div className="mt-2 space-y-2 border-l-2 border-line pl-3 text-xs">
        <SlotRow label="目前使用" slot={current} />
        <SlotRow label="下一位" slot={next} />
      </div>
    </details>
  );
}

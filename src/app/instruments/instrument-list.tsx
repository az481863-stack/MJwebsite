"use client";

// 儀器清單 + 搜尋框(client)。
// - 資料量小(15~20 台),server 一次全載、瀏覽器端篩,零延遲、不重打 DB。
// - 搜尋框初值讀 URL 的 ?q=(供實驗室小幫手深連結:使用者問到某台儀器→給 /instruments?q=名稱)。
//   進來帶 q 時自動捲到並高亮第一台符合的儀器。
// - 篩選比對名稱(中/英)與用途(中/英),不分大小寫。

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import { InstrumentCard } from "./instrument-card";
import { InstrumentBooking } from "./instrument-booking";

export interface InstrumentItem {
  id: string;
  name: string;
  nameEn: string | null;
  purpose: string;
  purposeEn: string | null;
  photoUrl: string | null;
  maintenance: boolean;
  busy: { start: string; end: string }[];
  disabled: boolean;
  disabledReason?: string;
}

function matches(inst: InstrumentItem, q: string): boolean {
  const hay = [inst.name, inst.nameEn, inst.purpose, inst.purposeEn]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q.toLowerCase());
}

export function InstrumentList({ instruments }: { instruments: InstrumentItem[] }) {
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") ?? "";
  const [q, setQ] = useState(initialQ);
  const firstMatchRef = useRef<HTMLDivElement | null>(null);

  const query = q.trim();
  const filtered = useMemo(
    () => (query ? instruments.filter((i) => matches(i, query)) : instruments),
    [instruments, query],
  );

  // 進頁時若帶 ?q=,自動捲到第一台符合的儀器(僅首次)。
  useEffect(() => {
    if (initialQ.trim() && firstMatchRef.current) {
      firstMatchRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const en = lang === "en";
  const highlight = query.length > 0;

  return (
    <>
      <div className="mt-8 flex items-center gap-2">
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={en ? "Search instruments…" : "搜尋儀器(名稱或用途)…"}
          aria-label={en ? "Search instruments" : "搜尋儀器"}
          className="w-full max-w-sm border border-line px-3 py-2 text-sm outline-none focus:border-line-strong"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="text-xs text-muted underline-offset-4 hover:underline"
          >
            {en ? "Clear" : "清除"}
          </button>
        )}
      </div>

      <section className="mt-6 space-y-8">
        {filtered.map((inst, idx) => (
          <div
            key={inst.id}
            ref={highlight && idx === 0 ? firstMatchRef : undefined}
            className={`border p-5 ${
              highlight ? "border-accent" : "border-line"
            }`}
          >
            <InstrumentCard
              name={inst.name}
              nameEn={inst.nameEn}
              maintenance={inst.maintenance}
              photoUrl={inst.photoUrl}
              purpose={inst.purpose}
              purposeEn={inst.purposeEn}
            />
            <InstrumentBooking
              instrumentId={inst.id}
              busy={inst.busy}
              disabled={inst.disabled}
              disabledReason={inst.disabledReason}
            />
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted">
            {query
              ? en
                ? `No instruments match “${query}”.`
                : `找不到符合「${query}」的儀器。`
              : en
                ? "No instruments available yet."
                : "目前尚無可預約的儀器。"}
          </p>
        )}
      </section>
    </>
  );
}

"use client";

// 日期 filter:選日期即以 ?date=YYYY-MM-DD 重新導向(保留 pathname)。

import { useRouter, usePathname } from "next/navigation";

export function DateFilter({ date }: { date: string }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 text-sm text-muted">
      日期
      <input
        type="date"
        defaultValue={date}
        onChange={(e) => {
          const v = e.target.value;
          if (v) router.push(`${pathname}?date=${v}`);
        }}
        className="rounded-sm border border-line bg-background px-2 py-1 text-sm text-foreground"
      />
    </label>
  );
}

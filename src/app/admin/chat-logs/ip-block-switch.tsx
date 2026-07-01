"use client";

// IP 封鎖開關:預設「開」(小幫手可見)。關掉 = 封鎖該 IP,進站看不到小幫手。
// 呼叫 toggleIpBlock server action;樂觀更新 + 失敗回滾。

import { useState, useTransition } from "react";
import { toggleIpBlock } from "./actions";

export function IpBlockSwitch({
  ipHash,
  initialBlocked,
}: {
  ipHash: string;
  initialBlocked: boolean;
}) {
  // UI 以「開=可見」為直覺,故 on = 未封鎖。
  const [on, setOn] = useState(!initialBlocked);
  const [pending, startTransition] = useTransition();

  function handle() {
    const next = !on;
    setOn(next); // 樂觀更新
    startTransition(async () => {
      const res = await toggleIpBlock(ipHash, !next); // blocked = !on
      if (!res.ok) {
        setOn(!next); // 回滾
        alert(res.message ?? "更新失敗");
      }
    });
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={on ? "小幫手開啟中,點擊封鎖此 IP" : "此 IP 已封鎖,點擊恢復"}
      disabled={pending}
      onClick={handle}
      title={on ? "小幫手:開啟(點擊封鎖此 IP)" : "小幫手:已封鎖(點擊恢復)"}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
        on ? "bg-accent" : "bg-foreground/20"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          on ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

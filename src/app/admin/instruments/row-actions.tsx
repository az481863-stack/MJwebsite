"use client";

// 儀器管理頁的互動按鈕:改機況、代簽、刪除儀器。
// 皆走 server action(回傳 ActionResult);成功後以 router.refresh() 重抓。

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/components/admin/form-kit";
import {
  setInstrumentStatus,
  proxyCheckout,
  softDeleteInstrument,
} from "./actions";

function useRefreshOnOk(state: ActionResult | null) {
  const router = useRouter();
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);
}

// 改機況:NORMAL ↔ MAINTENANCE。
export function StatusControl({
  instrumentId,
  status,
}: {
  instrumentId: string;
  status: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    setInstrumentStatus,
    null,
  );
  useRefreshOnOk(state);
  const next = status === "MAINTENANCE" ? "NORMAL" : "MAINTENANCE";
  const label = status === "MAINTENANCE" ? "設為 🟢 正常運行" : "設為 🟡 維護中";
  return (
    <form action={formAction} className="inline">
      <input type="hidden" name="id" value={instrumentId} />
      <input type="hidden" name="status" value={next} />
      <button
        type="submit"
        disabled={pending}
        className="border border-line-strong px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {pending ? "更新中…" : label}
      </button>
      {state && !state.ok && <span className="ml-2 text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

// 代簽:對使用中/逾時紀錄代為簽退結案。
export function ProxyCheckoutButton({ reservationId }: { reservationId: string }) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    proxyCheckout,
    null,
  );
  useRefreshOnOk(state);
  return (
    <form
      action={formAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("確定代為簽退結案?機況將預設為正常、不發警報。")) e.preventDefault();
      }}
    >
      <input type="hidden" name="reservationId" value={reservationId} />
      <button
        type="submit"
        disabled={pending}
        className="border border-line-strong px-3 py-1 text-xs font-medium transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
      >
        {pending ? "處理中…" : "代簽結案"}
      </button>
      {state && !state.ok && <span className="ml-2 text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

// 刪除儀器(軟刪除,限 ADMIN)。
export function DeleteInstrumentButton({ instrumentId }: { instrumentId: string }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    softDeleteInstrument,
    null,
  );
  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);
  return (
    <form
      action={formAction}
      className="inline"
      onSubmit={(e) => {
        if (!confirm("確定刪除此儀器?")) e.preventDefault();
      }}
    >
      <input type="hidden" name="id" value={instrumentId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-muted underline-offset-4 hover:text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "刪除中…" : "刪除"}
      </button>
      {state && !state.ok && <span className="ml-2 text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

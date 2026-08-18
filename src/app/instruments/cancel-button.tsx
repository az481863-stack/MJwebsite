"use client";

// 提前取消預約按鈕(僅 BOOKED 且未開始)。

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/context";
import type { ActionResult } from "@/components/admin/form-kit";
import { cancelReservation } from "./actions";

export function CancelButton({ reservationId }: { reservationId: string }) {
  const { t } = useLanguage();
  const i = t.instruments;
  const router = useRouter();
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    cancelReservation,
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
        if (!confirm(i.cancelConfirm)) e.preventDefault();
      }}
    >
      <input type="hidden" name="reservationId" value={reservationId} />
      <button
        type="submit"
        disabled={pending}
        className="text-xs text-muted underline-offset-4 hover:text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? i.cancelling : i.cancel}
      </button>
      {state && !state.ok && <span className="ml-2 text-xs text-red-600">{state.message}</span>}
    </form>
  );
}

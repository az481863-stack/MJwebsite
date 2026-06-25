"use client";

// QR 簽退表單(手機網頁):確認時數 + 強制機況回報(🟢/🟡/🔴)+ 異常描述(無拍照)。

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import type { ActionResult } from "@/components/admin/form-kit";
import { selfCheckout } from "@/app/instruments/actions";

export function CheckoutForm({
  reservationId,
  defaultHours,
}: {
  reservationId: string;
  defaultHours: number;
}) {
  const router = useRouter();
  const [condition, setCondition] = useState("NORMAL");
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    selfCheckout,
    null,
  );

  if (state?.ok) {
    return (
      <div className="border border-line p-5">
        <p className="text-sm">{state.message}</p>
        <button
          onClick={() => router.push("/instruments")}
          className="mt-4 bg-foreground px-4 py-2 text-sm font-medium text-background"
        >
          回儀器頁
        </button>
      </div>
    );
  }

  const options = [
    { v: "NORMAL", label: "🟢 正常" },
    { v: "UNSTABLE", label: "🟡 異音不穩" },
    { v: "BROKEN", label: "🔴 故障" },
  ];

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="reservationId" value={reservationId} />

      <div>
        <label className="block text-sm font-medium" htmlFor="hours">
          確認使用時數(小時)
        </label>
        <input
          id="hours"
          name="hours"
          type="number"
          min={1}
          defaultValue={defaultHours}
          required
          className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
        />
      </div>

      <fieldset>
        <legend className="text-sm font-medium">機況回報(必填)</legend>
        <div className="mt-2 space-y-2">
          {options.map((o) => (
            <label key={o.v} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name="condition"
                value={o.v}
                checked={condition === o.v}
                onChange={(e) => setCondition(e.target.value)}
                required
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {condition !== "NORMAL" && (
        <div>
          <label className="block text-sm font-medium" htmlFor="anomalyNote">
            異常描述
          </label>
          <textarea
            id="anomalyNote"
            name="anomalyNote"
            rows={3}
            placeholder="請描述異常狀況,將立即通知負責人與教授。"
            className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
        </div>
      )}

      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-foreground py-3 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "送出中…" : "確認簽退"}
      </button>
    </form>
  );
}

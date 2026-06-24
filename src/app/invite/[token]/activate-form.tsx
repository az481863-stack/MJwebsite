"use client";

// 啟用表單:設定登入密碼。成功後 server action 會自動登入並導向 /account。

import { useActionState } from "react";
import { activateAccount, type ActivateResult } from "./actions";

export function ActivateForm({
  token,
  email,
}: {
  token: string;
  email: string;
}) {
  const [state, formAction, pending] = useActionState<
    ActivateResult | null,
    FormData
  >(activateAccount, null);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">啟用帳號</h1>
      <p className="mt-2 text-sm text-muted">
        帳號 <span className="font-medium text-foreground">{email}</span>
        ,請設定登入密碼。
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <input type="hidden" name="token" value={token} />
        <div>
          <label className="block text-sm font-medium" htmlFor="password">
            密碼(至少 8 字元)
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
        </div>
        <div>
          <label className="block text-sm font-medium" htmlFor="confirm">
            再次輸入密碼
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
        </div>

        {state && !state.ok && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full bg-foreground py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
        >
          {pending ? "啟用中…" : "設定密碼並啟用"}
        </button>
      </form>
    </div>
  );
}

"use client";

// 首位最高權限者建立表單。成功後 server action 會自動登入並導向 /account。

import { useActionState } from "react";
import { createFirstSuperadmin, type SetupResult } from "./actions";

export function SetupForm() {
  const [state, formAction, pending] = useActionState<
    SetupResult | null,
    FormData
  >(createFirstSuperadmin, null);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">初始設定</h1>
      <p className="mt-2 text-sm text-muted">
        建立第一位最高權限者(教授/大助教)。完成後此頁將自動失效。
      </p>

      <form action={formAction} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
        </div>
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
        <div>
          <label className="block text-sm font-medium" htmlFor="secret">
            設定密語(SETUP_SECRET)
          </label>
          <input
            id="secret"
            name="secret"
            type="password"
            required
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
          {pending ? "建立中…" : "建立最高權限者"}
        </button>
      </form>
    </div>
  );
}

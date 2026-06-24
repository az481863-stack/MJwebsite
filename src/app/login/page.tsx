"use client";

// 登入頁:密碼登入(server action)+ Google 登入(client OAuth)。
// 後台/帳號相關頁面以中文為主(內部使用者),不走前台語系切換。

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Container } from "@/components/ui/Container";
import { signInWithPassword, type LoginResult } from "./actions";

function LoginInner() {
  const params = useSearchParams();
  const urlError = params.get("error");
  const [state, formAction, pending] = useActionState<
    LoginResult | null,
    FormData
  >(signInWithPassword, null);

  const signInGoogle = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/account`,
      },
    });
  };

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight">登入</h1>
        <p className="mt-2 text-sm text-muted">光電物理實驗室 成員專用</p>

        {urlError && (
          <p className="mt-4 border border-line bg-foreground/[0.03] p-3 text-sm text-foreground">
            {urlError === "not_member"
              ? "此 Google 帳號尚未連結任何會員,請先以密碼登入並於帳號頁連結 Google。"
              : "登入過程發生問題,請再試一次。"}
          </p>
        )}

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
              密碼
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
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
            {pending ? "登入中…" : "登入"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-line" />
          或
          <span className="h-px flex-1 bg-line" />
        </div>

        <button
          type="button"
          onClick={signInGoogle}
          className="w-full border border-line-strong py-2.5 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
        >
          使用 Google 登入
        </button>

        <p className="mt-6 text-center text-xs text-muted">
          尚未啟用帳號?請點擊邀請信中的連結完成設定。
        </p>
        <p className="mt-2 text-center text-xs">
          <Link href="/" className="text-muted underline-offset-4 hover:underline">
            返回首頁
          </Link>
        </p>
      </div>
    </Container>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}

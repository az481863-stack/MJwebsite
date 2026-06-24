"use client";

// 會員 info 頁的互動區塊:改密碼、常用 email 管理、Google 連結、登出。

import { useActionState, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/login/actions";
import {
  addContactEmail,
  changePassword,
  removeContactEmail,
  type ActionResult,
} from "./actions";

function Msg({ state }: { state: ActionResult | null }) {
  if (!state) return null;
  return (
    <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
      {state.message}
    </p>
  );
}

export function AccountView({
  loginEmail,
  roleLabel,
  isAdmin,
  contactEmails,
  hasGoogle,
  welcome,
}: {
  loginEmail: string;
  roleLabel: string;
  isAdmin: boolean;
  contactEmails: { id: string; email: string }[];
  hasGoogle: boolean;
  welcome: boolean;
}) {
  const [pwState, pwAction, pwPending] = useActionState<
    ActionResult | null,
    FormData
  >(changePassword, null);
  const [addState, addAction, addPending] = useActionState<
    ActionResult | null,
    FormData
  >(addContactEmail, null);
  const [rmState, rmAction] = useActionState<ActionResult | null, FormData>(
    removeContactEmail,
    null,
  );
  const [googleErr, setGoogleErr] = useState<string | null>(null);

  const linkGoogle = async () => {
    setGoogleErr(null);
    const supabase = createClient();
    const { error } = await supabase.auth.linkIdentity({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/account` },
    });
    if (error) setGoogleErr("連結 Google 失敗,請確認 Supabase 已啟用手動連結。");
  };

  const unlinkGoogle = async () => {
    setGoogleErr(null);
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUserIdentities();
    const google = data?.identities?.find((i) => i.provider === "google");
    if (error || !google) {
      setGoogleErr("找不到 Google 連結。");
      return;
    }
    const { error: unErr } = await supabase.auth.unlinkIdentity(google);
    if (unErr) {
      setGoogleErr("解除連結失敗,帳號至少需保留一種登入方式。");
      return;
    }
    window.location.reload();
  };

  return (
    <div className="space-y-12">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">會員資料</h1>
          <p className="mt-1 text-sm text-muted">
            {loginEmail} · {roleLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <a
              href="/admin/members"
              className="text-sm text-muted underline-offset-4 hover:text-foreground hover:underline"
            >
              會員管理
            </a>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="border border-line px-3 py-1.5 text-sm transition-colors hover:bg-foreground hover:text-background"
            >
              登出
            </button>
          </form>
        </div>
      </header>

      {welcome && (
        <p className="border border-line bg-foreground/[0.03] p-4 text-sm">
          帳號已啟用!你可以在下方連結 Google 帳號,之後即可用 Google 登入(也可略過,維持密碼登入)。
        </p>
      )}

      {/* 變更密碼 */}
      <section className="border-t border-line pt-8">
        <h2 className="text-lg font-semibold">變更密碼</h2>
        <form action={pwAction} className="mt-4 max-w-sm space-y-4">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="新密碼(至少 8 字元)"
            autoComplete="new-password"
            className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            placeholder="再次輸入新密碼"
            autoComplete="new-password"
            className="w-full border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
          <Msg state={pwState} />
          <button
            type="submit"
            disabled={pwPending}
            className="bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
          >
            {pwPending ? "更新中…" : "更新密碼"}
          </button>
        </form>
      </section>

      {/* Google 連結 */}
      <section className="border-t border-line pt-8">
        <h2 className="text-lg font-semibold">Google 登入</h2>
        <p className="mt-1 text-sm text-muted">
          {hasGoogle
            ? "已連結 Google 帳號,可用 Google 登入。"
            : "尚未連結。連結後即可用 Google 一鍵登入。"}
        </p>
        {googleErr && <p className="mt-2 text-sm text-red-600">{googleErr}</p>}
        <button
          type="button"
          onClick={hasGoogle ? unlinkGoogle : linkGoogle}
          className="mt-4 border border-line-strong px-5 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background"
        >
          {hasGoogle ? "解除 Google 連結" : "連結 Google 帳號"}
        </button>
      </section>

      {/* 常用 email(多筆) */}
      <section className="border-t border-line pt-8">
        <h2 className="text-lg font-semibold">常用 email</h2>
        <p className="mt-1 text-sm text-muted">
          可新增多個常用聯絡 email(與登入 email 分開)。
        </p>

        {contactEmails.length > 0 && (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {contactEmails.map((e) => (
              <li
                key={e.id}
                className="flex items-center justify-between py-3"
              >
                <span className="text-sm">{e.email}</span>
                <form action={rmAction}>
                  <input type="hidden" name="id" value={e.id} />
                  <button
                    type="submit"
                    className="text-sm text-muted underline-offset-4 hover:text-red-600 hover:underline"
                  >
                    移除
                  </button>
                </form>
              </li>
            ))}
          </ul>
        )}

        <form action={addAction} className="mt-4 flex max-w-sm gap-2">
          <input
            name="email"
            type="email"
            required
            placeholder="新增常用 email"
            className="flex-1 border border-line px-3 py-2.5 text-sm outline-none focus:border-line-strong"
          />
          <button
            type="submit"
            disabled={addPending}
            className="shrink-0 border border-line-strong px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground hover:text-background disabled:opacity-50"
          >
            新增
          </button>
        </form>
        <div className="mt-2">
          <Msg state={addState} />
          <Msg state={rmState} />
        </div>
      </section>
    </div>
  );
}

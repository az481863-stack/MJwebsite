// 一次性設定頁:建立首位最高權限者。已有最高權限者時自動失效。

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { hasSuperadmin } from "./actions";
import { SetupForm } from "./setup-form";

// 必須每次請求即時判斷是否已有最高權限者(勿在 build 期凍結結果)。
export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const done = await hasSuperadmin();

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        {done ? (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              系統已完成初始設定
            </h1>
            <p className="mt-3 text-sm text-muted">
              已存在最高權限者,此頁已失效。請改由登入頁進入。
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:underline"
            >
              前往登入
            </Link>
          </div>
        ) : (
          <SetupForm />
        )}
      </div>
    </Container>
  );
}

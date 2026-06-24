// 啟用頁:驗證邀請 token,有效則顯示設定密碼表單,無效則提示。

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { lookupInvitation } from "./actions";
import { ActivateForm } from "./activate-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await lookupInvitation(token);

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        {invitation ? (
          <ActivateForm token={token} email={invitation.email} />
        ) : (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              連結無效或已過期
            </h1>
            <p className="mt-3 text-sm text-muted">
              此邀請連結無效、已被使用或已過期。請向管理員索取新的邀請連結。
            </p>
            <Link
              href="/"
              className="mt-6 inline-block text-sm text-muted underline-offset-4 hover:underline"
            >
              返回首頁
            </Link>
          </div>
        )}
      </div>
    </Container>
  );
}

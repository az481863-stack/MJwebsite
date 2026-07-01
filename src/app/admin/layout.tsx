// 後台共用版型:需登入。側邊導覽依角色顯示可用項目。
// 後台一律中文(內部使用者),不走前台語系切換。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { managedInstrumentIds } from "@/lib/instruments";
import { isAiEnabled } from "@/lib/ai/gemini";
import { Container } from "@/components/ui/Container";
import { AdminSidebar } from "./admin-sidebar";
import { AdminChatWidget } from "@/components/AdminChatWidget";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getCurrentMember();
  if (!me) redirect("/login");

  // 負責人(即使是學生)可進入儀器管理頁(B-2)。
  const canManageInstruments =
    roleAtLeast(me.role, "ADMIN") || (await managedInstrumentIds(me.id)).length > 0;

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <AdminSidebar role={me.role} canManageInstruments={canManageInstruments} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
      {/* 管理員小幫手:掛在所有後台頁,依「使用說明」內容回答(僅 ADMIN + 有 AI 金鑰) */}
      {isAiEnabled() && roleAtLeast(me.role, "ADMIN") && <AdminChatWidget />}
    </Container>
  );
}

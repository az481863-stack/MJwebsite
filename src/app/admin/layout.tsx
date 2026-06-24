// 後台共用版型:需登入。側邊導覽依角色顯示可用項目。
// 後台一律中文(內部使用者),不走前台語系切換。

import { redirect } from "next/navigation";
import { getCurrentMember } from "@/lib/auth";
import { Container } from "@/components/ui/Container";
import { AdminSidebar } from "./admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getCurrentMember();
  if (!me) redirect("/login");

  return (
    <Container className="py-10">
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-12">
        <AdminSidebar role={me.role} />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </Container>
  );
}

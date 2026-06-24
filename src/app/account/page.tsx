// 會員 info 頁(C-5):需登入。載入會員、常用 email、Google 連結狀態。

import { redirect } from "next/navigation";
import { getAuthUser, getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { AccountView } from "./account-view";

const ROLE_LABEL: Record<string, string> = {
  STUDENT: "學生",
  ADMIN: "管理員",
  SUPERADMIN: "最高權限者",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string }>;
}) {
  const member = await getCurrentMember();
  if (!member) redirect("/login");

  const [emails, user, sp] = await Promise.all([
    prisma.contactEmail.findMany({
      where: { memberId: member.id },
      orderBy: { createdAt: "asc" },
    }),
    getAuthUser(),
    searchParams,
  ]);

  const hasGoogle = !!user?.identities?.some((i) => i.provider === "google");

  return (
    <Container className="max-w-2xl py-16">
      <AccountView
        loginEmail={member.loginEmail}
        roleLabel={ROLE_LABEL[member.role] ?? member.role}
        isAdmin={member.role === "ADMIN" || member.role === "SUPERADMIN"}
        contactEmails={emails.map((e) => ({ id: e.id, email: e.email }))}
        hasGoogle={hasGoogle}
        welcome={sp?.welcome === "1"}
      />
    </Container>
  );
}
